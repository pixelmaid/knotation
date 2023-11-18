// node.comment = "NEED FIX: only changes one chain at a time\nissue with current animation order";

module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

	const chainNumIn = node.in('thread number', 0, { min: 0, precision: 0 }); // the displayed min to the user: 1 or 0
  const newColorIn = node.in("color", [1, 1, 1, 1], {type: "color"});
  const symmetryIn = node.in('symmetric', true);

  const passedColorsIn = node.in("numColors");
  var colors = [];
  function createPorts(){
    const num = passedColorsIn.value;
    if (num){
      node.log(num);
      colors = [];
      for (let colorCounts = 0; colorCounts < num;){
        let s = "colo1 " + colorCounts;
        colors.push(node.in(s, [1, 1, 1, 1], {type: "color"}));
        colorCounts++;
      }

    }
  }


  // node.onReady = () => {
  //   node
  //   // passedColorsIn.onChange = createPorts;
  // };

  // import custom classes
  const { Knot } = graph.k;
  const { Chain } = graph.c;

  
	triggerIn.onTrigger = (props) => {
		const { ctx, canvas } = props;

    const chains = props.chains;
    var totalChainNum = chains.length;

    const nIn = props.nIn;

    var newColor = getHex(newColorIn.value);
    var chainNum = chainNumIn.value;
    var symmetric = symmetryIn.value;

    if (chainNum >= totalChainNum) {
      // error message
      node.log("impossible thread number");
    }
    else {
      let curr = chains[chainNum];
      curr.setColor(newColor);
    }

    if (symmetric) {
      let sym = chains[totalChainNum - 1 - chainNum];
      sym.setColor(newColor);
    }

    triggerOut.trigger({
    ...props
    });
  };


  node.onDestroy = () => {
  };

};