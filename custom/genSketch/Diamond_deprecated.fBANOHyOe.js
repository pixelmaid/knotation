module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: 1, max: 500});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: 1, max: 500});

  const dimNIn = node.in("larger diamond N", 2, {precision: 0, min: 2, max: 20});

  const colorsIn = [];
  let colorCounts = 0;

  const interval = 20;

  // import custom classes
  const { Knot } = graph.k;
  const { Chain } = graph.c;

  node.onReady = () => {
    // node.log("diamond ready");
    for (; colorCounts < dimNIn.value;){
      // colorCounts++;
      let s = "color " + colorCounts;
      colorsIn.push(node.in(s, [1, 1, 1, 1], {type: "color"}));
      colorCounts++;
    }
  };

  
	triggerIn.onTrigger = (props) => {
		const { ctx, canvas } = props;

    // ---------------------
    let xPos = xPosIn.value;
    let yPos = yPosIn.value;
    
    const nIn = dimNIn.value;

    const chains = [];
    
    // create 2D array to store motif's knot information
    let motifArr = new Array(2 * nIn - 1);
    for (var i = 0; i < (2 * nIn - 1); i++){
 		 motifArr[i] = new Array(2 * nIn - 1);
    }

    // prep color
    // TODO: move to a separate node
    for (let i = 0; i < nIn; i++) {
      let currColor;
      if (colorsIn[i] == null){
        currColor = getHex("#FFFFFF");
      }else {
        currColor = getHex(colorsIn[i].value);
      }
      chains.push(new Chain(i, currColor));
    }
    for (let i = nIn, j = 1; i < nIn * 2; i++, j++) {
      let currColor;
      if (colorsIn[colorsIn.length-j] == null){
        currColor = getHex("#FFFFFF");
      }else {
        currColor = getHex(colorsIn[colorsIn.length-j].value);
      }
      chains.push(new Chain(i, currColor));
    } 
    const half_floor = Math.floor(nIn / 2);
    const half_ceil = Math.ceil(nIn / 2);

    // ----- top half -----
    let mid_y = nIn - 1;
    let my = mid_y, mx = 0;
    let numKnots_currRow = 1;
    for (let i = nIn - 1, j = nIn; i > 0; i--, j++) {
      let next_my = my - 1;
      let nHalf = Math.floor(numKnots_currRow / 2);
      let currL = i, currR = nIn;
      for (let k = 0; k < nHalf; k++, currL++, currR++) { // left side
        let currKnot = new Knot(chains[currL], chains[currR], "b");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
        my += 2;
      }
      if (my == mid_y) {
        let currKnot = new Knot(chains[currL], chains[currR], "f");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
      }
      else {
        my -= 2;
      }
      my += nHalf * 2
      currL = nIn - 1 , currR = j;
      for (let k = 0; k < nHalf; k++, currL--, currR--) { // right side
        let currKnot = new Knot(chains[currL], chains[currR], "f");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
        my -= 2;
      }
      my = next_my;
      mx++;
      numKnots_currRow++;
    }
    // ----- middle row (fb & bf knots) -----
    let nHalf = Math.floor(numKnots_currRow / 2);
    let nL, nR = nIn;
    for (nL = 0; nL < nHalf; nL++) {
      let currKnot = new Knot(chains[nL], chains[nR], "bf");
      chains[nL].pushKnot(currKnot);
      chains[nR].pushKnot(currKnot);
      motifArr[mx][my] = currKnot;
      nR++;
      my += 2;
    }
    if (my == mid_y) {
      let currKnot = new Knot(chains[nL], chains[nR], "fb");
      chains[nL].pushKnot(currKnot);
      chains[nR].pushKnot(currKnot);
      motifArr[mx][my] = currKnot;
      my += 2;
      nL++;
      nR++;
    }
    for (let k = 0; k < nHalf; k++) {
      let currKnot = new Knot(chains[nL], chains[nR], "fb");
      chains[nL].pushKnot(currKnot);
      chains[nR].pushKnot(currKnot);
      motifArr[mx][my] = currKnot;
      nL++;
      nR++;
      my += 2;
    }
    // ----- bottom half -----
    my = 1;
    mx++;
    numKnots_currRow--;
    for (let i = 1, j = nIn; i < nIn; i++, j++) {
      let next_my = my + 1;
      let nHalf = Math.floor(numKnots_currRow / 2);
      let currL = nIn, currR = i;
      for (let k = 0; k < nHalf; k++, currL++, currR++) { // left side
        let currKnot = new Knot(chains[currL], chains[currR], "f");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
        my += 2;
      }
      if (my == mid_y) {
        let currKnot = new Knot(chains[currL], chains[currR], "f");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
      }
      else {
        my -= 2;
      }
      my += nHalf * 2
      currL = nIn * 2 - 1 - i, currR = nIn - 1;
      for (let k = 0; k < nHalf; k++, currL--, currR--) { // right side
        let currKnot = new Knot(chains[currL], chains[currR], "b");
        chains[currL].pushKnot(currKnot);
        chains[currR].pushKnot(currKnot);
        motifArr[mx][my] = currKnot;
        my -= 2;
      }
      my = next_my;
      mx++;
      numKnots_currRow--;
    }


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
