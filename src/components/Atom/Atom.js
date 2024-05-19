//@ts-check
const ArrayHelper = require('../ArrayHelper/ArrayHelper');
const Vertex = require('../Vertex/Vertex');
const Ring = require('../Ring/Ring');

/**
 * A class representing an atom.
 * 
 * @property {String} element The element symbol of this atom. Single-letter symbols are always uppercase. Examples: H, C, F, Br, Si, ...
 * @property {Boolean} drawExplicit A boolean indicating whether or not this atom is drawn explicitly (for example, a carbon atom). This overrides the default behaviour.
 * @property {Object[]} ringbonds An array containing the ringbond ids and bond types as specified in the original SMILE.
 * @property {String} branchBond The branch bond as defined in the SMILES.
 * @property {Number} ringbonds[].id The ringbond id as defined in the SMILES.
 * @property {String} ringbonds[].bondType The bond type of the ringbond as defined in the SMILES.
 * @property {Number[]} rings The ids of rings which contain this atom.
 * @property {String} bondType The bond type associated with this array. Examples: -, =, #, ...
 * @property {Boolean} isBridge A boolean indicating whether or not this atom is part of a bridge in a bridged ring (contained by the largest ring).
 * @property {Boolean} isBridgeNode A boolean indicating whether or not this atom is a bridge node (a member of the largest ring in a bridged ring which is connected to a bridge-atom).
 * @property {Number[]} originalRings Used to back up rings when they are replaced by a bridged ring.
 * @property {Number} bridgedRing The id of the bridged ring if the atom is part of a bridged ring.
 * @property {Number[]} anchoredRings The ids of the rings that are anchored to this atom. The centers of anchored rings are translated when this atom is translated.
 * @property {Object} bracket If this atom is defined as a bracket atom in the original SMILES, this object contains all the bracket information. Example: { hcount: {Number}, charge: ['--', '-', '+', '++'], isotope: {Number} }.
 * @property {Number} plane Specifies on which "plane" the atoms is in stereochemical depictions (-1 back, 0 middle, 1 front).
 * @property {Object[]} attachedPseudoElements A map with containing information for pseudo elements or concatenated elements. The key is comprised of the element symbol and the hydrogen count.
 * @property {String} attachedPseudoElement[].element The element symbol.
 * @property {Number} attachedPseudoElement[].count The number of occurrences that match the key.
 * @property {Number} attachedPseudoElement[].hydrogenCount The number of hydrogens attached to each atom matching the key.
 * @property {Boolean} hasAttachedPseudoElements A boolean indicating whether or not this atom will be drawn with an attached pseudo element or concatenated elements.
 * @property {Boolean} isDrawn A boolean indicating whether or not this atom is drawn. In contrast to drawExplicit, the bond is drawn neither.
 * @property {Boolean} isConnectedToRing A boolean indicating whether or not this atom is directly connected (but not a member of) a ring.
 * @property {String[]} neighbouringElements An array containing the element symbols of neighbouring atoms.
 * @property {Boolean} isPartOfAromaticRing A boolean indicating whether or not this atom is part of an explicitly defined aromatic ring. Example: c1ccccc1.
 * @property {Number} bondCount The number of bonds in which this atom is participating.
 * @property {String} chirality The chirality of this atom if it is a stereocenter (R or S).
 * @property {Number} priority The priority of this atom according to the CIP rules, where 0 is the highest priority.
 * @property {Boolean} mainChain A boolean indicating whether or not this atom is part of the main chain (used for chirality).
 * @property {String} hydrogenDirection The direction of the hydrogen, either up or down. Only for stereocenters with an explicit hydrogen.
 * @property {Number} subtreeDepth The depth of the subtree coming from a stereocenter.
 * @property {Number} class
 */
