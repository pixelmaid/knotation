node.comment = "in-progress\nparameterization is different\nfrom the other three";

module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  // ---------------------
  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: 1, max: 500});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: 1, max: 500});

  const numForwardIn = node.in("#forward knots", 1, {precision: 0, min: 1, max: 20});
  const numBackwardIn = node.in("#backward knots", 1, {precision: 0, min: 1, max: 20});

  const forwardColorIn = node.in("forward color", [1, 1, 1, 1], {type: "color"});
  const backwardColorIn = node.in("backward color", [1, 1, 1, 1], {type: "color"});


  // custom classes
  const { Knot } = graph.k || {};
  const { Chain } = graph.c || {};

  node.onReady = () => {
  };
  
	triggerIn.onTrigger = (props) => {
		const { ctx, canvas } = props;

    // ---------------------
    let xPos = xPosIn.value;
    let yPos = yPosIn.value;

    let numF = numForwardIn.value;
    let numB = numBackwardIn.value;

    let fColor = getHex(forwardColorIn.value);
    let bColor = getHex(backwardColorIn.value);

    // create 2D array to store motif's knot information
    let motifArr = new Array(Math.max(numF, numB)).fill(0);
    for (var i = 0; i < Math.max(numF, numB); i++){
 		 motifArr[i] = new Array(numF + numB - 1).fill(0);
    }

    const chains = [];
    chains.push(new Chain(0, fColor));
    for (let i = 1; i < numF+numB - 1; i++) {
      chains.push(new Chain(i, "#FFFFFF"));
    }
    chains.push(new Chain((numF+numB-1), bColor));

    // ->
    let mx, my;
    if (numF >= numB) { mx = 0; } else{ mx = numB - numF; }
    my = 0;
    for (let i = 0; i < numF-1; i++){
      let currKnot = new Knot(chains[0], chains[i+1], "f");
      chains[0].pushKnot(currKnot);
      chains[i+1].pushKnot(currKnot);
      motifArr[mx][my] = currKnot;
      mx++;
      my++;
    }
    // <-
    if (numB >= numF) { mx = 0; } else{ mx = numF - numB; }
    my = numF + numB - 2;
    for (let i = 0, j = chains.length-1; i < numB-1; i++, j--){
      let currKnot = new Knot(chains[j-1], chains[chains.length-1], "b");
      chains[chains.length-1].pushKnot(currKnot);
      chains[j-1].pushKnot(currKnot);
      motifArr[mx][my] = currKnot;
      mx++;
      my--;
    }
    let currKnot_merge = new Knot(chains[0], chains[chains.length-1], "f");
    chains[0].pushKnot(currKnot_merge);
    chains[chains.length-1].pushKnot(currKnot_merge);
    motifArr[mx][my] = currKnot_merge;


    triggerOut.trigger({
      motifArr,
      chains,
      xPos,
      yPos,
      ...props
    });
	};


};
