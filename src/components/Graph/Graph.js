import { Vertex } from '../Vertex/Vertex';
import { Edge } from '../Edge/Edge';
import { Atom } from '../Atom/Atom';

export const Graph = ({ parseTree, isomeric = false }) => {
  const vertices = [];
  const edges = [];
  const atomIdxToVertexId = [];
  const vertexIdsToEdgeId = {};
  let _atomIdx = 0;
  let _time = 0;

  const _init = (node, order = 0, parentVertexId = null, isBranch = false) => {
    const element = node.atom.element || node.atom;
    const atom = new Atom(element, node.bond);

    if (element !== 'H' || (!node.hasNext && parentVertexId === null)) {
      atom.idx = _atomIdx++;
    }

    atom.branchBond = node.branchBond;
    atom.ringbonds = node.ringbonds;
    atom.bracket = node.atom.element ? node.atom : null;
    atom.class = node.atom.class;

    const vertex = new Vertex(atom);
    const parentVertex = vertices[parentVertexId];

    addVertex(vertex);

    if (atom.idx !== null) {
      atomIdxToVertexId.push(vertex.id);
    }

    if (parentVertexId !== null) {
      vertex.setParentVertexId(parentVertexId);
      vertex.value.addNeighbouringElement(parentVertex.value.element);
      parentVertex.addChild(vertex.id);
      parentVertex.value.addNeighbouringElement(atom.element);

      parentVertex.spanningTreeChildren.push(vertex.id);

      const edge = new Edge(parentVertexId, vertex.id, 1);

      if (isBranch) {
        edge.setBondType(vertex.value.branchBond || '-');
      } else {
        edge.setBondType(parentVertex.value.bondType || '-');
      }

      addEdge(edge);
    }

    let offset = node.ringbondCount + 1;
    if (atom.bracket) {
      offset += atom.bracket.hcount;
    }

    if (atom.bracket && atom.bracket.chirality) {
      atom.isStereoCenter = true;
      for (let i = 0; i < atom.bracket.hcount; i++) {
        _init({
          atom: 'H',
          isBracket: 'false',
          branches: [],
          branchCount: 0,
          ringbonds: [],
          ringbondCount: false,
          next: null,
          hasNext: false,
          bond: '-'
        }, i, vertex.id, true);
      }
    }

    for (let i = 0; i < node.branchCount; i++) {
      _init(node.branches[i], i + offset, vertex.id, true);
    }

    if (node.hasNext) {
      _init(node.next, node.branchCount + offset, vertex.id);
    }
  };

  const clear = () => {
    vertices.length = 0;
    edges.length = 0;
    vertexIdsToEdgeId = {};
  };

  const addVertex = (vertex) => {
    vertex.id = vertices.length;
    vertices.push(vertex);
    return vertex.id;
  };

  const addEdge = (edge) => {
    const source = vertices[edge.sourceId];
    const target = vertices[edge.targetId];

    edge.id = edges.length;
    edges.push(edge);

    vertexIdsToEdgeId[`${edge.sourceId}_${edge.targetId}`] = edge.id;
    vertexIdsToEdgeId[`${edge.targetId}_${edge.sourceId}`] = edge.id;
    edge.isPartOfAromaticRing = source.value.isPartOfAromaticRing && target.value.isPartOfAromaticRing;

    source.value.bondCount += edge.weight;
    target.value.bondCount += edge.weight;

    source.edges.push(edge.id);
    target.edges.push(edge.id);

    return edge.id;
  };

  const getEdge = (vertexIdA, vertexIdB) => {
    const edgeId = vertexIdsToEdgeId[`${vertexIdA}_${vertexIdB}`];
    return edgeId === undefined ? null : edges[edgeId];
  };

  const getEdges = (vertexId) => {
    const edgeIds = [];
    const vertex = vertices[vertexId];

    vertex.neighbours.forEach(neighbourId => {
      edgeIds.push(vertexIdsToEdgeId[`${vertexId}_${neighbourId}`]);
    });

    return edgeIds;
  };

  const hasEdge = (vertexIdA, vertexIdB) => vertexIdsToEdgeId[`${vertexIdA}_${vertexIdB}`] !== undefined;

  const getVertexList = () => vertices.map(vertex => vertex.id);

  const getEdgeList = () => edges.map(edge => [edge.sourceId, edge.targetId]);

  const getAdjacencyMatrix = () => {
    const length = vertices.length;
    const adjacencyMatrix = Array.from({ length }, () => Array(length).fill(0));

    edges.forEach(edge => {
      adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
      adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
    });

    return adjacencyMatrix;
  };

  const getComponentsAdjacencyMatrix = () => {
    const length = vertices.length;
    const adjacencyMatrix = Array.from({ length }, () => Array(length).fill(0));
    const bridges = getBridges();

    edges.forEach(edge => {
      adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
      adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
    });

    bridges.forEach(([src, tgt]) => {
      adjacencyMatrix[src][tgt] = 0;
      adjacencyMatrix[tgt][src] = 0;
    });

    return adjacencyMatrix;
  };

  const getSubgraphAdjacencyMatrix = (vertexIds) => {
    const length = vertexIds.length;
    const adjacencyMatrix = Array.from({ length }, () => Array(length).fill(0));

    vertexIds.forEach((vid, i) => {
      vertexIds.forEach((vj, j) => {
        if (i !== j && hasEdge(vid, vj)) {
          adjacencyMatrix[i][j] = 1;
        }
      });
    });

    return adjacencyMatrix;
  };

  const getDistanceMatrix = () => {
    const length = vertices.length;
    const adjacencyMatrix = getAdjacencyMatrix();
    const dist = Array.from({ length }, () => Array(length).fill(Infinity));

    adjacencyMatrix.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val === 1) dist[i][j] = 1;
      });
    });

    for (let k = 0; k < length; k++) {
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          if (dist[i][j] > dist[i][k] + dist[k][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }

    return dist;
  };

  const getSubgraphDistanceMatrix = (vertexIds) => {
    const length = vertexIds.length;
    const adjacencyMatrix = getSubgraphAdjacencyMatrix(vertexIds);
    const dist = Array.from({ length }, () => Array(length).fill(Infinity));

    adjacencyMatrix.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val === 1) dist[i][j] = 1;
      });
    });

    for (let k = 0; k < length; k++) {
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          if (dist[i][j] > dist[i][k] + dist[k][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }

    return dist;
  };

  const getAdjacencyList = () => {
    const length = vertices.length;
    return Array.from({ length }, (_, i) => vertices[i].neighbours.filter(v => hasEdge(vertices[i].id, v)));
  };

  const getSubgraphAdjacencyList = (vertexIds) => {
    const length = vertexIds.length;
    return Array.from({ length }, (_, i) => vertexIds.filter(v => hasEdge(vertexIds[i], v)));
  };

  const getBridges = () => {
    const length = vertices.length;
    const visited = new Array(length).fill(false);
    const disc = new Array(length);
    const low = new Array(length);
    const parent = new Array(length).fill(null);
    const adj = getAdjacencyList();
    const outBridges = [];

    const _bridgeDfs = (u, visited, disc, low, parent, adj, outBridges) => {
      visited[u] = true;
      disc[u] = low[u] = ++_time;

      adj[u].forEach((v) => {
        if (!visited[v]) {
          parent[v] = u;
          _bridgeDfs(v, visited, disc, low, parent, adj, outBridges);

          low[u] = Math.min(low[u], low[v]);

          if (low[v] > disc[u]) {
            outBridges.push([u, v]);
          }
        } else if (v !== parent[u]) {
          low[u] = Math.min(low[u], disc[v]);
        }
      });
    };

    vertices.forEach((_, i) => {
      if (!visited[i]) _bridgeDfs(i, visited, disc, low, parent, adj, outBridges);
    });

    return outBridges;
  };

  const getConnectedComponents = () => {
    const length = vertices.length;
    const visited = new Array(length).fill(false);
    const adj = getAdjacencyList();
    const components = [];

    const _componentDfs = (v, visited, adj, component) => {
      visited[v] = true;
      component.push(v);

      adj[v].forEach((u) => {
        if (!visited[u]) {
          _componentDfs(u, visited, adj, component);
        }
      });
    };

    vertices.forEach((_, i) => {
      if (!visited[i]) {
        const component = [];
        _componentDfs(i, visited, adj, component);
        components.push(component);
      }
    });

    return components;
  };

  const getAromaticRings = () => {
    const length = vertices.length;
    const visited = new Array(length).fill(false);
    const stack = [];
    const ringEdges = [];

    const _dfs = (v, visited, parent) => {
      visited[v] = true;
      stack.push(v);

      vertices[v].neighbours.forEach((neighbour) => {
        if (!visited[neighbour]) {
          _dfs(neighbour, visited, v);
        } else if (neighbour !== parent && stack.includes(neighbour)) {
          ringEdges.push(stack.slice(stack.indexOf(neighbour)));
        }
      });

      stack.pop();
    };

    vertices.forEach((_, i) => {
      if (!visited[i]) _dfs(i, visited, -1);
    });

    const aromaticRings = ringEdges.filter(ring => {
      return ring.every(v => vertices[v].value.isPartOfAromaticRing);
    });

    return aromaticRings;
  };

  const getAllRings = () => {
    const length = vertices.length;
    const visited = new Array(length).fill(false);
    const stack = [];
    const ringEdges = [];

    const _dfs = (v, visited, parent) => {
      visited[v] = true;
      stack.push(v);

      vertices[v].neighbours.forEach((neighbour) => {
        if (!visited[neighbour]) {
          _dfs(neighbour, visited, v);
        } else if (neighbour !== parent && stack.includes(neighbour)) {
          ringEdges.push(stack.slice(stack.indexOf(neighbour)));
        }
      });

      stack.pop();
    };

    vertices.forEach((_, i) => {
      if (!visited[i]) _dfs(i, visited, -1);
    });

    return ringEdges;
  };

  const getEdgeListCount = () => edges.length;

  const getVertexListCount = () => vertices.length;

  _init(parseTree);

  return {
    clear,
    addVertex,
    addEdge,
    getEdge,
    getEdges,
    hasEdge,
    getVertexList,
    getEdgeList,
    getAdjacencyMatrix,
    getComponentsAdjacencyMatrix,
    getSubgraphAdjacencyMatrix,
    getDistanceMatrix,
    getSubgraphDistanceMatrix,
    getAdjacencyList,
    getSubgraphAdjacencyList,
    getBridges,
    getConnectedComponents,
    getAromaticRings,
    getAllRings,
    getEdgeListCount,
    getVertexListCount
  };
};