export const Atom = (element, bondType = '-') => {
  let atom = {
    idx: null,
    element: element.length === 1 ? element.toUpperCase() : element,
    drawExplicit: false,
    ringbonds: [],
    rings: [],
    bondType: bondType,
    branchBond: null,
    isBridge: false,
    isBridgeNode: false,
    originalRings: [],
    bridgedRing: null,
    anchoredRings: [],
    bracket: null,
    plane: 0,
    attachedPseudoElements: {},
    hasAttachedPseudoElements: false,
    isDrawn: true,
    isConnectedToRing: false,
    neighbouringElements: [],
    isPartOfAromaticRing: element !== element.toUpperCase(),
    bondCount: 0,
    chirality: '',
    isStereoCenter: false,
    priority: 0,
    mainChain: false,
    hydrogenDirection: 'down',
    subtreeDepth: 1,
    hasHydrogen: false,
    class: undefined,

    addNeighbouringElement(element) {
      this.neighbouringElements.push(element);
    },

    attachPseudoElement(element, previousElement, hydrogenCount = 0, charge = 0) {
      if (hydrogenCount === null) {
        hydrogenCount = 0;
      }

      if (charge === null) {
        charge = 0;
      }

      let key = hydrogenCount + element + charge;

      if (this.attachedPseudoElements[key]) {
        this.attachedPseudoElements[key].count += 1;
      } else {
        this.attachedPseudoElements[key] = {
          element: element,
          count: 1,
          hydrogenCount: hydrogenCount,
          previousElement: previousElement,
          charge: charge,
        };
      }

      this.hasAttachedPseudoElements = true;
    },

    getAttachedPseudoElements() {
      let ordered = {};
      let that = this;

      Object.keys(this.attachedPseudoElements)
        .sort()
        .forEach(function (key) {
          ordered[key] = that.attachedPseudoElements[key];
        });

      return ordered;
    },

    getAttachedPseudoElementsCount() {
      return Object.keys(this.attachedPseudoElements).length;
    },

    isHeteroAtom() {
      return this.element !== 'C' && this.element !== 'H';
    },

    addAnchoredRing(ringId) {
      if (!ArrayHelper.contains(this.anchoredRings, { value: ringId })) {
        this.anchoredRings.push(ringId);
      }
    },

    getRingbondCount() {
      return this.ringbonds.length;
    },

    backupRings() {
      this.originalRings = Array(this.rings.length);

      for (let i = 0; i < this.rings.length; i++) {
        this.originalRings[i] = this.rings[i];
      }
    },

    restoreRings() {
      this.rings = Array(this.originalRings.length);

      for (let i = 0; i < this.originalRings.length; i++) {
        this.rings[i] = this.originalRings[i];
      }
    },

    haveCommonRingbond(atomA, atomB) {
      for (let i = 0; i < atomA.ringbonds.length; i++) {
        for (let j = 0; j < atomB.ringbonds.length; j++) {
          if (atomA.ringbonds[i].id === atomB.ringbonds[j].id) {
            return true;
          }
        }
      }

      return false;
    },

    neighbouringElementsEqual(arr) {
      if (arr.length !== this.neighbouringElements.length) {
        return false;
      }

      arr.sort();
      this.neighbouringElements.sort();

      for (let i = 0; i < this.neighbouringElements.length; i++) {
        if (arr[i] !== this.neighbouringElements[i]) {
          return false;
        }
      }

      return true;
    },

    getAtomicNumber() {
      return Atom.atomicNumbers[this.element];
    },

    getMaxBonds() {
      return Atom.maxBonds[this.element];
    },
  };

  return atom;
};

/**
 * A map mapping element symbols to their maximum bonds.
 */
Atom.maxBonds = {
  H: 1,
  C: 4,
  N: 3,
  O: 2,
  P: 3,
  S: 2,
  B: 3,
  F: 1,
  I: 1,
  Cl: 1,
  Br: 1,
};

/**
 * A map mapping element symbols to the atomic number.
 */
