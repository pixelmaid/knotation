module.exports = (node, graph) => {

  const { Knot } = graph.k || {};
  const { Chain } = graph.c || {};

  class Motif {

    constructor() {
      this.motifArr = [];
    }
  }

  // CHEVRON
  class ChevronObj extends Motif {
    constructor(numF, numB, chains){
      super();

      // create 2D array to store motif's knot information
      this.motifArr = new Array(Math.max(numF, numB)).fill(0);
      for (var i = 0; i < Math.max(numF, numB); i++){
        this.motifArr[i] = new Array(numF + numB - 1).fill(0);
      }

      // ----------
      // ->
      let mx, my;
      if (numF >= numB) { mx = 0; } else{ mx = numB - numF; }
      my = 0;
      for (let i = 0; i < numF-1; i++){
        let currKnot = new Knot(chains[0], chains[i+1], "f");
        chains[0].pushKnot(currKnot);
        chains[i+1].pushKnot(currKnot);
        this.motifArr[mx][my] = currKnot;
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
        this.motifArr[mx][my] = currKnot;
        mx++;
        my--;
      }
      let currKnot_merge = new Knot(chains[0], chains[chains.length-1], "f");
      chains[0].pushKnot(currKnot_merge);
      chains[chains.length-1].pushKnot(currKnot_merge);
      this.motifArr[mx][my] = currKnot_merge;
    }
  }

  // DIAMOND
  class DiamondObj extends Motif {
    constructor(nIn, chains){
      super();

      this.motifArr = new Array(2 * nIn - 1).fill(0);
      for (var i = 0; i < (2 * nIn - 1); i++){
        this.motifArr[i] = new Array(2 * nIn - 1).fill(0);
      }

      // ----- top half -----
      let mid_y = nIn - 1;
      let my = mid_y, mx = 0;
      let numKnots_currRow = 1;
      for (let i = nIn - 1, j = nIn; i > 0; i--, j++) {
        let next_my = my - 1;
        let nHalf = Math.floor(numKnots_currRow / 2);
        let currL = i, currR = nIn;
        for (let k = 0; k < nHalf; k++, currL++, currR++) { // left side
          let currKnot = new Knot(chains[currL], chains[currR], "b");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
          my += 2;
        }
        if (my == mid_y) {
          let currKnot = new Knot(chains[currL], chains[currR], "f");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
        }
        else {
          my -= 2;
        }
        my += nHalf * 2
        currL = nIn - 1 , currR = j;
        for (let k = 0; k < nHalf; k++, currL--, currR--) { // right side
          let currKnot = new Knot(chains[currL], chains[currR], "f");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
          my -= 2;
        }
        my = next_my;
        mx++;
        numKnots_currRow++;
      }
      // ----- middle row (fb & bf knots) -----
      let nHalf = Math.floor(numKnots_currRow / 2);
      let nL, nR = nIn;
      for (nL = 0; nL < nHalf; nL++) {
        let currKnot = new Knot(chains[nL], chains[nR], "bf");
        chains[nL].pushKnot(currKnot);
        chains[nR].pushKnot(currKnot);
        this.motifArr[mx][my] = currKnot;
        nR++;
        my += 2;
      }
      if (my == mid_y) {
        let currKnot = new Knot(chains[nL], chains[nR], "fb");
        chains[nL].pushKnot(currKnot);
        chains[nR].pushKnot(currKnot);
        this.motifArr[mx][my] = currKnot;
        my += 2;
        nL++;
        nR++;
      }
      for (let k = 0; k < nHalf; k++) {
        let currKnot = new Knot(chains[nL], chains[nR], "fb");
        chains[nL].pushKnot(currKnot);
        chains[nR].pushKnot(currKnot);
        this.motifArr[mx][my] = currKnot;
        nL++;
        nR++;
        my += 2;
      }
      // ----- bottom half -----
      my = 1;
      mx++;
      numKnots_currRow--;
      for (let i = 1, j = nIn; i < nIn; i++, j++) {
        let next_my = my + 1;
        let nHalf = Math.floor(numKnots_currRow / 2);
        let currL = nIn, currR = i;
        for (let k = 0; k < nHalf; k++, currL++, currR++) { // left side
          let currKnot = new Knot(chains[currL], chains[currR], "f");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
          my += 2;
        }
        if (my == mid_y) {
          let currKnot = new Knot(chains[currL], chains[currR], "f");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
        }
        else {
          my -= 2;
        }
        my += nHalf * 2
        currL = nIn * 2 - 1 - i, currR = nIn - 1;
        for (let k = 0; k < nHalf; k++, currL--, currR--) { // right side
          let currKnot = new Knot(chains[currL], chains[currR], "b");
          chains[currL].pushKnot(currKnot);
          chains[currR].pushKnot(currKnot);
          this.motifArr[mx][my] = currKnot;
          my -= 2;
        }
        my = next_my;
        mx++;
        numKnots_currRow--;
      }
    }
  }

  class DovetailObj extends Motif {
    constructor(nIn, chains){
      super();

      this.motifArr = new Array(2 * nIn - 1).fill(0);
      for (var i = 0; i < (2 * nIn - 1); i++){
        this.motifArr[i] = new Array(2 * nIn - 1).fill(0);
      }
      // node.log(this.motifArr[6][9])
      // ----- tail -----
      let mid_y = nIn - 1;
      let mx = 0;
      let numKnots_currTail = nIn - 1;
      for (let i = nIn - 1, j = nIn; i > 0; i--, j++){
        // always forward in the middle
        let currKnot = new Knot(chains[i], chains[j], "f");
        chains[i].pushKnot(currKnot);
        chains[j].pushKnot(currKnot);
        this.motifArr[mx][nIn - 1] = currKnot;
        for (let k = 1; k < numKnots_currTail; k++) {
          let currKnot = new Knot(chains[i-k], chains[j], "b");
          chains[i - k].pushKnot(currKnot);
          chains[j].pushKnot(currKnot);
          this.motifArr[mx + k][mid_y - k] = currKnot;
        }
        for (let k = 1; k < numKnots_currTail; k++) {
          let currKnot = new Knot(chains[i], chains[j + k], "f");
          chains[i].pushKnot(currKnot);
          chains[j + k].pushKnot(currKnot);
          this.motifArr[mx + k][mid_y + k] = currKnot;
        }
        numKnots_currTail--;
        mx += 2;
      }
      // bottom left
      mx = nIn - 1;
      let my = 0;
      let bfKnot = new Knot(chains[0], chains[nIn], "bf");
      chains[0].pushKnot(bfKnot);
      chains[nIn].pushKnot(bfKnot);
      this.motifArr[mx][my] = bfKnot;
      mx++;
      my++;
      for (let k = 1; k < nIn - 1; k++, mx++, my++) {
        let fKnot = new Knot(chains[nIn], chains[nIn+k], "f");
        chains[nIn].pushKnot(fKnot);
        chains[nIn + k].pushKnot(fKnot);
        this.motifArr[mx][my] = fKnot;
      }
      // bottom right
      mx = nIn - 1, my = nIn * 2 - 2;
      let fbKnot = new Knot(chains[nIn - 1], chains[nIn * 2 -1], "fb");
      chains[nIn - 1].pushKnot(fbKnot);
      chains[nIn * 2 - 1].pushKnot(fbKnot);
      this.motifArr[mx][my] = fbKnot;
      mx++;
      my--;
      for (let k = 1; k < nIn - 1; k++, mx++, my--) {
        let bKnot = new Knot(chains[nIn - 1 - k], chains[nIn], "b");
        chains[nIn - 1 - k].pushKnot(bKnot);
        chains[nIn].pushKnot(bKnot);
        this.motifArr[mx][my] = bKnot;
      }
      // last knot
      let knot = new Knot(chains[nIn], chains[nIn -1], "f");
      chains[nIn].pushKnot(knot);
      chains[nIn - 1].pushKnot(knot);
      this.motifArr[mx][my] = knot;
    }
  }

  graph.cObj = {
    ChevronObj,
  };
  graph.dmndObj = {
    DiamondObj,
  };
  graph.dvtlObj = {
    DovetailObj,
  };

};
