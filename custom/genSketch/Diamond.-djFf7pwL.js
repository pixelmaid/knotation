module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: -2000, max: 2000});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: -2000, max: 2000});

  const dimNIn = node.in("dimensions (n x n)", 4, {precision: 0, min: 4, max: 20});

  const vRepIn = node.in("vertial repeat", 1, {precision: 0, min: 0});
  const vOverlapIn = node.in('vertical overlap', false);
  const hRepIn = node.in("horizontal repeat", 1, {precision: 0, min: 0});
  // const lRepIn = node.in("expand left", 1, {precision: 0, min: 0});
  const hOverlapIn = node.in('horizontal overlap', false);

  const motifOut = node.out("motifOut");

  const colorsIn = [];
  let colorCounts = 0;

  // import classes
  const { Knot } = graph.k;
  const { Chain } = graph.c;
  const { DiamondObj } = graph.dmndObj;


  node.onReady = () => {
    for (; colorCounts < dimNIn.value;){
      let s = "color " + colorCounts;
      colorsIn.push(node.in(s, [1, 1, 1, 1], {type: "color"}));
      colorCounts++;
    }
  };


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

  function produceVRep(acc_motifArr,nIn, vRep, vOverlap, sliced_chains) {
    for (let rep = 0; rep < vRep; rep++) {
      let vRepDiamond = new DiamondObj(nIn, sliced_chains);
      let nextArr = vRepDiamond.motifArr;
      if (vOverlap) {
        acc_motifArr = acc_motifArr.slice(0, acc_motifArr.length - 1);
        acc_motifArr = acc_motifArr.concat(nextArr);
      }
      else {
        let gap = new Array(acc_motifArr[0].length).fill(0);
        acc_motifArr = acc_motifArr.concat([gap], nextArr);
      }
    }
    return acc_motifArr;
  }

  function fillVRep3(acc_motifArr,nIn, vRep, sliced_chains) {
    for (let rep = 0; rep < vRep; rep++) {
      let vRepDiamond = new DiamondObj(nIn, sliced_chains);
      let nextArr = vRepDiamond.motifArr;

      let gap = new Array(acc_motifArr[0].length).fill(0);
      acc_motifArr = acc_motifArr.concat([gap], [gap], [gap], nextArr);

    }
    return acc_motifArr;
  }

  
	triggerIn.onTrigger = (props) => {
    // ---------------------
    let xPos = xPosIn.value;
    let yPos = yPosIn.value;
    
    const nIn = dimNIn.value;
    const vRep = vRepIn.value;
    const vOverlap = vOverlapIn.value;
    const hRep = hRepIn.value;
    const hOverlap = hOverlapIn.value;

    const chains = [];

    // prep chains
    for (let rep = 0; rep < hRep + 1; rep++) {
      for (let i = 0; i < nIn; i++) {
        let currColor = (colorsIn[i] == null) ? getHex("#FFFFFF") : getHex(colorsIn[i].value);
        let idx = i + rep * (nIn*2);
        chains.push(new Chain(idx, currColor));
      }
      for (let i = nIn, j = 1; i < nIn * 2; i++, j++) {
        let currColor = (colorsIn[colorsIn.length-j] == null) ? getHex("#FFFFFF") : getHex(colorsIn[colorsIn.length-j].value);
        let idx = i + rep * (nIn * 2);
        chains.push(new Chain(idx, currColor));
      }
    }

    // ----------
    let singleDiamond = new DiamondObj(nIn, chains.slice(0, nIn * 2));
    let motifArr = singleDiamond.motifArr;
    //vertical rep
    motifArr = produceVRep(motifArr, nIn, vRep, vOverlap, chains.slice(0, nIn * 2));

    var nFill;
    if (!vOverlap && !hOverlap) {
      nFill = nIn;
    }
    else if (vOverlap && hOverlap) {
      nFill = nIn - 2;
    }
    else {
      nFill = nIn - 1;
    }
    // horizontal rep
    for (let rep = 1; rep < hRep + 1; rep++) {

      if (!vOverlap && !hOverlap) {
        let hrDiamond = new DiamondObj(nIn, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        let hrmotifArr = hrDiamond.motifArr;

        hrmotifArr = produceVRep(hrmotifArr, nIn, vRep, vOverlap, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        for (let x = 0; x < motifArr.length; x++) {
          motifArr[x] = motifArr[x].concat([0], hrmotifArr[x]);
        }

        if (vRep > 0) {
          let fillDiamond = new DiamondObj(nFill, chains.slice(nIn + (rep-1) * (nIn * 2), nIn + rep * (nIn * 2)));
          let fillMotifArr = fillDiamond.motifArr;

          fillMotifArr = produceVRep(fillMotifArr, nFill, (vRep-1), vOverlap, chains.slice(nIn + (rep-1) * (nIn * 2), nIn + rep * (nIn * 2)));
          for (let xFill = 0; xFill < fillMotifArr.length; xFill++) {
            let x = nIn + xFill;
            for (let yFill = 0; yFill < fillMotifArr[0].length; yFill++) {
              let y = nIn + (rep-1) * nIn * 2 + yFill;
              if (fillMotifArr[xFill][yFill] != 0) {
                motifArr[x][y] = fillMotifArr[xFill][yFill];
              }
            }
          }
        }

      }

      else if (vOverlap && hOverlap) {
        let hrDiamond = new DiamondObj(nIn, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        let hrmotifArr = hrDiamond.motifArr;

        hrmotifArr = produceVRep(hrmotifArr, nIn, vRep, vOverlap, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        for (let x = 0; x < motifArr.length; x++) {
          motifArr[x] = motifArr[x].concat(hrmotifArr[x].slice(1));
        }

        if (vRep > 0) {
          let fillDiamond = new DiamondObj(nFill, chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          let fillMotifArr = fillDiamond.motifArr;

          fillMotifArr = fillVRep3(fillMotifArr, nFill, (vRep-1), chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          for (let xFill = 0; xFill < fillMotifArr.length; xFill++) {
            let x = nIn + 1 + xFill;
            for (let yFill = 0; yFill < fillMotifArr[0].length; yFill++) {
              let y = nIn + 1 + (rep-1) * (nIn * 2 - 2) + yFill;
              if (fillMotifArr[xFill][yFill] != 0) {
                motifArr[x][y] = fillMotifArr[xFill][yFill];
              }
            }
          }
        }
      }

      else if (vOverlap && !hOverlap) {
        let hrDiamond = new DiamondObj(nIn, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        let hrmotifArr = hrDiamond.motifArr;

        hrmotifArr = produceVRep(hrmotifArr, nIn, vRep, vOverlap, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        for (let x = 0; x < motifArr.length; x++) {
          motifArr[x] = motifArr[x].concat([0], hrmotifArr[x]);
        }

        if (vRep > 0) {
          let fillDiamond = new DiamondObj(nFill, chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          let fillMotifArr = fillDiamond.motifArr;

          fillMotifArr = produceVRep(fillMotifArr, nFill, (vRep-1), false, chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          for (let xFill = 0; xFill < fillMotifArr.length; xFill++) {
            let x = nIn + xFill;
            for (let yFill = 0; yFill < fillMotifArr[0].length; yFill++) {
              let y = nIn + 1 + (rep-1) * (nIn * 2) + yFill;
              if (fillMotifArr[xFill][yFill] != 0) {
                motifArr[x][y] = fillMotifArr[xFill][yFill];
              }
            }
          }
        }
      }

      else {
        // !vOverlap && hOverlap
        let hrDiamond = new DiamondObj(nIn, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        let hrmotifArr = hrDiamond.motifArr;

        hrmotifArr = produceVRep(hrmotifArr, nIn, vRep, vOverlap, chains.slice(rep * (nIn * 2), (rep + 1) * (nIn * 2)));
        for (let x = 0; x < motifArr.length; x++) {
          motifArr[x] = motifArr[x].concat(hrmotifArr[x].slice(1));
        }

        if (vRep > 0) {
          let fillDiamond = new DiamondObj(nFill, chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          let fillMotifArr = fillDiamond.motifArr;

          fillMotifArr = fillVRep3(fillMotifArr, nFill, (vRep-1), chains.slice(nFill + (rep-1) * (nIn * 2), nFill + rep * (nIn * 2)));
          for (let xFill = 0; xFill < fillMotifArr.length; xFill++) {
            let x = nIn + 1 + xFill;
            for (let yFill = 0; yFill < fillMotifArr[0].length; yFill++) {
              let y = nIn + (rep-1) * (nIn * 2 - 2) + yFill;
              if (fillMotifArr[xFill][yFill] != 0) {
                motifArr[x][y] = fillMotifArr[xFill][yFill];
              }
            }
          }
        }
      }

    }



    // reassign chains
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

    motifOut.setValue(motifArr);


    triggerOut.trigger({
      nIn,
      motifArr,
      chains,
      xPos,
      yPos,
      ...props
    });
	};


};
