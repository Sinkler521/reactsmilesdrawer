/**
 * Creates a new edge.
 * 
 * @param {Number} sourceId The id of the source vertex.
 * @param {Number} targetId The id of the target vertex.
 * @param {Number} [weight=1] The weight of the edge.
 * @returns {Object} The edge object with methods and properties.
 */
export const createEdge = (sourceId, targetId, weight = 1) => {
    let id = null;
    let bondType = '-';
    let isPartOfAromaticRing = false;
    let center = false;
    let wedge = '';
  
    const bonds = {
      '-': 1,
      '/': 1,
      '\\': 1,
      '=': 2,
      '#': 3,
      '$': 4
    };
  
    const setBondType = (newBondType) => {
      bondType = newBondType;
      weight = bonds[newBondType];
    };
  
    return {
      get id() {
        return id;
      },
      set id(value) {
        id = value;
      },
      get sourceId() {
        return sourceId;
      },
      get targetId() {
        return targetId;
      },
      get weight() {
        return weight;
      },
      get bondType() {
        return bondType;
      },
      get isPartOfAromaticRing() {
        return isPartOfAromaticRing;
      },
      set isPartOfAromaticRing(value) {
        isPartOfAromaticRing = value;
      },
      get center() {
        return center;
      },
      set center(value) {
        center = value;
      },
      get wedge() {
        return wedge;
      },
      set wedge(value) {
        wedge = value;
      },
      setBondType
    };
  }