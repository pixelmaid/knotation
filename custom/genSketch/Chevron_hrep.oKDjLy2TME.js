module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: -2000, max: 2000});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: -2000, max: 2000});

  const numForwardIn = node.in("#forward", 4, {precision: 0, min: 1, max: 20});
  // const numBackwardIn = node.in("#backward", 4, {precision: 0, min: 1, max: 20});

  const vRepIn = node.in("vertical repetition", 0, {precision: 0, min: 0});
  const hRepIn = node.in("horizontal repetition", 0, {precision: 0, min: 0});

  const motifOut = node.out("motifOut");

  

  const { Knot } = graph.k || {};
  const { Chain } = graph.c || {};
  const { ChevronObj } = graph.cObj;


  var colorsIn = [];
  var colorCounts;

  node.onReady = () => {
    for (colorCounts = 0; colorCounts < numForwardIn.value + numForwardIn.value; colorCounts++){
      let s = "color " + colorCounts;
      colorsIn.push(node.in(s, [1, 1, 1, 1], {type: "color"}));
    }
  };

  // numForwardIn.onChange = update;
  // numBackwardIn.onChange = update;

  // ----------
  function seekPrevX(motifArr, currX, y) {
    currX -= 1;
    while (currX >= 0) {
      if (motifArr[currX][y] != 0) {
        return currX
      }
      currX --;
    }
    // no prev x
    //should be impossible case
    return -1;
  }

  function produceVRep(acc_motifArr, numF, numB, vRep, sliced_chains) {
    for (let rep = 0; rep < vRep; rep++) {
      let vRepChevron = new ChevronObj(numF, numB, sliced_chains);
      let nextArr = vRepChevron.motifArr;

      let nextX = 0;
      for (let currX = 2 + rep*2 ; currX < acc_motifArr.length; currX++, nextX++) {
        for (let y = 0; y < acc_motifArr[0].length; y++) {
          if (acc_motifArr[currX][y] == 0 && nextArr[nextX][y] != 0) {
            acc_motifArr[currX][y] = nextArr[nextX][y];
          }
          // else if (acc_motifArr[currX][y] != 0 && nextArr[nextX][y] != 0) {
          //   node.log("conflict, needs to merge node");
          // }
        }
      }
      acc_motifArr = acc_motifArr.concat(nextArr.slice(nextX));
    }
    return acc_motifArr;
  }

  
	triggerIn.onTrigger = (props) => {
    let prevArr = props.motifArr;
    // ---------------------
    let xPos = xPosIn.value;
    let yPos = yPosIn.value;

    // if (prevArr) {
    //   numF = props.nIn;
    // }
    // else {
      let numF = numForwardIn.value;
      let numB = numForwardIn.value;
    // }

    let vRep = vRepIn.value;
    let hRep = hRepIn.value;

    const chains = [];

    let width = numF + numB;

    // prep chains
    for (let rep = 0; rep < hRep + 1; rep++) {
      for (let i = 0; i < width; i++) {
        let currColor = (colorsIn[i] == null) ? getHex("#FFFFFF") : getHex(colorsIn[i].value);
        let idx = i + rep * width;
        chains.push(new Chain(idx, currColor));
      }
      // for (let i = nIn, j = 1; i < nIn * 2; i++, j++) {
      //   let currColor = (colorsIn[colorsIn.length-j] == null) ? getHex("#FFFFFF") : getHex(colorsIn[colorsIn.length-j].value);
      //   let idx = i + rep * (nIn * 2);
      //   chains.push(new Chain(idx, currColor));
      // }
    }


    // single chevron
    let singleChevron = new ChevronObj(numF, numB, chains.slice(0, numF + numB));
    let motifArr = singleChevron.motifArr;

    // vertical rep
    motifArr = produceVRep(motifArr, numF, numB, vRep, chains.slice(0, numF + numB));

    // horizontal rep
    // force symmetry for consistent horizontal repeats
    for (let rep = 1; rep < hRep+1; rep++) {
      let hrChevron = new ChevronObj(numF, numB, chains.slice(rep * (width), rep * (width) + width));
      let hrmotifArr = hrChevron.motifArr;

      hrmotifArr = produceVRep(hrmotifArr, numF, numB, vRep, chains.slice(rep * (width), rep * (width) + width));
      for (let x = 0; x < motifArr.length; x++) {
        motifArr[x] = motifArr[x].concat(hrmotifArr[x].slice(1));
      }
    }


    let pre = prevArr.slice(0, prevArr.length-(numF - 2));
    let overlap = prevArr.slice(prevArr.length-(numF - 2), prevArr.length)
    motifArr = pre.concat(motifArr);
    for (let x = prevArr.length-(numF - 2); x < prevArr.length; x++) {
      for (let y = 0; y < motifArr[0].length; y++) {
        if (prevArr[x][y] != 0){
          motifArr[x][y] = prevArr[x][y];
        }
      }

    }

    // motifArr = prevArr;

    
    // reassign chains to each knot
    for (let x = 1; x < motifArr.length; x++) {
      for (let y = 0; y < motifArr[0].length; y++) {
        if (motifArr[x][y] != 0) {
          let prevX = seekPrevX(motifArr, x, y);
          let updateInL, updateInR;
          //上outL, 左上outR
          if (y == 0) {
            // let prevX = seekPrevX(motifArr, x, y);
            // node.log(prevX);
            if (prevX == -1) {
              updateInL = motifArr[x][y].inL;
            }
            else{
              updateInL = motifArr[prevX][y].outL;
            }
            if (motifArr[x - 1][y + 1] == 0) {
              // let prevX = seekPrevX(motifArr, x, y);
              if (prevX == -1) {
                updateInR = motifArr[x][y].inR;
              }
              else {
                updateInR = motifArr[prevX][y].outR;
              }
            }
            else {
              updateInR = motifArr[x - 1][y + 1].outL;
            }

          }
          //上outR, 右上outL
          if (y == motifArr[0].length - 1) {
            // let prevX = seekPrevX(motifArr, x, y);
            if (prevX == -1) {
              updateInR = motifArr[x][y].inR;
            }
            else {
              updateInR = motifArr[prevX][y].outR;
            }
            if (motifArr[x - 1][y - 1] == 0) {
              // let prevX = seekPrevX(motifArr, x, y);
              if (prevX == -1) {
                updateInL = motifArr[x][y].inL;
              }
              else {
                updateInL = motifArr[prevX][y].outL;
              }
            }
            else {
              updateInL = motifArr[x - 1][y - 1].outR;
            }

          }

          if (y != 0 && y != motifArr[0].length - 1) {
            if (motifArr[x - 1][y - 1] == 0) {
              // let prevX = seekPrevX(motifArr, x, y);
              if (prevX == -1) {
                updateInL = motifArr[x][y].inL;
              }
              else {
                updateInL = motifArr[prevX][y].outL;
              }
            }
            else {
              updateInL = motifArr[x - 1][y - 1].outR;
            }
            if (motifArr[x - 1][y + 1] == 0) {
              // let prevX = seekPrevX(motifArr, x, y);
              if (prevX == -1) {
                updateInR = motifArr[x][y].inR;
              }
              else {
                updateInR = motifArr[prevX][y].outR;
              }
            }
            else {
              updateInR = motifArr[x - 1][y + 1].outL;
            }
          }
          // node.log(x.toString() + y.toString());
          motifArr[x][y].updateInLR(updateInL, updateInR);

        }
      }
    }

    // const outputArr = () => {
    //   return motifArr;
    // };
    // motifOut.setValue(outputArr);

    // node.log(motifArr[0].length);
    // node.log(motifArr.length);
    var outputArr = motifArr;
    // node.log(motifArr.length);


    triggerOut.trigger({
      outputArr,
      chains,
      xPos,
      yPos,
      ...props
    });
	};


};
