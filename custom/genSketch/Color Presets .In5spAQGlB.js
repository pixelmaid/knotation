module.exports = (node, graph) => {
  const { getHex } = require("pex-color");
	// create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
  const BgColorIn = node.in("background color", [48/255, 48/255, 48/255, 0], {type: "color", connectable: false});
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");
    // create output triggers
  // const triggerOut0 = node.triggerOut("chevron");
  // const triggerOut1 = node.triggerOut("arrowhead");
  // const triggerOut2 = node.triggerOut("diamond");
  // const triggerOut3 = node.triggerOut("dovetail");
  // const triggerOut4 = node.triggerOut("out4");


  // clip mask: canvas margin size in pixels
  const margin = 10;

  const presetColors = new Map();
  presetColors.set("red", "#C20000");
  presetColors.set("orange", "#EF4C00");
  presetColors.set("yellow", "#FFC846");
  presetColors.set("eggyolk", "#FFE936");
  presetColors.set("wine", "#550B00");
  presetColors.set("matcha", "#BFD13F");
  presetColors.set("green", "#3C8C19");
  presetColors.set("blue", "#5D70AB");
  presetColors.set("indigo", "#333591");
  presetColors.set("purple", "#9F3787");
  presetColors.set("blush", "#FFB3A4");
  presetColors.set("pink", "#FF628B");
  presetColors.set("tea", "#523F16");
  presetColors.set("beige", "#D2BB9A");
  presetColors.set("black", "#000000");
  presetColors.set("white", "#FFFFFF");
  
  


	// we receive data from parent node on each frame
  // callback
	// this is where we will draw our grid
	triggerIn.onTrigger = (props) => {
    // destructure canvas and context from the received properties
		const { canvas, ctx } = props;

		// save canvas state
		ctx.save();

		// start drawing clipping mask
		ctx.beginPath();
		// draw clipping mask rectangle slightly smaller than whole page
		ctx.rect(
			margin,
			margin,
			canvas.width - margin * 2,
			canvas.height - margin * 2
		);
		ctx.clip();

    // canvas background to black
    ctx.fillStyle = getHex(BgColorIn.value);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // triggerOut0.trigger(props);
    // triggerOut1.trigger(props);
    // triggerOut2.trigger(props);
    // triggerOut3.trigger(props);

    triggerOut.trigger({
      presetColors,
    ...props
  });

	};
};
