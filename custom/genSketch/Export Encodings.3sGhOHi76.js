module.exports = (node, graph) => {
  const { saveAs } = require("file-saver");

  // create input trigger port we will use to receive data from parent node
	const triggerIn = node.triggerIn("in");
	// create output trigger port we will use to send data to child nodes
	const triggerOut = node.triggerOut("out");

  let saveNextFrame = false;

	const saveEncodings = node.in("Export Pattern Encodings", () => {
		saveNextFrame = true;
	});

  function parseMotifArr(arr){
    var parsedArr = [];
    var s = "";
    var nRows = arr.length;
    var nCols = arr[0].length;
    var padding = false;
    for (let i = 0; i < nRows; i++) {
      let first = arr[i][0];
      if (first != 0) {
        if (i % 2) {
          padding = true;
          break;
        }
      }
    }
    //extra row before
    if (padding) {
      let add = Array(Math.ceil(nCols / 2)).fill(0);
      parsedArr.push(add);
    }
    for (let i = 0; i < nRows; i++) {
      let skip = (padding ^ (i % 2)) ? true : false;
      let currRowParsed = [];
      for (let j = 0; j < nCols; j++) {
        if (!skip) {
          let currElem = (typeof(arr[i][j]) == "string") ? arr[i][j] : 0;
          currRowParsed.push(currElem);
        }
        skip = !skip;
      }
      parsedArr.push(currRowParsed);
    }
    //extra row after
    if (parsedArr.length % 2) {
      let add = Array(Math.floor(nCols / 2)).fill(0);
      parsedArr.push(add);
    }
    return parsedArr;
  }

  function arrToString(parsedArr) {
    var nRows = parsedArr.length;
    var s = ""
    for (let i = 0; i < nRows; i++) {
      s += parsedArr[i].join(",")
      s += "\n";
    }
    return s;
  }

	triggerIn.onTrigger = (props) => {

    let motifArrObject = props.motifArr;
    var arr = [];
    
    var x = motifArrObject.length, y = motifArrObject[0].length;
    for (let i = 0; i < x; i++){
      let inner = [];
      for (let j = 0; j < y; j++){
        if (typeof(motifArrObject[i][j]) == "object"){
          inner.push(motifArrObject[i][j].getKnotType());
        }
        else{
          inner.push(0);
        }
      }
      arr.push(inner);
    }

    // let parsed = parseMotifArr(arr);
    // let s = arrToString(parsed);
    // node.log(s);

    if (saveNextFrame) {
      saveNextFrame = false;

      let parsed = parseMotifArr(arr);
      let s = arrToString(parsed);
      // node.log(s);

      var blob = new Blob([s], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "Encodings.txt");

    }
  };
};