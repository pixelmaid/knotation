module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  var Rainbow = require("rainbowvis.js");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: -2000, max: 2000});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: -2000, max: 2000});

  const numForwardIn = node.in("#forward", 2, {precision: 0, min: 1, max: 20});
  const numBackwardIn = node.in("#backward", 1, {precision: 0, min: 1, max: 20});

  const vRepIn = node.in("vertical repetition", 1, {precision: 0, min: 0});
  // const hRepIn = node.in("horizontal repetition", 1, {precision: 0, min: 0});
  

  const { Knot } = graph.k;
  const { Chain } = graph.c;
  const { ChevronObj } = graph.cObj;



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
        }
      }
      acc_motifArr = acc_motifArr.concat(nextArr.slice(nextX));
    }
    return acc_motifArr;
  }

  
	triggerIn.onTrigger = (props) => {
    // ---------------------
    let xPos = xPosIn.value;
    let yPos = yPosIn.value;

    let numF = numForwardIn.value;
    let numB = numBackwardIn.value;

    let vRep = vRepIn.value;

    var chains = [];
    // for (let i = 0; i < numF + numB; i++) {
    //   let currColor = (colorsIn[i] == null) ? getHex("#FFFFFF") : getHex(colorsIn[i].value);
    //   chains.push(new Chain(i, currColor));
    // }


    var rainbow = new Rainbow();
    rainbow.setSpectrum('red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'purple');
    rainbow.setNumberRange(0, numF+numB-1);


    for (let i = 0; i < (numF + numB); i++) {
      let currColor =  "#" + rainbow.colourAt(i);
      // let currColor = (colorsIn[i] == null) ? getHex("#FFFFFF") : getHex(colorsIn[i].value);
      chains.push(new Chain(i, currColor));
    }

    // single chevron
    let singleChevron = new ChevronObj(numF, numB, chains.slice(0, numF + numB));
    let motifArr = singleChevron.motifArr;

    // vertical rep
    motifArr = produceVRep(motifArr, numF, numB, vRep, chains.slice(0, numF + numB));






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
          // // node.log(x.toString() + y.toString());
          // if (updateInL.getColor() == "#000000") {
          //   // node.log(updateInL.getColor());
          //   updateInL.setColor("#FFFFFF");
          // }
          // if (updateInR.getColor() == "#000000") {
          //   updateInR.setColor("#FFFFFF");
          // }
          motifArr[x][y].updateInLR(updateInL, updateInR);

        }
      }
    }




    triggerOut.trigger({
      motifArr,
      chains,
      xPos,
      yPos,
      ...props
    });
	};


};
