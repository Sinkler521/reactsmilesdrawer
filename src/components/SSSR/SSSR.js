//@ts-check
import { Graph } from "../Graph/Graph";

/**
 * Returns an array containing arrays, each representing a ring from the smallest set of smallest rings in the graph.
 * 
 * @param {Graph} graph A Graph object.
 * @param {Boolean} [experimental=false] Whether or not to use experimental SSSR.
 * @returns {Array[]} An array containing arrays, each representing a ring from the smallest set of smallest rings in the group.
 */
function getRings(graph, experimental = false){
    let adjacencyMatrix = graph.getComponentsAdjacencyMatrix();
    if (adjacencyMatrix.length === 0) {
        return null;
    }

    let connectedComponents = Graph.getConnectedComponents(adjacencyMatrix);
    let rings = [];

    for (let i = 0; i < connectedComponents.length; i++) {
        let connectedComponent = connectedComponents[i];
        let ccAdjacencyMatrix = graph.getSubgraphAdjacencyMatrix([...connectedComponent]);

        let arrBondCount = new Uint16Array(ccAdjacencyMatrix.length);
        let arrRingCount = new Uint16Array(ccAdjacencyMatrix.length);

        for (let j = 0; j < ccAdjacencyMatrix.length; j++) {
            arrRingCount[j] = 0;
            arrBondCount[j] = 0;

            for (let k = 0; k < ccAdjacencyMatrix[j].length; k++) {
                arrBondCount[j] += ccAdjacencyMatrix[j][k];
            }
        }

        // Get the edge number and the theoretical number of rings in SSSR
        let nEdges = 0;

        for (let j = 0; j < ccAdjacencyMatrix.length; j++) {
            for (let k = j + 1; k < ccAdjacencyMatrix.length; k++) {
                nEdges += ccAdjacencyMatrix[j][k];
            }
        }

        let nSssr = nEdges - ccAdjacencyMatrix.length + 1;

        // If all vertices have 3 incident edges, calculate with different formula (see Euler)
        let allThree = true;
        for (let j = 0; j < arrBondCount.length; j++) {
            if (arrBondCount[j] !== 3) {
                allThree = false;
            }
        }

        if (allThree) {
            nSssr = 2.0 + nEdges - ccAdjacencyMatrix.length;
        }

        // All vertices are part of one ring if theres only one ring.
        if (nSssr === 1) {
            rings.push([...connectedComponent]);
            continue;
        }

        if (experimental) {
            nSssr = 999;
        }

        let { d, pe, pe_prime } = getPathIncludedDistanceMatrices(ccAdjacencyMatrix);
        let c = getRingCandidates(d, pe, pe_prime);
        let sssr = getSSSR(c, d, ccAdjacencyMatrix, pe, pe_prime, arrBondCount, arrRingCount, nSssr);

        for (let j = 0; j < sssr.length; j++) {
            let ring = Array(sssr[j].size);
            let index = 0;

            for (let val of sssr[j]) {
                // Get the original id of the vertex back
                ring[index++] = connectedComponent[val];
            }

            rings.push(ring);
        }
    }

    return rings;
}

/**
 * Creates a printable string from a matrix (2D array).
 * 
 * @param {Array[]} matrix A 2D array.
 * @returns {String} A string representing the matrix.
 */
function matrixToString(matrix) {
    let str = '';

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            str += matrix[i][j] + ' ';
        }

        str += '\n';
    }

    return str;
}

/**
 * Returnes the two path-included distance matrices used to find the sssr.
 * 
 * @param {Array[]} adjacencyMatrix An adjacency matrix.
 * @returns {Object} The path-included distance matrices. { p1, p2 }
 */
