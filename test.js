exports.type = class {
  constructor(cucc) {
    this.cucc = cucc;
  }
  
  print(node) {
    node.error(this.cucc);
  }
}
