module.exports = (node, graph) => {

  const { Knot } = graph.k;

  class Chain {

    constructor(id, color) {
      this.arr = []; // array of knot objects
      this.relPos = []; // array to calculate each knot's relative positions to the beginning of the chain

      this.id = id;
      this.color = color;
    }

    pushKnot(knot) {
      this.arr.push(knot)

      let posMap = new Map();
      posMap.set("f", 1);
      posMap.set("b", -1);
      posMap.set("fb", 0);
      posMap.set("bf", -1);
      this.relPos.push(posMap.get(knot.knotType));

    }

    mergeKnots(rChain, lIdx, rIdx) {
      let lKnot = this.arr[lIdx];
      let rKnot = rChain.arr[rIdx];
      if (lKnot.mirrors(rKnot)) {
        // compatible knot connection
        // ASSUMPTION:
        // there exist an undefined(-1) inL or inR for each knot at compatible positions
        // let l = (lKnot.inL && lKnot.inL.id) >=0 ? lKnot.inL : rKnot.inL;
        // node.log("assign new l Chain: " + (l instanceof Chain));

        // node.log("r condition check: " + ((lKnot.inR && lKnot.inR.id) >= 0) );
        // let r = (lKnot.inR && lKnot.inR.id) >=0 ? lKnot.inR : rKnot.inR;
        let l = lKnot.inL ?? rKnot.inL;
        let r = lKnot.inR ?? rKnot.inR;
        // node.log("assign new r Chain: " + (r instanceof Chain));
        let replace1 = new Knot(l, r, lKnot.knotType);
        this.arr[lIdx] = replace1;
        let replace2 = new Knot(l, r, rKnot.knotType);
        rChain.arr[rIdx] = replace2;

        // return the position differences between the starts of the two chains
        // this connection would set them
        // TODO: move this into a separate function
        let lDiff= this.relPos.slice(0, lIdx).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        let rDiff= rChain.relPos.slice(0, rIdx).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        const difference = lDiff + Math.abs(rDiff) + 1;
        return difference;

      }
      else {
        // incompatible
        throw "incompatible knot types";
          }
    }

    getLength() {
      return this.arr.length;
    }

    getKnot(idx) {
      return this.arr[idx];
    }

    getId() {
      return this.id;

    }

    getColor() {
      return this.color;
    }
    setColor(newColor) {
      this.color = newColor;
    }

  }

  // const mergeKnots = function (chain1, chain2, idx1, idx2) {
  //   knot1 = chain1.orderedArr[idx1];
  //   knot2 = chain2.orderedArr[idx2];
  //   if (knot1.mirrors(knot2)) {
  //     // valid
  //     // ASSUMPTION:
  //     // there's an undefined(-1) inL or inR for each knot at compatible positions
  //     let l = knot1.inL >=0 ? knot1.inL : knot2.inL;
  //     let r = knot1.inR >=0 ? knot1.inR : knot2.inR;
  //     replace1 = new Knot(l, r, knot1.knotType);
  //     chain1.orderedArr[idx1] = replace1;
  //     replace2 = new Knot(l, r, knot2.knotType);
  //     chain2.orderedArr[idx2] = replace2;

  //   }
  //   else {
  //     // invalid
  //     throw "incompatible knot types";
  //   }
  // }
  
  node.onReady = () => {
  };

  graph.c = {
    Chain,
  };

};
