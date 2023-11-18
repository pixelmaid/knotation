// node.comment = "TODO:\nmove requestAnimationFrame to\nafter definig motifArr and chain colors,\nbut before draw";
// Node code definition follows a CommonJS-like module specification
module.exports = (node, graph) => {
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  const fps = 25;
	// create a html canvas we will use for drawing
	const canvas = document.createElement("canvas");

	canvas.style.width = "100%";
	canvas.style.height = "100%";

	// get the 2d drawing context we will use to issue drawing commands
	const ctx = canvas.getContext("2d");

	// add canvas element to the Nodes Scene
	graph.sceneContainer.appendChild(canvas);

	// flag tracking if we are still runing to break requestAnimationFrame loop
	let isRunning = true;

	// main loop, it should be called 60 times per second
	const draw = () => {
		// stop drawing if the node has been destroyed or recompiled
		if (!isRunning) return;

		// check if canvas size matches the Nodes' scene parent size
		// if not, resize accordingly
		if (canvas.width !== graph.sceneContainer.clientWidth) {
			canvas.width = graph.sceneContainer.clientWidth;
		}
		if (canvas.height !== graph.sceneContainer.clientHeight) {
			canvas.height = graph.sceneContainer.clientHeight;
		}

		// clean canvas background with white color
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// send canvas and drawing context to child nodes
		triggerOut.trigger({
			canvas: canvas,
			ctx: ctx,
		});
		// request drawing of the next frame
    setTimeout(() => {
        requestAnimationFrame(draw);
      }, 1000 / fps);
    // https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
    
	};
  
  requestAnimationFrame(draw);
  draw();


	// this code will be executed when node is deleted or recompiled
	node.onDestroy = () => {
		// set the flag to stop drawing
		isRunning = false;
		// remove the canvas element from the Scene
		if (canvas) {
			canvas.remove();
		}
	};
};