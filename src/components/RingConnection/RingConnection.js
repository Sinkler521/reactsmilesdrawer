//@ts-check
import {Vertex} from '../Vertex/Vertex';

function createRingConnection(firstRing, secondRing) {
    const state = {
        id: null,
        firstRingId: firstRing.id,
        secondRingId: secondRing.id,
        vertices: new Set()
    };

    for (let m = 0; m < firstRing.members.length; m++) {
        let c = firstRing.members[m];

        for (let n = 0; n < secondRing.members.length; n++) {
            let d = secondRing.members[n];

            if (c === d) {
                state.vertices.add(c);
            }
        }
    }

    return {
        ...state,
        addVertex,
        updateOther,
        containsRing,
        isBridge,
        getNeighbours,
        getVertices,
        isBridgeStatic
    };
}

/**
 * Adds a vertex to the ring connection.
 * 
 * @param {Object} state The ring connection state.
 * @param {Number} vertexId A vertex id.
 */
function addVertex(state, vertexId) {
    state.vertices.add(vertexId);
}

/**
 * Updates the ring id of this ring connection that is not the ring id supplied as the second argument.
 * 
 * @param {Object} state The ring connection state.
 * @param {Number} ringId A ring id. The new ring id to be set.
 * @param {Number} otherRingId A ring id. The id that is NOT to be updated.
 */
function updateOther(state, ringId, otherRingId) {
    if (state.firstRingId === otherRingId) {
        state.secondRingId = ringId;
    } else {
        state.firstRingId = ringId;
    }
}

/**
 * Returns a boolean indicating whether or not a ring with a given id is participating in this ring connection.
 * 
 * @param {Object} state The ring connection state.
 * @param {Number} ringId A ring id.
 * @returns {Boolean} A boolean indicating whether or not a ring with a given id participates in this ring connection.
 */
function containsRing(state, ringId) {
    return state.firstRingId === ringId || state.secondRingId === ringId;
}

/**
 * Checks whether or not this ring connection is a bridge in a bridged ring.
 * 
 * @param {Object} state The ring connection state.
 * @param {Vertex[]} vertices The array of vertices associated with the current molecule.
 * @returns {Boolean} A boolean indicating whether or not this ring connection is a bridge.
 */
function isBridge(state, vertices) {
    if (state.vertices.size > 2) {
        return true;
    }

    for (let vertexId of state.vertices) {
        if (vertices[vertexId].value.rings.length > 2) {
            return true;
        }
    }

    return false;
}

/**
 * Checks whether or not two rings are connected by a bridged bond.
 * 
 * @param {RingConnection[]} ringConnections An array of ring connections containing the ring connections associated with the current molecule.
 * @param {Vertex[]} vertices An array of vertices containing the vertices associated with the current molecule.
 * @param {Number} firstRingId A ring id.
 * @param {Number} secondRingId A ring id.
 * @returns {Boolean} A boolean indicating whether or not two rings are connected by a bridged bond.
 */
function isBridgeStatic(ringConnections, vertices, firstRingId, secondRingId) {
    let ringConnection = null;

    for (let i = 0; i < ringConnections.length; i++) {
        ringConnection = ringConnections[i];

        if (ringConnection.firstRingId === firstRingId && ringConnection.secondRingId === secondRingId ||
            ringConnection.firstRingId === secondRingId && ringConnection.secondRingId === firstRingId) {
            return ringConnection.isBridge(vertices);
        }
    }

    return false;
}

/**
 * Returns the neighbouring rings of a given ring.
 * 
 * @param {RingConnection[]} ringConnections An array of ring connections containing ring connections associated with the current molecule.
 * @param {Number} ringId A ring id.
 * @returns {Number[]} An array of ring ids of neighbouring rings.
 */
function getNeighbours(ringConnections, ringId) {
    let neighbours = [];

    for (let i = 0; i < ringConnections.length; i++) {
        let ringConnection = ringConnections[i];

        if (ringConnection.firstRingId === ringId) {
            neighbours.push(ringConnection.secondRingId);
        } else if (ringConnection.secondRingId === ringId) {
            neighbours.push(ringConnection.firstRingId);
        }
    }

    return neighbours;
}

/**
 * Returns an array of vertex ids associated with a given ring connection.
 * 
 * @param {RingConnection[]} ringConnections An array of ring connections containing ring connections associated with the current molecule.
 * @param {Number} firstRingId A ring id.
 * @param {Number} secondRingId A ring id.
 * @returns {Number[]} An array of vertex ids associated with the ring connection.
 */
function getVertices(ringConnections, firstRingId, secondRingId) {
    for (let i = 0; i < ringConnections.length; i++) {
        let ringConnection = ringConnections[i];
        if (ringConnection.firstRingId === firstRingId && ringConnection.secondRingId === secondRingId ||
            ringConnection.firstRingId === secondRingId && ringConnection.secondRingId === firstRingId) {
            return [...ringConnection.vertices];
        }
    }
}

export {
    createRingConnection,
    addVertex,
    updateOther,
    containsRing,
    isBridge,
    getNeighbours,
    getVertices,
    isBridgeStatic
};