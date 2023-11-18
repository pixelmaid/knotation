module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  // const rOrCIn = node.in('change knots in', 'option 1', { type: 'dropdown', values: ['column', 'row']});
  const colNumIn = node.in("column #", 0, {connectable: false, precision: 0, min: 0});
  // const rowNumIn = node.in("row #", 0, {precision: 0, min: 0});
  const newKnotTypeIn = node.in('change knots to', 'option 1', {connectable: false, type: 'dropdown', values: ['f', 'b', 'fb', 'bf']});
  
  const activateIn = node.in("Activate Module", true, {connectable:false});




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
  
	triggerIn.onTrigger = (props) => {
    if (activateIn.value) {

      var motifArr = props.motifArr;

      // var rOrC = rOrCIn.value;
      var newKnotType = newKnotTypeIn.value;

      // if (rOrC == "column") {
      var colNum = colNumIn.value;

      for (let x = 0; x < motifArr.length; x++) {
        let y = colNum;
        if (motifArr[x][y] != 0){
          motifArr[x][y].setKnotType(newKnotType);
        }
      }
      // }
      
      // if (rOrC == "row") {
      //   var rowNum = rowNumIn.value;

      //   for (let y = 0; y < motifArr[0].length; y++) {
      //     let x = rowNum;
      //     if (motifArr[x][y] != 0){
      //       motifArr[x][y].setKnotType(newKnotType);
      //     }
      //   }
      // }



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
            if (updateInL.getColor() == "#000000") {
              // node.log(updateInL.getColor());
              updateInL.setColor("#FFFFFF");
            }
            if (updateInR.getColor() == "#000000") {
              updateInR.setColor("#FFFFFF");
            }
            motifArr[x][y].updateInLR(updateInL, updateInR);

          }
        }
      }

    }

    triggerOut.trigger({
      motifArr,
      ...props
    });
	};


};
