module.exports = (node, graph) => {


  class Knot {

    constructor(L, R, knotType) {
      this.knotType = knotType;

      this.inL = L;
      this.inR = R;

      // this.localCoords = [-1, -1];

      this.calcOutLR();
      this.calcOverBase();

      // if (knotType == "f") {
      //   this.outL = R;
      //   this.outR = L;
        
      //   this.over = L;
      //   this.base = R;
      // }
      // else if (knotType == "b") {
      //   this.outL = R;
      //   this.outR = L;
        
      //   this.over = R;
      //   this.base = L;
      // }
      // else if (knotType == "fb") {
      //   this.outL = L;
      //   this.outR = R;
        
      //   this.over = L;
      //   this.base = R;
      // }
      // else if (knotType == "bf") {
      //   this.outL = L;
      //   this.outR = R;
        
      //   this.over = R;
      //   this.base = L;
      // }
      // else if (knotType == "any") {
      //   // when two strings have the same color
      //   // treat it as if it's a forward knot
      //   this.outL = R;
      //   this.outR = L;
        
      //   this.over = L;
      //   this.base = R;
      // }
      // else {
      //   // no knot, knotType == "o"
      //   this.outL = this.inL;
      //   this.outR = this.inR;
        
      //   // may need to be redefined
      //   this.over = null;
      //   this.base = null;
      // }
    }

    flip() {
      let mirrorPairs = new Map(); // TODO: need a different parser to use static fields
      mirrorPairs.set("f", "b");
      mirrorPairs.set("b", "f");
      mirrorPairs.set("fb", "bf");
      mirrorPairs.set("bf", "fb");

      this.knotType = mirrorPairs.get(this.knotType);

      var temp = this.overString;
      this.overString = this.baseString;
      this.baseString = temp;
    }

    /* returns a boolean */
    mirrors(otherKnot) {
      let mirrorPairs = new Map();
      mirrorPairs.set("f", "b");
      mirrorPairs.set("b", "f");
      mirrorPairs.set("fb", "bf");
      mirrorPairs.set("bf", "fb");

      let mirrorType = mirrorPairs.get(this.knotType);
      // Boolean(this.a && this.b), !!(this.a && this.b)
      return Boolean(otherKnot.knotType == mirrorType);
    }

    // setLocalCoords(localX, localY){
    //   this.localCoords[0] = localX;
    //   this.localCoords[1] = localY;
    // }

    // getLocalCoords(){
    //   return this.localCoords;
    // }

    getKnotType(){
      return this.knotType;
    }

    setKnotType(newKnotType) {
      this.knotType = newKnotType;
      this.calcOutLR();
      this.calcOverBase();
    }

    getString(){
      var s = "knot";
      return s;
    }

    calcOutLR(){
      if (this.knotType == "f" || this.knotType == "b") {
        this.outL = this.inR;
        this.outR = this.inL;
      }
      else if (this.knotType == "fb" || this.knotType == "bf") {
        this.outL = this.inL;
        this.outR = this.inR;
      }
    }

    calcOverBase(){
      if (this.knotType == "f" || this.knotType == "fb") {
        this.over = this.inL;
        this.base = this.inR;
      }
      else if (this.knotType == "b" || this.knotType == "bf") {
        this.over = this.inR;
        this.base = this.inL;
      }
    }

    updateInLR(L, R){
      if (L != null) {
        this.inL = L;
      }
      if (R != null) {
        this.inR = R;
      }
      this.calcOutLR();
      this.calcOverBase();
    }

    // // Instance field
    // myField = "foo";

    // Instance method
    // myMethod() {
    //   // myMethod body
    // }

    // // Static field
    // static myStaticField = "bar";

    // // Static method
    // static myStaticMethod() {
    //   // myStaticMethod body
    // }

    // // Fields, methods, static fields, and static methods all have
    // // "private" forms
    // #myPrivateField = "bar";
  }

  // instead of using require for other nodes to access the class
  // put it in the graph system
  graph.k = {
    Knot,
  };

};