Atom.atomicNumbers = {
  H: 1,
  He: 2,
  Li: 3,
  Be: 4,
  B: 5,
  b: 5,
  C: 6,
  c: 6,
  N: 7,
  n: 7,
  O: 8,
  o: 8,
  F: 9,
  Ne: 10,
  Na: 11,
  Mg: 12,
  Al: 13,
  Si: 14,
  P: 15,
  p: 15,
  S: 16,
  s: 16,
  Cl: 17,
  Ar: 18,
  K: 19,
  Ca: 20,
  Sc: 21,
  Ti: 22,
  V: 23,
  Cr: 24,
  Mn: 25,
  Fe: 26,
  Co: 27,
  Ni: 28,
  Cu: 29,
  Zn: 30,
  Ga: 31,
  Ge: 32,
  As: 33,
  Se: 34,
  Br: 35,
  Kr: 36,
  Rb: 37,
  Sr: 38,
  Y: 39,
  Zr: 40,
  Nb: 41,
  Mo: 42,
  Tc: 43,
  Ru: 44,
  Rh: 45,
  Pd: 46,
  Ag: 47,
  Cd: 48,
  In: 49,
  Sn: 50,
  Sb: 51,
  Te: 52,
  I: 53,
  Xe: 54,
  Cs: 55,
  Ba: 56,
  La: 57,
  Ce: 58,
  Pr: 59,
  Nd: 60,
  Pm: 61,
  Sm: 62,
  Eu: 63,
  Gd: 64,
  Tb: 65,
  Dy: 66,
  Ho: 67,
  Er: 68,
  Tm: 69,
  Yb: 70,
  Lu: 71,
  Hf: 72,
  Ta: 73,
  W: 74,
  Re: 75,
  Os: 76,
  Ir: 77,
  Pt: 78,
  Au: 79,
  Hg: 80,
  Tl: 81,
  Pb: 82,
  Bi: 83,
  Po: 84,
  At: 85,
  Rn: 86,
  Fr: 87,
  Ra: 88,
  Ac: 89,
  Th: 90,
  Pa: 91,
  U: 92,
  Np: 93,
  Pu: 94,
  Am: 95,
  Cm: 96,
  Bk: 97,
  Cf: 98,
  Es: 99,
  Fm: 100,
  Md: 101,
  No: 102,
  Lr: 103,
  Rf: 104,
  Db: 105,
  Sg: 106,
  Bh: 107,
  Hs: 108,
  Mt: 109,
  Ds: 110,
  Rg: 111,
  Cn: 112,
  Uut: 113,
  Uuq: 114,
  Uup: 115,
  Uuh: 116,
  Uus: 117,
  Uuo: 118,
};

/**
 * A map mapping element symbols to the atomic mass.
 */
Atom.mass = {
  H: 1,
  He: 2,
  Li: 3,
  Be: 4,
  B: 5,
  b: 5,
  C: 6,
  c: 6,
  N: 7,
  n: 7,
  O: 8,
  o: 8,
  F: 9,
  Ne: 10,
  Na: 11,
  Mg: 12,
  Al: 13,
  Si: 14,
  P: 15,
  p: 15,
  S: 16,
  s: 16,
  Cl: 17,
  Ar: 18,
  K: 19,
  Ca: 20,
  Sc: 21,
  Ti: 22,
  V: 23,
  Cr: 24,
  Mn: 25,
  Fe: 26,
  Co: 27,
  Ni: 28,
  Cu: 29,
  Zn: 30,
  Ga: 31,
  Ge: 32,
  As: 33,
  Se: 34,
  Br: 35,
  Kr: 36,
  Rb: 37,
  Sr: 38,
  Y: 39,
  Zr: 40,
  Nb: 41,
  Mo: 42,
  Tc: 43,
  Ru: 44,
  Rh: 45,
  Pd: 46,
  Ag: 47,
  Cd: 48,
  In: 49,
  Sn: 50,
  Sb: 51,
  Te: 52,
  I: 53,
  Xe: 54,
  Cs: 55,
  Ba: 56,
  La: 57,
  Ce: 58,
  Pr: 59,
  Nd: 60,
  Pm: 61,
  Sm: 62,
  Eu: 63,
  Gd: 64,
  Tb: 65,
  Dy: 66,
  Ho: 67,
  Er: 68,
  Tm: 69,
  Yb: 70,
  Lu: 71,
  Hf: 72,
  Ta: 73,
  W: 74,
  Re: 75,
  Os: 76,
  Ir: 77,
  Pt: 78,
  Au: 79,
  Hg: 80,
  Tl: 81,
  Pb: 82,
  Bi: 83,
  Po: 84,
  At: 85,
  Rn: 86,
  Fr: 87,
  Ra: 88,
  Ac: 89,
  Th: 90,
  Pa: 91,
  U: 92,
  Np: 93,
  Pu: 94,
  Am: 95,
  Cm: 96,
  Bk: 97,
  Cf: 98,
  Es: 99,
  Fm: 100,
  Md: 101,
  No: 102,
  Lr: 103,
  Rf: 104,
  Db: 105,
  Sg: 106,
  Bh: 107,
  Hs: 108,
  Mt: 109,
  Ds: 110,
  Rg: 111,
  Cn: 112,
  Uut: 113,
  Uuq: 114,
  Uup: 115,
  Uuh: 116,
  Uus: 117,
  Uuo: 118,
};

module.exports = Atom;