module.exports = (node, graph) => {

  const { getHex } = require("pex-color");

	const triggerIn = node.triggerIn("in");
	const triggerOut = node.triggerOut("out");

  const xPosIn = node.in("move left/right", 50, {precision: 0, min: -2000, max: 2000});
  const yPosIn = node.in("move up/down", 50, {precision: 0, min: -2000, max: 2000});
  
  const intervalIn = node.in('display size', 10, { precision: 0, min: 5, max: 50});

  const showSymbIn  = node.in("toggle knot type", false);
  const showBaseIn  = node.in("toggle base threads", true);
  const showthreadNumIn  = node.in("toggle thread index", true);
  const showGridIn  = node.in("toggle grid", false);

  function invertHex(hex) {
      hex = hex.substring(1);
      return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase();
  }

  function seekNextX(motifArr, currX, y) {
    currX += 1;
    while (currX < motifArr.length) {
      if (motifArr[currX][y] != 0) {
        return currX
      }
      currX ++;
    }
    // no prev x
    //should be impossible case
    return -1;
  }

  triggerIn.onTrigger = (props) => {

    const { ctx, canvas } = props;

    let motifArr = props.motifArr;

    let xPos = xPosIn.value;
    let yPos = yPosIn.value;

    let showSymb = showSymbIn.value;
    let showBase = showBaseIn.value;
    let showthreadNum = showthreadNumIn.value;
    let showGrid = showGridIn.value;

    
    let interval = intervalIn.value;


    if (showGrid) {
      ctx.strokeStyle = 'rgba(173, 22, 22, 0.7)';
      ctx.lineWidth = 1;
      let width = motifArr[0].length * interval;
      let height = motifArr.length * interval;
      
      let [vertX, vertY] = [xPos, yPos];
      for (let i = 0; i <= motifArr[0].length; i++) {
        ctx.beginPath();
        ctx.moveTo(vertX, vertY);
        // vertY = yPos + height + interval;
        vertY = yPos + height;
        ctx.lineTo(vertX, vertY);
        ctx.stroke();
        ctx.closePath();
        vertX += interval;
        // vertY = yPos - interval;
        vertY = yPos;
      }
      let [horiX, horiY] = [xPos, yPos];
      for (let i = 0; i <= motifArr.length; i++) {
        ctx.beginPath();
        ctx.moveTo(horiX, horiY);
        horiX = xPos + width;
        ctx.lineTo(horiX, horiY);
        ctx.stroke();
        ctx.closePath();
        horiY += interval;
        horiX = xPos;
      }

      // indexes
      var fontArgs = ctx.font.split(' ');
      var newSize = Math.floor(interval/1.5).toString() + 'px';
      ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
      ctx.fillStyle = 'rgba(173, 22, 22, 0.7)'; 
      for (let i = 0, x = xPos + interval/5; i < motifArr[0].length; i++){
        let num = i.toString();
        ctx.fillText(num, x, yPos - interval/10);
        x += interval;
      }
      for (let i = 0, y = yPos + interval*0.75; i < motifArr.length; i++){
        let num = i.toString();
        ctx.fillText(num, xPos - interval*0.9, y);
        y += interval;
      }
      
    }

    var initialColors = new Map();
    for (let v = 0; v < motifArr.length; v++){
      for (let h = 0; h <  motifArr[0].length; h++){
        if (typeof(motifArr[v][h]) == "object"){
          drawKnot(motifArr[v][h], v, h);
          if (v == 0){
            initialColors.set(h, motifArr[v][h].inL.getColor());
            initialColors.set(h+1, motifArr[v][h].inR.getColor());
          }
        }
        else {
          //empty cell
          // extend vertical lines
          let knotBelowX = seekNextX(motifArr, v, h);
          if (knotBelowX != -1 && showBase) {
            ctx.lineWidth = 3;
            let knotBelowType = motifArr[knotBelowX][h].getKnotType();
            let lColor = motifArr[knotBelowX][h].inL.getColor();
            let rColor = motifArr[knotBelowX][h].inR.getColor();

            if (knotBelowType == 'f' ||knotBelowType == 'fb'){
              if (h == motifArr[0].length-1 || motifArr[v][h+1] == 0){
                if (typeof(motifArr[knotBelowX -1][h+1]) == "object") {
                }else {
                  //right side empty
                  ctx.strokeStyle = rColor;
                  ctx.beginPath();
                  let [rx, ry] = [xPos + interval * (h + 1), yPos + interval * v];
                  ctx.moveTo(rx, ry);
                  ry += interval;
                  ctx.lineTo(rx, ry);
                  ctx.stroke();

                  if (v == 0){
                    initialColors.set(h+1, rColor);
                  }

                }
              }
              if (h == 0 || motifArr[knotBelowX - 1][h-1] == 0) {
                ctx.strokeStyle = lColor;
                ctx.beginPath();
                let [lx, ly] = [xPos + interval * h, yPos + interval * v];
                ctx.moveTo(lx, ly);
                ly += interval;
                ctx.lineTo(lx, ly);
                ctx.stroke();

                if (v == 0){
                  initialColors.set(h,lColor);
                }
              }
            }
            if (knotBelowType == 'b' ||knotBelowType == 'bf'){
              if (h == 0 || motifArr[v][h-1] == 0) {
                if (typeof(motifArr[knotBelowX -1][h-1]) == "object") {
                }else {
                  // leftside empty
                  ctx.strokeStyle = lColor;
                  ctx.beginPath();
                  let [lx, ly] = [xPos + interval * h, yPos + interval * v];
                  ctx.moveTo(lx, ly);
                  ly += interval;
                  ctx.lineTo(lx, ly);
                  ctx.stroke();

                  if (v == 0){
                    initialColors.set(h, lColor);
                  }
                }
              }
              // right edge or knot below upper right empty
              if (h == motifArr[0].length-1 || motifArr[knotBelowX - 1][h+1] == 0) {
                ctx.strokeStyle = rColor;
                ctx.beginPath();
                let [rx, ry] = [xPos + interval * (h + 1), yPos + interval * v];
                ctx.moveTo(rx, ry);
                ry += interval;
                ctx.lineTo(rx, ry);
                ctx.stroke();

                if (v == 0){
                  initialColors.set(h+1, rColor);
                }
              }
            }


          }
        }

      }
    }
    
    // threadNum
    if (showBase && showthreadNum) {
      var fontArgs = ctx.font.split(' ');
      var newSize = Math.floor(interval/1.5).toString() + 'px';
      ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
      for (let i = 0, x = xPos - interval/5; i <= motifArr[0].length; i++){
        ctx.fillStyle = initialColors.get(i); 
        let num = i.toString();
        ctx.fillText(num, x, yPos - interval);
        ctx.beginPath();
        ctx.moveTo(x + interval/5, yPos - interval*0.8);
        ctx.lineTo(x + interval/5, yPos);
        ctx.lineWidth = 3;
        ctx.strokeStyle = initialColors.get(i); 
        ctx.stroke();
        x += interval;
      }
    }


    function drawKnot(knot, v, h){
      ctx.lineWidth = 3;
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
        //knot type
        if (showSymb){
          //draw circle
          ctx.lineWidth = (interval/10 < 1) ? 1 : interval/10;
          ctx.beginPath();
          let [centerX, centerY] = [xPos + interval * (h + 0.5), yPos + interval * (v + 0.5)];
          ctx.arc(centerX, centerY, interval/2, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = knot.over.getColor();
          ctx.fill();
          //draw arrow
          ctx.strokeStyle = "#" + invertHex(knot.over.getColor());
          ctx.beginPath();
          let [lineX, lineY] = [centerX - interval/4, centerY - interval/4];
          ctx.moveTo(lineX, lineY);
          lineX += interval/2;
          lineY += interval/2;
          ctx.lineTo(lineX, lineY);
          ctx.stroke();

          ctx.beginPath();
          let [aX, aY] = [lineX, lineY - interval/4];
          ctx.moveTo(aX, aY);
          aY += interval/4;
          ctx.lineTo(aX, aY);
          aX -= interval/4;
          ctx.lineTo(aX, aY);
          ctx.stroke();
        }
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
        //knot type
        if (showSymb){
          //draw circle
          ctx.lineWidth = (interval/10 < 1) ? 1 : interval/10;
          ctx.beginPath();
          let [centerX, centerY] = [xPos + interval * (h + 0.5), yPos + interval * (v + 0.5)];
          ctx.arc(centerX, centerY, interval/2, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = knot.over.getColor();
          ctx.fill();
          //draw arrow
          ctx.strokeStyle = "#" + invertHex(knot.over.getColor());
          ctx.beginPath();
          let [lineX, lineY] = [centerX + interval/4, centerY - interval/4];
          ctx.moveTo(lineX, lineY);
          lineX -= interval/2;
          lineY += interval/2;
          ctx.lineTo(lineX, lineY);
          ctx.stroke();

          ctx.beginPath();
          let [aX, aY] = [lineX, lineY - interval/4];
          ctx.moveTo(aX, aY);
          aY += interval/4;
          ctx.lineTo(aX, aY);
          aX += interval/4;
          ctx.lineTo(aX, aY);
          ctx.stroke();
        }
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
        //knot type
        if (showSymb){
          //draw circle
          ctx.lineWidth = (interval/10 < 1) ? 1 : interval/10;
          ctx.beginPath();
          let [centerX, centerY] = [xPos + interval * (h + 0.5), yPos + interval * (v + 0.5)];
          ctx.arc(centerX, centerY, interval/2, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = knot.over.getColor();
          ctx.fill();
          //draw arrow
          ctx.strokeStyle = "#" + invertHex(knot.over.getColor());
          ctx.beginPath();
          centerX -=interval/8;
          let [lineX, lineY] = [centerX + interval/4, centerY - interval/4];
          ctx.moveTo(lineX, lineY);
          lineX -= interval/4;
          lineY += interval/4;
          ctx.lineTo(lineX, lineY);
          lineX += interval/ 4;
          lineY += interval/ 4;
          ctx.lineTo(lineX, lineY);
          ctx.stroke();

          ctx.beginPath();
          let [aX, aY] = [lineX, lineY - interval/4];
          ctx.moveTo(aX, aY);
          aY += interval/4;
          ctx.lineTo(aX, aY);
          aX -= interval/4;
          ctx.lineTo(aX, aY);
          ctx.stroke();
        }
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
        //knot type
        if (showSymb){
          //draw circle
          ctx.lineWidth = (interval/10 < 1) ? 1 : interval/10;
          ctx.beginPath();
          let [centerX, centerY] = [xPos + interval * (h + 0.5), yPos + interval * (v + 0.5)];
          ctx.arc(centerX, centerY, interval/2, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = knot.over.getColor();
          ctx.fill();
          //draw arrow
          ctx.strokeStyle = "#" + invertHex(knot.over.getColor());
          ctx.beginPath();
          centerX += interval/8;
          let [lineX, lineY] = [centerX - interval/4, centerY - interval/4];
          ctx.moveTo(lineX, lineY);
          lineX += interval/4;
          lineY += interval/4;
          ctx.lineTo(lineX, lineY);
          lineX -= interval/ 4;
          lineY += interval/ 4;
          ctx.lineTo(lineX, lineY);
          ctx.stroke();

          ctx.beginPath();
          let [aX, aY] = [lineX, lineY - interval/4];
          ctx.moveTo(aX, aY);
          aY += interval/4;
          ctx.lineTo(aX, aY);
          aX += interval/4;
          ctx.lineTo(aX, aY);
          ctx.stroke();
        }
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