function getPathIncludedDistanceMatrices(adjacencyMatrix) {
    let length = adjacencyMatrix.length;
    let d = Array(length);
    let pe = Array(length);
    let pe_prime = Array(length);
    let l = 0;
    let m = 0;
    let n = 0;

    let i = length;
    while (i--) {
        d[i] = Array(length);
        pe[i] = Array(length);
        pe_prime[i] = Array(length);

        let j = length;
        while (j--) {
            d[i][j] = (i === j || adjacencyMatrix[i][j] === 1) ? adjacencyMatrix[i][j] : Number.POSITIVE_INFINITY;

            if (d[i][j] === 1) {
                pe[i][j] = [[[i, j]]];
            } else {
                pe[i][j] = [];
            }

            pe_prime[i][j] = [];
        }
    }

    let k = length;
    let j;
    while (k--) {
        i = length;
        while (i--) {
            j = length;
            while (j--) {
                const previousPathLength = d[i][j];
                const newPathLength = d[i][k] + d[k][j];

                if (previousPathLength > newPathLength) {
                    let l, m, n;
                    if (previousPathLength === newPathLength + 1) {
                        pe_prime[i][j] = [pe[i][j].length];
                        l = pe[i][j].length;
                        while (l--) {
                            pe_prime[i][j][l] = [pe[i][j][l].length];
                            m = pe[i][j][l].length;
                            while (m--) {
                                pe_prime[i][j][l][m] = [pe[i][j][l][m].length];
                                n = pe[i][j][l][m].length;
                                while (n--) {
                                    pe_prime[i][j][l][m][n] = [pe[i][j][l][m][0], pe[i][j][l][m][1]];
                                }
                            }
                        }
                    } else {
                        pe_prime[i][j] = [];
                    }

                    d[i][j] = newPathLength;

                    pe[i][j] = [[]];

                    l = pe[i][k][0].length;
                    while (l--) {
                        pe[i][j][0].push(pe[i][k][0][l]);
                    }

                    l = pe[k][j][0].length;
                    while (l--) {
                        pe[i][j][0].push(pe[k][j][0][l]);
                    }
                } else if (previousPathLength === newPathLength) {
                    if (pe[i][k].length && pe[k][j].length) {
                        let l;
                        if (pe[i][j].length) {
                            let tmp = [];

                            l = pe[i][k][0].length;
                            while (l--) {
                                tmp.push(pe[i][k][0][l]);
                            }

                            l = pe[k][j][0].length;
                            while (l--) {
                                tmp.push(pe[k][j][0][l]);
                            }

                            pe[i][j].push(tmp);
                        } else {
                            let tmp = [];
                            l = pe[i][k][0].length;
                            while (l--) {
                                tmp.push(pe[i][k][0][l]);
                            }

                            l = pe[k][j][0].length;
                            while (l--) {
                                tmp.push(pe[k][j][0][l]);
                            }

                            pe[i][j][0] = tmp;
                        }
                    }
                } else if (previousPathLength === newPathLength - 1) {
                    let l;
                    if (pe_prime[i][j].length) {
                        let tmp = [];

                        l = pe[i][k][0].length;
                        while (l--) {
                            tmp.push(pe[i][k][0][l]);
                        }

                        l = pe[k][j][0].length;
                        while (l--) {
                            tmp.push(pe[k][j][0][l]);
                        }

                        pe_prime[i][j].push(tmp);
                    } else {
                        let tmp = [];

                        l = pe[i][k][0].length;
                        while (l--) {
                            tmp.push(pe[i][k][0][l]);
                        }

                        l = pe[k][j][0].length;
                        while (l--) {
                            tmp.push(pe[k][j][0][l]);
                        }

                        pe_prime[i][j][0] = tmp;
                    }
                }
            }
        }
    }

    return {
        d: d,
        pe: pe,
        pe_prime: pe_prime,
    };
}

/**
 * Get the ring candidates from the path-included distance matrices.
 * 
 * @param {Array[]} d The distance matrix.
 * @param {Array[]} pe A matrix containing the shortest paths.
 * @param {Array[]} pe_prime A matrix containing the shortest paths + one vertex.
 * @returns {Array[]} The ring candidates.
 */
function getRingCandidates(d, pe, pe_prime) {
    let length = d.length;
    let candidates = [];
    let c = 0;

    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            if (d[i][j] === 0 || (pe[i][j].length === 1 && pe_prime[i][j] === 0)) {
                continue;
            } else {
                // c is the number of vertices in the cycle.
                if (pe_prime[i][j].length !== 0) {
                    c = 2 * (d[i][j] + 0.5);
                } else {
                    c = 2 * d[i][j];
                }

                if (c !== Infinity) {
                    candidates.push([c, pe[i][j], pe_prime[i][j]]);
                }
            }
        }
    }

    // Candidates have to be sorted by c
    candidates.sort((a, b) => a[0] - b[0]);

    return candidates;
}

