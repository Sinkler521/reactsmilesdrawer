import {ArrayHelper} from '../ArrayHelper/ArrayHelper';
import {Vector2} from '../Vector2/Vector2';
import {RingConnection} from '../RingConnection/RingConnection';

/**
 * Creates a new ring.
 * 
 * @param {Number[]} members An array containing the vertex ids of the members of the ring to be created.
 * @returns {Object} The ring object with methods and properties.
 */
export const createRing = (members) => {
  let id = null;
  let edges = [];
  let insiders = [];
  let neighbours = [];
  let positioned = false;
  let center = new Vector2(0, 0);
  let rings = [];
  let isBridged = false;
  let isPartOfBridged = false;
  let isSpiro = false;
  let isFused = false;
  let centralAngle = 0.0;
  let canFlip = true;

  const clone = () => {
    const clone = createRing([...members]);
    clone.id = id;
    clone.insiders = ArrayHelper.clone(insiders);
    clone.neighbours = ArrayHelper.clone(neighbours);
    clone.positioned = positioned;
    clone.center = center.clone();
    clone.rings = ArrayHelper.clone(rings);
    clone.isBridged = isBridged;
    clone.isPartOfBridged = isPartOfBridged;
    clone.isSpiro = isSpiro;
    clone.isFused = isFused;
    clone.centralAngle = centralAngle;
    clone.canFlip = canFlip;

    return clone;
  };

  const getSize = () => members.length;

  const getPolygon = (vertices) => members.map(memberId => vertices[memberId].position);

  const getAngle = () => Math.PI - centralAngle;

  const eachMember = (vertices, callback, startVertexId = members[0], previousVertexId) => {
    let current = startVertexId;
    let max = 0;

    while (current !== null && max < 100) {
      const prev = current;
      callback(prev);
      current = vertices[current].getNextInRing(vertices, id, previousVertexId);
      previousVertexId = prev;
      if (current === startVertexId) {
        current = null;
      }
      max++;
    }
  };

  const getOrderedNeighbours = (ringConnections) => {
    return neighbours.map(neighbourId => {
      const vertices = RingConnection.getVertices(ringConnections, id, neighbourId);
      return {
        n: vertices.length,
        neighbour: neighbourId
      };
    }).sort((a, b) => b.n - a.n);
  };

  const isBenzeneLike = (vertices) => {
    const db = getDoubleBondCount(vertices);
    const length = members.length;
    return (db === 3 && length === 6) || (db === 2 && length === 5);
  };

  const getDoubleBondCount = (vertices) => {
    return members.reduce((count, memberId) => {
      const atom = vertices[memberId].value;
      if (atom.bondType === '=' || atom.branchBond === '=') {
        count++;
      }
      return count;
    }, 0);
  };

  const contains = (vertexId) => members.includes(vertexId);

  return {
    get id() { return id; },
    set id(value) { id = value; },
    get members() { return members; },
    get edges() { return edges; },
    get insiders() { return insiders; },
    set insiders(value) { insiders = value; },
    get neighbours() { return neighbours; },
    set neighbours(value) { neighbours = value; },
    get positioned() { return positioned; },
    set positioned(value) { positioned = value; },
    get center() { return center; },
    set center(value) { center = value; },
    get rings() { return rings; },
    set rings(value) { rings = value; },
    get isBridged() { return isBridged; },
    set isBridged(value) { isBridged = value; },
    get isPartOfBridged() { return isPartOfBridged; },
    set isPartOfBridged(value) { isPartOfBridged = value; },
    get isSpiro() { return isSpiro; },
    set isSpiro(value) { isSpiro = value; },
    get isFused() { return isFused; },
    set isFused(value) { isFused = value; },
    get centralAngle() { return centralAngle; },
    set centralAngle(value) { centralAngle = value; },
    get canFlip() { return canFlip; },
    set canFlip(value) { canFlip = value; },
    clone,
    getSize,
    getPolygon,
    getAngle,
    eachMember,
    getOrderedNeighbours,
    isBenzeneLike,
    getDoubleBondCount,
    contains
  };
};
