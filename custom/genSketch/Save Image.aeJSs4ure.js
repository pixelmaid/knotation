module.exports = function (node, graph) {
	const { default: canvasScreenshot } = require("canvas-screenshot");

	const triggerIn = node.triggerIn("in")
	const triggerOut = node.triggerOut("out")

	let saveNextFrame = false;

	const saveScreenshot = node.in("Save Image", () => {
		saveNextFrame = true;
	});

	// let frame = 0;
	triggerIn.onTrigger = (props) => {
		triggerOut.trigger(props);

		if (saveNextFrame) {
			saveNextFrame = false;

			const date = new Date()
				.toISOString()
				.slice(0, 19)
				.replace("T", " ")
				.replace(/:/g, "-");

			// create screenshot and trigger file download
			canvasScreenshot(props.canvas, {
				useBlob: true,
				filename: graph.name + " " + date,
			});
		}
	};
};