/**
 * Searches the candidates for the smallest set of smallest rings.
 * 
 * @param {Array[]} c The candidates.
 * @param {Array[]} d The distance matrix.
 * @param {Array[]} adjacencyMatrix An adjacency matrix.
 * @param {Array[]} pe A matrix containing the shortest paths.
 * @param {Array[]} pe_prime A matrix containing the shortest paths + one vertex.
 * @param {Uint16Array} arrBondCount A matrix containing the bond count of each vertex.
 * @param {Uint16Array} arrRingCount A matrix containing the number of rings associated with each vertex.
 * @param {Number} nsssr The theoretical number of rings in the graph.
 * @returns {Set[]} The smallest set of smallest rings.
 */
function getSSSR(c, d, adjacencyMatrix, pe, pe_prime, arrBondCount, arrRingCount, nsssr) {
    let cSssr = [];
    let allBonds = [];

    for (let i = 0; i < c.length; i++) {
        if (c[i][0] % 2 !== 0) {
            for (let j = 0; j < c[i][2].length; j++) {
                let bonds = c[i][1][0].concat(c[i][2][j]);
                // Some bonds are added twice, resulting in [[u, v], [u, v]] instead of [u, v].
                for (let k = 0; k < bonds.length; k++) {
                    if (bonds[k][0].constructor === Array) bonds[k] = bonds[k][0];
                }

                let atoms = bondsToAtoms(bonds);

                if (getBondCount(atoms, adjacencyMatrix) === atoms.size && !pathSetsContain(cSssr, atoms, bonds, allBonds, arrBondCount, arrRingCount)) {
                    cSssr.push(atoms);
                    allBonds = allBonds.concat(bonds);
                }

                if (cSssr.length > nsssr) {
                    return cSssr;
                }
            }
        } else {
            for (let j = 0; j < c[i][1].length - 1; j++) {
                let bonds = c[i][1][j].concat(c[i][1][j + 1]);
                // Some bonds are added twice, resulting in [[u, v], [u, v]] instead of [u, v].
                for (let k = 0; k < bonds.length; k++) {
                    if (bonds[k][0].constructor === Array) bonds[k] = bonds[k][0];
                }

                let atoms = bondsToAtoms(bonds);

                if (getBondCount(atoms, adjacencyMatrix) === atoms.size && !pathSetsContain(cSssr, atoms, bonds, allBonds, arrBondCount, arrRingCount)) {
                    cSssr.push(atoms);
                    allBonds = allBonds.concat(bonds);
                }

                if (cSssr.length > nsssr) {
                    return cSssr;
                }
            }
        }
    }

    return cSssr;
}

/**
 * Returns the number of edges in a graph defined by an adjacency matrix.
 * 
 * @param {Array[]} adjacencyMatrix An adjacency matrix.
 * @returns {Number} The number of edges in the graph defined by the adjacency matrix.
 */
function getEdgeCount(adjacencyMatrix) {
    let edgeCount = 0;
    let length = adjacencyMatrix.length;

    let i = length - 1;
    while (i--) {
        let j = length;
        while (j--) {
            if (adjacencyMatrix[i][j] === 1) {
                edgeCount++;
            }
        }
    }

    return edgeCount;
}

/**
 * Returns an edge list constructed from an adjacency matrix.
 * 
 * @param {Array[]} adjacencyMatrix An adjacency matrix.
 * @returns {Array[]} An edge list. E.g. [ [ 0, 1 ], ..., [ 16, 2 ] ]
 */
function getEdgeList(adjacencyMatrix) {
    let length = adjacencyMatrix.length;
    let edgeList = [];

    let i = length - 1;
    while (i--) {
        let j = length;
        while (j--) {
            if (adjacencyMatrix[i][j] === 1) {
                edgeList.push([i, j]);
            }
        }
    }

    return edgeList;
}

