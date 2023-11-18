module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: 1, max: 500});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: 1, max: 500});

  const dimNIn = node.in("dimensions", 7, {precision: 0, min: 4, max: 20});

  const colorsIn = [];
  let colorCounts = 0;

  // import custom classes
  const { Knot } = graph.k;
  const { Chain } = graph.c;

  node.onReady = () => {
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

    // ----- tail -----
    let mid_y = nIn - 1;
    let mx = 0;
    let numKnots_currTail = nIn - 1;
    for (let i = nIn - 1, j = nIn; i > 0; i--, j++){
      let currL = i, currR = j;
      // always forward in the middle
      let currKnot = new Knot(chains[i], chains[j], "f");
      chains[i].pushKnot(currKnot);
      chains[j].pushKnot(currKnot);
      motifArr[mx][nIn - 1] = currKnot;
      for (let k = 1; k < numKnots_currTail; k++) {
        let currKnot = new Knot(chains[i-k], chains[j], "b");
        chains[i - k].pushKnot(currKnot);
        chains[j].pushKnot(currKnot);
        motifArr[mx + k][mid_y - k] = currKnot;
      }
      for (let k = 1; k < numKnots_currTail; k++) {
        let currKnot = new Knot(chains[i], chains[j + k], "f");
        chains[i].pushKnot(currKnot);
        chains[j + k].pushKnot(currKnot);
        motifArr[mx + k][mid_y + k] = currKnot;
      }
      numKnots_currTail--;
      mx += 2;
    }
    // bottom left
    mx = nIn - 1, my = 0;
    let bfKnot = new Knot(chains[0], chains[nIn], "bf");
    chains[0].pushKnot(bfKnot);
    chains[nIn].pushKnot(bfKnot);
    motifArr[mx][my] = bfKnot;
    mx++;
    my++;
    for (let k = 1; k < nIn - 1; k++, mx++, my++) {
      let fKnot = new Knot(chains[nIn], chains[nIn+k], "f");
      chains[nIn].pushKnot(fKnot);
      chains[nIn + k].pushKnot(fKnot);
      motifArr[mx][my] = fKnot;
    }
    // bottom right
    mx = nIn - 1, my = nIn * 2 - 2;
    let fbKnot = new Knot(chains[nIn - 1], chains[nIn * 2 -1], "fb");
    chains[nIn - 1].pushKnot(fbKnot);
    chains[nIn * 2 - 1].pushKnot(fbKnot);
    motifArr[mx][my] = fbKnot;
    mx++;
    my--;
    for (let k = 1; k < nIn - 1; k++, mx++, my--) {
      let bKnot = new Knot(chains[nIn - 1 - k], chains[nIn], "b");
      chains[nIn - 1 - k].pushKnot(bKnot);
      chains[nIn].pushKnot(bKnot);
      motifArr[mx][my] = bKnot;
    }
    // last knot
    let knot = new Knot(chains[nIn], chains[nIn -1], "f");
    chains[nIn].pushKnot(knot);
    chains[nIn - 1].pushKnot(knot);
    motifArr[mx][my] = knot;



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
