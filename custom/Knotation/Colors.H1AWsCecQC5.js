// node.comment = "NEED FIX: only changes one chain at a time\nissue with current animation order";

module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

	const chainNumIn = node.in('thread number', 0, {connectable: false, min: 0, precision: 0 }); // the displayed min to the user: 1 or 0
  const newColorIn = node.in("color", [1, 1, 1, 1], {connectable: false, type: "color"});
  const symmetryIn = node.in("symmetric", true, {connectable: false});
  const activateIn = node.in("Activate Module", true, {connectable:false});

  // const passedColorsIn = node.in("numColors", 0, {connectable: false});
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


  
	triggerIn.onTrigger = (props) => {

    const chains = props.chains;
    var totalChainNum = chains.length;

    // const nIn = props.nIn;

    var chainNum = chainNumIn.value;
    var newColor = getHex(newColorIn.value);
    var symmetric = symmetryIn.value;
    var activate = activateIn.value;

    if (activate) {
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
    }
    triggerOut.trigger({
    ...props
    });
  };


  node.onDestroy = () => {
  };

};