/**
 * Return a set of vertex indices contained in an array of bonds.
 * 
 * @param {Array} bonds An array of bonds. A bond is defined as [ sourceVertexId, targetVertexId ].
 * @returns {Set<Number>} An array of vertices.
 */
function bondsToAtoms(bonds) {
    let atoms = new Set();

    let i = bonds.length;
    while (i--) {
        atoms.add(bonds[i][0]);
        atoms.add(bonds[i][1]);
    }
    return atoms;
}

/**
* Returns the number of bonds within a set of atoms.
* 
* @param {Set<Number>} atoms An array of atom ids.
* @param {Array[]} adjacencyMatrix An adjacency matrix.
* @returns {Number} The number of bonds in a set of atoms.
*/
function getBondCount(atoms, adjacencyMatrix) {
    let count = 0;
    for (let u of atoms) {
        for (let v of atoms) {
            if (u === v) {
                continue;
            }
            count += adjacencyMatrix[u][v];
        }
    }

    return count / 2;
}

/**
 * Checks whether or not a given path already exists in an array of paths.
 * 
 * @param {Set[]} pathSets An array of sets each representing a path.
 * @param {Set<Number>} pathSet A set representing a path.
 * @param {Array[]} bonds The bonds associated with the current path.
 * @param {Array[]} allBonds All bonds currently associated with rings in the SSSR set.
 * @param {Uint16Array} arrBondCount A matrix containing the bond count of each vertex.
 * @param {Uint16Array} arrRingCount A matrix containing the number of rings associated with each vertex.
 * @returns {Boolean} A boolean indicating whether or not a give path is contained within a set.
 */
function pathSetsContain(pathSets, pathSet, bonds, allBonds, arrBondCount, arrRingCount) {
    let i = pathSets.length;
    while (i--) {
        if (isSupersetOf(pathSet, pathSets[i])) {
            return true;
        }

        if (pathSets[i].size !== pathSet.size) {
            continue;
        }

        if (areSetsEqual(pathSets[i], pathSet)) {
            return true;
        }
    }

    // Check if the edges from the candidate are already all contained within the paths of the set of paths.
    let count = 0;
    let allContained = false;
    i = bonds.length;
    while (i--) {
        let j = allBonds.length;
        while (j--) {
            if ((bonds[i][0] === allBonds[j][0] && bonds[i][1] === allBonds[j][1]) ||
                (bonds[i][1] === allBonds[j][0] && bonds[i][0] === allBonds[j][1])) {
                count++;
            }

            if (count === bonds.length) {
                allContained = true;
            }
        }
    }

    // If all the bonds and thus vertices are already contained within other rings
    // check if there's one vertex with ringCount < bondCount
    let specialCase = false;
    if (allContained) {
        for (let element of pathSet) {
            if (arrRingCount[element] < arrBondCount[element]) {
                specialCase = true;
                break;
            }
        }
    }

    if (allContained && !specialCase) {
        return true;
    }

    // Update the ring counts for the vertices
    for (let element of pathSet) {
        arrRingCount[element]++;
    }

    return false;
}

/**
 * Checks whether or not two sets are equal (contain the same elements).
 * 
 * @param {Set<Number>} setA A set.
 * @param {Set<Number>} setB A set.
 * @returns {Boolean} A boolean indicating whether or not the two sets are equal.
 */
function areSetsEqual(setA, setB) {
    if (setA.size !== setB.size) {
        return false;
    }

    for (let element of setA) {
        if (!setB.has(element)) {
            return false;
        }
    }

    return true;
}

/**
 * Checks whether or not a set (setA) is a superset of another set (setB).
 * 
 * @param {Set<Number>} setA A set.
 * @param {Set<Number>} setB A set.
 * @returns {Boolean} A boolean indicating whether or not setB is a superset of setA.
 */
function isSupersetOf(setA, setB) {
    for (let element of setB) {
        if (!setA.has(element)) {
            return false;
        }
    }

    return true;
}

module.exports = {
    getRings,
    matrixToString,
    getPathIncludedDistanceMatrices,
    getRingCandidates,
    getSSSR,
    getEdgeCount,
    getEdgeList,
    bondsToAtoms,
    getBondCount,
    pathSetsContain,
    areSetsEqual,
    isSupersetOf,
};
