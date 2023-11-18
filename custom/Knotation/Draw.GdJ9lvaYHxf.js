module.exports = (node, graph) => {

  const { getHex } = require("pex-color");

	const triggerIn = node.triggerIn("in");
	const triggerOut = node.triggerOut("out");

  const xPosIn = node.in("pattern position x", 50, {precision: 0, min: -2000, max: 2000});
  const yPosIn = node.in("pattern position y", 50, {precision: 0, min: -2000, max: 2000});
  
  const intervalIn = node.in('size', 20, { precision: 0, min: 5, max: 50});

  const showBaseIn  = node.in("show base strings", true);

  triggerIn.onTrigger = (props) => {

    const { ctx, canvas } = props;

    let motifArr = props.motifArr;

    let xPos = xPosIn.value;
    let yPos = yPosIn.value;

    let showBase = showBaseIn.value;

    let interval = intervalIn.value;

    for (let v = 0; v < motifArr.length; v++){
      for (let h = 0; h <  motifArr[0].length; h++){
        if (typeof(motifArr[v][h]) == "object"){
          drawKnot(motifArr[v][h], v, h);
        }
      }
    }

    function drawKnot(knot, v, h){
      ctx.lineWidth = 1;
      // ctx.strokeStyle = !knot.base ? "gray" : knot.base.getColor();

      if (knot.getKnotType() == "f") {
        //base
        if (showBase){
          ctx.strokeStyle = knot.base.getColor();
          ctx.beginPath();
          let [baseX, baseY] = [xPos + interval * (h + 1), yPos + interval * v];
          ctx.moveTo(baseX, baseY);
          baseX -= interval;
          baseY += interval;
          ctx.lineTo(baseX, baseY);
          ctx.stroke();
        }
        //over
        ctx.lineWidth = 8;
        ctx.strokeStyle = knot.over.getColor();
        ctx.beginPath();
        let [overX, overY] = [xPos + interval * h, yPos + interval * v];
        ctx.moveTo(overX, overY);
        overX += interval;
        overY += interval;
        ctx.lineTo(overX, overY);
        ctx.stroke();
      }
      if (knot.getKnotType() == "b") {
        //base
        if (showBase){
          ctx.strokeStyle = knot.base.getColor();
          ctx.beginPath();
          let [baseX, baseY] = [xPos + interval * h, yPos + interval * v];
          ctx.moveTo(baseX, baseY);
          baseX += interval;
          baseY += interval;
          ctx.lineTo(baseX, baseY);
          ctx.stroke();
        }
        //over
        ctx.lineWidth = 8;
        ctx.strokeStyle = knot.over.getColor();
        ctx.beginPath();
        let [overX, overY] = [xPos + interval * (h + 1), yPos + interval * v];
        ctx.moveTo(overX, overY);
        overX -= interval;
        overY += interval;
        ctx.lineTo(overX, overY);
        ctx.stroke();
      }
      if (knot.getKnotType() == "bf") {
        //base
        if (showBase){
          ctx.strokeStyle = knot.base.getColor();
          ctx.beginPath();
          let [baseX, baseY] = [xPos + interval * h, yPos + interval * v];
          ctx.moveTo(baseX, baseY);
          baseX += interval / 2;
          baseY += interval / 2;
          ctx.lineTo(baseX, baseY);
          baseX -= interval / 2;
          baseY += interval / 2;
          ctx.lineTo(baseX, baseY);
          ctx.stroke();
        }
        //over
        ctx.lineWidth = 8;
        ctx.strokeStyle = knot.over.getColor();
        ctx.beginPath();
        let [overX, overY] = [xPos + interval * (h + 1), yPos + interval * v];
        ctx.moveTo(overX, overY);
        overX -= interval / 2;
        overY += interval / 2;
        ctx.lineTo(overX, overY);
        overX += interval / 2;
        overY += interval / 2;
        ctx.lineTo(overX, overY);
        ctx.stroke();
      }
      if (knot.getKnotType() == "fb") {
        //base
        if (showBase){
          ctx.strokeStyle = knot.base.getColor();
          ctx.beginPath();
          let [baseX, baseY] = [xPos + interval * (h + 1), yPos + interval * v];
          ctx.moveTo(baseX, baseY);
          baseX -= interval / 2;
          baseY += interval / 2;
          ctx.lineTo(baseX, baseY);
          baseX += interval / 2;
          baseY += interval / 2;
          ctx.lineTo(baseX, baseY);
          ctx.stroke();
        }
        //over
        ctx.lineWidth = 8;
        ctx.strokeStyle = knot.over.getColor();
        ctx.beginPath();
        let [overX, overY] = [xPos + interval * h, yPos + interval * v];
        ctx.moveTo(overX, overY);
        overX += interval / 2;
        overY += interval / 2;
        ctx.lineTo(overX, overY);
        overX -= interval / 2;
        overY += interval / 2;
        ctx.lineTo(overX, overY);
        ctx.stroke();
      }
    }
    triggerOut.trigger({
      motifArr,
      ...props
    });
  };
  

  node.onReady = () => {
  };
  node.onDestroy = () => {
  };
};