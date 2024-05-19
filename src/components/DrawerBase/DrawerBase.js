import { MathHelper } from '../MathHelper/MathHelper';
import { ArrayHelper } from '../ArrayHelper/ArrayHelper';
import { Vector2 } from '../Vector2/Vector2';
import { Line } from '../Line/Line';
import { Vertex } from '../Vertex/Vertex';
import { Edge } from '../Edge/Edge';
import { Atom } from '../Atom/Atom';
import { Ring } from '../Ring/Ring';
import { RingConnection } from '../RingConnection/RingConnection';
import { CanvasWrapper } from '../CanvasWrapper/CanvasWrapper';
import { Graph } from '../Graph/Graph';
import { SSSR } from '../SSSR/SSSR';
import { ThemeManager } from '../ThemeManager/ThemeManager';
import { Options } from '../Options/Options';

export const DrawerBase = (options) => {
  let graph = null;
  let doubleBondConfigCount = 0;
  let doubleBondConfig = null;
  let ringIdCounter = 0;
  let ringConnectionIdCounter = 0;
  let canvasWrapper = null;
  let totalOverlapScore = 0;

  const defaultOptions = {
    width: 500,
    height: 500,
    scale: 0.0,
    bondThickness: 1.0,
    bondLength: 30,
    shortBondLength: 0.8,
    bondSpacing: 0.17 * 30,
    atomVisualization: 'default',
    isomeric: true,
    debug: false,
    terminalCarbons: false,
    explicitHydrogens: true,
    overlapSensitivity: 0.42,
    overlapResolutionIterations: 1,
    compactDrawing: true,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSizeLarge: 11,
    fontSizeSmall: 3,
    padding: 10.0,
    experimentalSSSR: false,
    kkThreshold: 0.1,
    kkInnerThreshold: 0.1,
    kkMaxIteration: 20000,
    kkMaxInnerIteration: 50,
    kkMaxEnergy: 1e9,
    weights: {
      colormap: null,
      additionalPadding: 20.0,
      sigma: 10,
      interval: 0.0,
      opacity: 1.0,
    },
    themes: {
      dark: {
        C: '#fff',
        O: '#e74c3c',
        N: '#3498db',
        F: '#27ae60',
        CL: '#16a085',
        BR: '#d35400',
        I: '#8e44ad',
        P: '#d35400',
        S: '#f1c40f',
        B: '#e67e22',
        SI: '#e67e22',
        H: '#aaa',
        BACKGROUND: '#141414'
      },
      light: {
        C: '#222',
        O: '#e74c3c',
        N: '#3498db',
        F: '#27ae60',
        CL: '#16a085',
        BR: '#d35400',
        I: '#8e44ad',
        P: '#d35400',
        S: '#f1c40f',
        B: '#e67e22',
        SI: '#e67e22',
        H: '#666',
        BACKGROUND: '#fff'
      },
      oldschool: {
        C: '#000',
        O: '#000',
        N: '#000',
        F: '#000',
        CL: '#000',
        BR: '#000',
        I: '#000',
        P: '#000',
        S: '#000',
        B: '#000',
        SI: '#000',
        H: '#000',
        BACKGROUND: '#fff'
      },
      solarized: {
        C: "#586e75",
        O: "#dc322f",
        N: "#268bd2",
        F: "#859900",
        CL: "#16a085",
        BR: "#cb4b16",
        I: "#6c71c4",
        P: "#d33682",
        S: "#b58900",
        B: "#2aa198",
        SI: "#2aa198",
        H: "#657b83",
        BACKGROUND: "#fff"
      },
      'solarized-dark': {
        C: "#93a1a1",
        O: "#dc322f",
        N: "#268bd2",
        F: "#859900",
        CL: "#16a085",
        BR: "#cb4b16",
        I: "#6c71c4",
        P: "#d33682",
        S: "#b58900",
        B: "#2aa198",
        SI: "#2aa198",
        H: "#839496",
        BACKGROUND: "#fff"
      },
      matrix: {
        C: "#678c61",
        O: "#2fc079",
        N: "#4f7e7e",
        F: "#90d762",
        CL: "#82d967",
        BR: "#23755a",
        I: "#409931",
        P: "#c1ff8a",
        S: "#faff00",
        B: "#50b45a",
        SI: "#409931",
        H: "#426644",
        BACKGROUND: "#fff"
      },
      github: {
        C: "#24292f",
        O: "#cf222e",
        N: "#0969da",
        F: "#2da44e",
        CL: "#6fdd8b",
        BR: "#bc4c00",
        I: "#8250df",
        P: "#bf3989",
        S: "#d4a72c",
        B: "#fb8f44",
        SI: "#bc4c00",
        H: "#57606a",
        BACKGROUND: "#fff"
      },
      carbon: {
        C: "#161616",
        O: "#da1e28",
        N: "#0f62fe",
        F: "#198038",
        CL: "#007d79",
        BR: "#fa4d56",
        I: "#8a3ffc",
        P: "#ff832b",
        S: "#f1c21b",
        B: "#8a3800",
        SI: "#e67e22",
        H: "#525252",
        BACKGROUND: "#fff"
      },
      cyberpunk: {
        C: "#ea00d9",
        O: "#ff3131",
        N: "#0abdc6",
        F: "#00ff9f",
        CL: "#00fe00",
        BR: "#fe9f20",
        I: "#ff00ff",
        P: "#fe7f00",
        S: "#fcee0c",
        B: "#ff00ff",
        SI: "#ffffff",
        H: "#913cb1",
        BACKGROUND: "#fff"
      },
      gruvbox: {
        C: "#665c54",
        O: "#cc241d",
        N: "#458588",
        F: "#98971a",
        CL: "#79740e",
        BR: "#d65d0e",
        I: "#b16286",
        P: "#af3a03",
        S: "#d79921",
        B: "#689d6a",
        SI: "#427b58",
        H: "#7c6f64",
        BACKGROUND: "#fbf1c7"
      },
      'gruvbox-dark': {
        C: "#ebdbb2",
        O: "#cc241d",
        N: "#458588",
        F: "#98971a",
        CL: "#b8bb26",
        BR: "#d65d0e",
        I: "#b16286",
        P: "#fe8019",
        S: "#d79921",
        B: "#8ec07c",
        SI: "#83a598",
        H: "#bdae93",
        BACKGROUND: "#282828"
      },
      custom: {
        C: '#222',
        O: '#e74c3c',
        N: '#3498db',
        F: '#27ae60',
        CL: '#16a085',
        BR: '#d35400',
        I: '#8e44ad',
        P: '#d35400',
        S: '#f1c40f',
        B: '#e67e22',
        SI: '#e67e22',
        H: '#666',
        BACKGROUND: '#fff'
      },
    }
  };

  const opts = Options.extend(true, defaultOptions, options);
  opts.halfBondSpacing = opts.bondSpacing / 2.0;
  opts.bondLengthSq = opts.bondLength * opts.bondLength;
  opts.halfFontSizeLarge = opts.fontSizeLarge / 2.0;
  opts.quarterFontSizeLarge = opts.fontSizeLarge / 4.0;
  opts.fifthFontSizeSmall = opts.fontSizeSmall / 5.0;

  // Set the default theme.
  const theme = opts.themes.dark;

  const draw = (data, target, themeName = 'light', infoOnly = false) => {
    initDraw(data, themeName, infoOnly);

    if (!infoOnly) {
      const themeManager = new ThemeManager(opts.themes, themeName);
      canvasWrapper = new CanvasWrapper(target, themeManager, opts);

      processGraph();

      // Set the canvas to the appropriate size
      canvasWrapper.scale(graph.vertices);

      // Do the actual drawing
      drawEdges(opts.debug);
      drawVertices(opts.debug);
      canvasWrapper.reset();

      if (opts.debug) {
        console.log(graph);
        console.log(rings);
        console.log(ringConnections);
      }
    }
  };

  const edgeRingCount = (edgeId) => {
    const edge = graph.edges[edgeId];
    const a = graph.vertices[edge.sourceId];
    const b = graph.vertices[edge.targetId];

    return Math.min(a.value.rings.length, b.value.rings.length);
  };

  const getBridgedRings = () => {
    return rings.filter(ring => ring.isBridged);
  };

  const getFusedRings = () => {
    return rings.filter(ring => ring.isFused);
  };

  const getSpiros = () => {
    return rings.filter(ring => ring.isSpiro);
  };

  const printRingInfo = () => {
    return rings.map(ring => `${ring.id};${ring.members.length};${ring.neighbours.length};${ring.isSpiro};${ring.isFused};${ring.isBridged};${ring.rings.length};`).join('\n');
  };

  const rotateDrawing = () => {
    let a = 0;
    let b = 0;
    let maxDist = 0;
    for (let i = 0; i < graph.vertices.length; i++) {
      let vertexA = graph.vertices[i];
      if (!vertexA.value.isDrawn) continue;

      for (let j = i + 1; j < graph.vertices.length; j++) {
        let vertexB = graph.vertices[j];
        if (!vertexB.value.isDrawn) continue;

        let dist = vertexA.position.distanceSq(vertexB.position);
        if (dist > maxDist) {
          maxDist = dist;
          a = i;
          b = j;
        }
      }
    }

    let angle = -Vector2.subtract(graph.vertices[a].position, graph.vertices[b].position).angle();
    if (!isNaN(angle)) {
      let remainder = angle % 0.523599;
      angle = remainder < 0.2617995 ? angle - remainder : angle + 0.523599 - remainder;

      for (let i = 0; i < graph.vertices.length; i++) {
        if (i === b) continue;
        graph.vertices[i].position.rotateAround(angle, graph.vertices[b].position);
      }

      for (let i = 0; i < rings.length; i++) {
        rings[i].center.rotateAround(angle, graph.vertices[b].position);
      }
    }
  };

  const getTotalOverlapScore = () => totalOverlapScore;

  const getRingCount = () => rings.length;

  const hasBridgedRing = () => bridgedRing;

  const getHeavyAtomCount = () => graph.vertices.filter(vertex => vertex.value.element !== 'H').length;

  const getMolecularFormula = (data = null) => {
    let molecularFormula = '';
    let counts = new Map();
    let graph = data === null ? this.graph : new Graph(data, opts.isomeric);

    graph.vertices.forEach(vertex => {
      let atom = vertex.value;
      counts.set(atom.element, (counts.get(atom.element) || 0) + 1);
      if (atom.bracket && !atom.bracket.chirality) {
        counts.set('H', (counts.get('H') || 0) + atom.bracket.hcount);
      }
      if (!atom.bracket) {
        let nHydrogens = Atom.maxBonds[atom.element] - atom.bondCount;
        if (atom.isPartOfAromaticRing) nHydrogens--;
        counts.set('H', (counts.get('H') || 0) + nHydrogens);
      }
    });

    if (counts.has('C')) {
      let count = counts.get('C');
      molecularFormula += 'C' + (count > 1 ? count : '');
      counts.delete('C');
    }
    if (counts.has('H')) {
      let count = counts.get('H');
      molecularFormula += 'H' + (count > 1 ? count : '');
      counts.delete('H');
    }

    let elements = Object.keys(Atom.atomicNumbers).sort();
    elements.forEach(e => {
      if (counts.has(e)) {
        let count = counts.get(e);
        molecularFormula += e + (count > 1 ? count : '');
      }
    });

    return molecularFormula;
  };

  const getRingbondType = (vertexA, vertexB) => {
    if (vertexA.value.getRingbondCount() < 1 || vertexB.value.getRingbondCount() < 1) return null;
    for (let i = 0; i < vertexA.value.ringbonds.length; i++) {
      for (let j = 0; j < vertexB.value.ringbonds.length; j++) {
        if (vertexA.value.ringbonds[i].id === vertexB.value.ringbonds[j].id) {
          return vertexA.value.ringbonds[i].bondType === '-' ? vertexB.value.ringbonds[j].bond : vertexA.value.ringbonds[i].bond;
        }
      }
    }
    return null;
  };

  const initDraw = (data, themeName, infoOnly) => {
    this.data = data;
    this.infoOnly = infoOnly;

    ringIdCounter = 0;
    ringConnectionIdCounter = 0;

    graph = new Graph(data, opts.isomeric);
    rings = [];
    ringConnections = [];

    originalRings = [];
    originalRingConnections = [];

    bridgedRing = false;

    doubleBondConfigCount = null;
    doubleBondConfig = null;

    highlight_atoms = highlight_atoms;

    initRings();
    initHydrogens();
  };

  const processGraph = () => {
    position();
    restoreRingInformation();
    resolvePrimaryOverlaps();

    let overlapScore = getOverlapScore();
    totalOverlapScore = getOverlapScore().total;

    for (let o = 0; o < opts.overlapResolutionIterations; o++) {
      for (let i = 0; i < graph.edges.length; i++) {
        let edge = graph.edges[i];
        if (isEdgeRotatable(edge)) {
          let subTreeDepthA = graph.getTreeDepth(edge.sourceId, edge.targetId);
          let subTreeDepthB = graph.getTreeDepth(edge.targetId, edge.sourceId);

          let a = edge.targetId;
          let b = edge.sourceId;

          if (subTreeDepthA > subTreeDepthB) {
            a = edge.sourceId;
            b = edge.targetId;
          }

          let subTreeOverlap = getSubtreeOverlapScore(b, a, overlapScore.vertexScores);
          if (subTreeOverlap.value > opts.overlapSensitivity) {
            let vertexA = graph.vertices[a];
            let vertexB = graph.vertices[b];
            let neighboursB = vertexB.getNeighbours(a);

            if (neighboursB.length === 1) {
              let neighbour = graph.vertices[neighboursB[0]];
              let angle = neighbour.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));

              rotateSubtree(neighbour.id, vertexB.id, angle, vertexB.position);
              let newTotalOverlapScore = getOverlapScore().total;

              if (newTotalOverlapScore > totalOverlapScore) {
                rotateSubtree(neighbour.id, vertexB.id, -angle, vertexB.position);
              } else {
                totalOverlapScore = newTotalOverlapScore;
              }
            } else if (neighboursB.length === 2) {
              if (vertexB.value.rings.length !== 0 && vertexA.value.rings.length !== 0) continue;

              let neighbourA = graph.vertices[neighboursB[0]];
              let neighbourB = graph.vertices[neighboursB[1]];

              if (neighbourA.value.rings.length === 1 && neighbourB.value.rings.length === 1) {
                if (neighbourA.value.rings[0] !== neighbourB.value.rings[0]) continue;
              } else if (neighbourA.value.rings.length !== 0 || neighbourB.value.rings.length !== 0) continue;

              let angleA = neighbourA.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));
              let angleB = neighbourB.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));

              rotateSubtree(neighbourA.id, vertexB.id, angleA, vertexB.position);
              rotateSubtree(neighbourB.id, vertexB.id, angleB, vertexB.position);

              let newTotalOverlapScore = getOverlapScore().total;

              if (newTotalOverlapScore > totalOverlapScore) {
                rotateSubtree(neighbourA.id, vertexB.id, -angleA, vertexB.position);
                rotateSubtree(neighbourB.id, vertexB.id, -angleB, vertexB.position);
              } else {
                totalOverlapScore = newTotalOverlapScore;
              }
            }

            overlapScore = getOverlapScore();
          }
        }
      }
    }

    resolveSecondaryOverlaps(overlapScore.scores);

    if (opts.isomeric) annotateStereochemistry();

    if (opts.compactDrawing && opts.atomVisualization === 'default') initPseudoElements();

    rotateDrawing();
  };

  const initRings = () => {
    let openBonds = new Map();
    graph.vertices.forEach(vertex => {
      if (vertex.value.ringbonds.length === 0) return;

      vertex.value.ringbonds.forEach(ringbond => {
        if (!openBonds.has(ringbond.id)) {
          openBonds.set(ringbond.id, []);
        }
        openBonds.get(ringbond.id).push(vertex.id);
      });
    });

    openBonds.forEach((open, ringbondId) => {
      if (open.length !== 2) return;

      let sourceVertex = graph.vertices[open[0]];
      let targetVertex = graph.vertices[open[1]];

      if (!graph.hasEdge(open[0], open[1])) {
        graph.addEdge(new Edge(open[0], open[1], 1, 0));
      }

      let edge = graph.getEdge(open[0], open[1]);
      edge.setBondType(ringbondId === '-' ? '=' : ringbondId);
      edge.setBondType('ring');
    });

    graph.vertices.forEach(vertex => {
      vertex.value.ringbonds = [];
    });

    let sssr = new SSSR(graph, opts.experimentalSSSR);
    let rings = sssr.getRings();

    rings.forEach(ring => {
      let ringVertices = [];
      ring.forEach(ringVertexId => {
        ringVertices.push(graph.vertices[ringVertexId]);
      });

      let newRing = new Ring(ringIdCounter++, ringVertices);
      newRing.isBridged = sssr.isBridged(newRing.members);
      newRing.isFused = sssr.isFused(newRing.members);
      newRing.isSpiro = sssr.isSpiro(newRing.members);

      ringVertices.forEach(vertex => {
        vertex.value.addRing(newRing);
      });

      rings.push(newRing);
    });

    let originalRings = rings.slice();

    for (let i = 0; i < rings.length; i++) {
      let ring = rings[i];
      for (let j = i + 1; j < rings.length; j++) {
        let ring2 = rings[j];
        let neighbours = ring.getNeighbouringRing(ring2);
        if (neighbours.length > 0) {
          let ringConnection = new RingConnection(ringConnectionIdCounter++, ring, ring2, neighbours);
          ring.addNeighbouringRing(ringConnection);
          ring2.addNeighbouringRing(ringConnection);
          ringConnections.push(ringConnection);
        }
      }
    }

    originalRingConnections = ringConnections.slice();
  };

  const initHydrogens = () => {
    if (!opts.explicitHydrogens) return;

    graph.vertices.forEach(vertex => {
      let atom = vertex.value;
      if (atom.isPartOfAromaticRing || atom.element === 'H') return;

      let nHydrogens = Atom.maxBonds[atom.element] - atom.bondCount;
      if (nHydrogens === 0) return;

      for (let i = 0; i < nHydrogens; i++) {
        let hydrogenVertex = new Vertex(graph.vertices.length, new Atom('H', '', vertex.id));
        graph.addVertex(hydrogenVertex);

        let hydrogenEdge = new Edge(vertex.id, hydrogenVertex.id, 1);
        graph.addEdge(hydrogenEdge);

        hydrogenVertex.value.isDrawn = false;
      }
    });
  };

  const getOverlapScore = () => {
    let total = 0.0;
    let vertexScores = new Float32Array(graph.vertices.length);
    let scores = [];
    for (let i = 0; i < graph.vertices.length; i++) {
      let a = graph.vertices[i];
      for (let j = i + 1; j < graph.vertices.length; j++) {
        let b = graph.vertices[j];
        if (!a.value.isDrawn || !b.value.isDrawn) continue;
        let dist = a.position.distanceSq(b.position);
        if (dist < opts.bondLengthSq) {
          let weighting = 1.0;
          let isVertexAInRing = a.value.rings.length > 0;
          let isVertexBInRing = b.value.rings.length > 0;
          if (isVertexAInRing && isVertexBInRing) {
            weighting = 0.1;
          } else if (isVertexAInRing || isVertexBInRing) {
            weighting = 0.2;
          }

          let score = Math.pow((opts.bondLength - Math.sqrt(dist)) * weighting, 2);
          vertexScores[i] += score;
          vertexScores[j] += score;
          total += score;
          scores.push({ a: a.id, b: b.id, dist, score });
        }
      }
    }
    return { total, vertexScores, scores };
  };

  const getSubtreeOverlapScore = (vertexIdA, vertexIdB, vertexScores) => {
    let scores = [];
    let vertices = graph.getTree(vertexIdA, vertexIdB);
    let total = 0.0;
    vertices.forEach(vertexId => {
      scores.push({ id: vertexId, score: vertexScores[vertexId] });
      total += vertexScores[vertexId];
    });
    return { value: total / vertices.length, scores };
  };

  const resolvePrimaryOverlaps = () => {
    let overlapScore = getOverlapScore();
    totalOverlapScore = overlapScore.total;
    let scoreThreshold = 0.1;

    for (let o = 0; o < opts.overlapResolutionIterations; o++) {
      for (let i = 0; i < graph.edges.length; i++) {
        let edge = graph.edges[i];
        if (isEdgeRotatable(edge)) {
          let subTreeDepthA = graph.getTreeDepth(edge.sourceId, edge.targetId);
          let subTreeDepthB = graph.getTreeDepth(edge.targetId, edge.sourceId);

          let a = edge.targetId;
          let b = edge.sourceId;

          if (subTreeDepthA > subTreeDepthB) {
            a = edge.sourceId;
            b = edge.targetId;
          }

          let subTreeOverlap = getSubtreeOverlapScore(b, a, overlapScore.vertexScores);
          if (subTreeOverlap.value > scoreThreshold) {
            let vertexA = graph.vertices[a];
            let vertexB = graph.vertices[b];
            let neighboursB = vertexB.getNeighbours(a);

            if (neighboursB.length === 1) {
              let neighbour = graph.vertices[neighboursB[0]];
              let angle = neighbour.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));

              rotateSubtree(neighbour.id, vertexB.id, angle, vertexB.position);
              let newTotalOverlapScore = getOverlapScore().total;

              if (newTotalOverlapScore > totalOverlapScore) {
                rotateSubtree(neighbour.id, vertexB.id, -angle, vertexB.position);
              } else {
                totalOverlapScore = newTotalOverlapScore;
              }
            } else if (neighboursB.length === 2) {
              if (vertexB.value.rings.length !== 0 && vertexA.value.rings.length !== 0) continue;

              let neighbourA = graph.vertices[neighboursB[0]];
              let neighbourB = graph.vertices[neighboursB[1]];

              if (neighbourA.value.rings.length === 1 && neighbourB.value.rings.length === 1) {
                if (neighbourA.value.rings[0] !== neighbourB.value.rings[0]) continue;
              } else if (neighbourA.value.rings.length !== 0 || neighbourB.value.rings.length !== 0) continue;

              let angleA = neighbourA.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));
              let angleB = neighbourB.position.getRotateAwayFromAngle(vertexA.position, vertexB.position, MathHelper.toRad(120));

              rotateSubtree(neighbourA.id, vertexB.id, angleA, vertexB.position);
              rotateSubtree(neighbourB.id, vertexB.id, angleB, vertexB.position);

              let newTotalOverlapScore = getOverlapScore().total;

              if (newTotalOverlapScore > totalOverlapScore) {
                rotateSubtree(neighbourA.id, vertexB.id, -angleA, vertexB.position);
                rotateSubtree(neighbourB.id, vertexB.id, -angleB, vertexB.position);
              } else {
                totalOverlapScore = newTotalOverlapScore;
              }
            }

            overlapScore = getOverlapScore();
          }
        }
      }
    }
  };

  const resolveSecondaryOverlaps = (scores) => {
    for (let i = 0; i < scores.length; i++) {
      let score = scores[i];
      let vertexA = graph.vertices[score.a];
      let vertexB = graph.vertices[score.b];
      let dist = vertexA.position.distanceSq(vertexB.position);
      if (dist > opts.bondLengthSq) continue;

      let midPoint = Vector2.midPoint(vertexA.position, vertexB.position);
      let angle = vertexA.position.angle(vertexB.position);
      let distance = (opts.bondLength - Math.sqrt(dist)) / 2.0;

      let displacement = new Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance);
      vertexA.position.add(displacement);
      vertexB.position.subtract(displacement);
    }
  };

  const rotateSubtree = (vertexId, neighbourId, angle, origin) => {
    let vertices = graph.getTree(vertexId, neighbourId);
    vertices.forEach(vertexId => {
      let vertex = graph.vertices[vertexId];
      vertex.position.rotateAround(angle, origin);
    });
  };

  const drawEdges = (debug) => {
    graph.edges.forEach(edge => {
      let vertexA = graph.vertices[edge.sourceId];
      let vertexB = graph.vertices[edge.targetId];

      if (!vertexA.value.isDrawn || !vertexB.value.isDrawn) return;

      let isVertexAInRing = vertexA.value.rings.length > 0;
      let isVertexBInRing = vertexB.value.rings.length > 0;

      let ringBondType = getRingbondType(vertexA, vertexB);
      if (ringBondType !== null) {
        edge.setBondType(ringBondType);
      }

      let a = vertexA.position;
      let b = vertexB.position;

      let normals = null;

      if (edge.bondType === '-') {
        normals = getNormals(a, b, opts.bondSpacing);
        drawLine(normals[0], normals[1], theme.C, opts.bondThickness);
        drawLine(normals[2], normals[3], theme.C, opts.bondThickness);
      } else if (edge.bondType === '=') {
        normals = getNormals(a, b, opts.halfBondSpacing);
        drawLine(normals[0], normals[1], theme.C, opts.bondThickness);
        drawLine(normals[2], normals[3], theme.C, opts.bondThickness);
      } else {
        drawLine(a, b, theme.C, opts.bondThickness);
      }
    });
  };

  const drawVertices = (debug) => {
    graph.vertices.forEach(vertex => {
      if (!vertex.value.isDrawn) return;

      let a = vertex.position;
      let b = vertex.value.getNeighbourPosition();
      let isTerminal = vertex.value.neighbours.length === 1;

      drawText(a, vertex.value.element, theme[vertex.value.element], opts.fontSizeLarge, opts.fontFamily, opts.halfFontSizeLarge, opts.quarterFontSizeLarge);

      if (isTerminal && opts.terminalCarbons) {
        let text = vertex.value.isPartOfAromaticRing ? '•' : '';
        drawText(b, text, theme[vertex.value.element], opts.fontSizeSmall, opts.fontFamily, opts.halfFontSizeLarge, opts.quarterFontSizeLarge);
      }

      if (vertex.value.bracket && !vertex.value.bracket.chirality) {
        let hydrogens = vertex.value.bracket.hcount;
        if (hydrogens > 0) {
          let text = hydrogens === 1 ? 'H' : `H${hydrogens}`;
          drawText(b, text, theme.H, opts.fontSizeSmall, opts.fontFamily, opts.halfFontSizeLarge, opts.quarterFontSizeLarge);
        }
      }

      if (!vertex.value.bracket && !vertex.value.isPartOfAromaticRing) {
        let hydrogens = Atom.maxBonds[vertex.value.element] - vertex.value.bondCount;
        if (hydrogens > 0) {
          let text = hydrogens === 1 ? 'H' : `H${hydrogens}`;
          drawText(b, text, theme.H, opts.fontSizeSmall, opts.fontFamily, opts.halfFontSizeLarge, opts.quarterFontSizeLarge);
        }
      }

      if (vertex.value.rings.length === 1) {
        drawText(a, '•', theme.C, opts.fontSizeLarge, opts.fontFamily, opts.halfFontSizeLarge, opts.quarterFontSizeLarge);
      }
    });
  };

  const isEdgeRotatable = (edge) => {
    if (edge.bondType !== '-') return false;
    if (graph.vertices[edge.sourceId].value.rings.length > 0 || graph.vertices[edge.targetId].value.rings.length > 0) return false;
    return true;
  };

  const annotateStereochemistry = () => {
    graph.vertices.forEach(vertex => {
      if (vertex.value.rings.length > 0) return;

      if (vertex.value.bracket && vertex.value.bracket.chirality) {
        let neighbours = vertex.getNeighbours();
        let nNeighbours = neighbours.length;
        if (nNeighbours === 3) {
          let neighbouringVectors = [];
          neighbours.forEach(neighbour => {
            neighbouringVectors.push(Vector2.subtract(graph.vertices[neighbour].position, vertex.position));
          });

          let angles = [];
          for (let i = 0; i < nNeighbours; i++) {
            let angle = neighbouringVectors[i].angle(neighbouringVectors[(i + 1) % nNeighbours]);
            angles.push(angle);
          }

          let chirality = vertex.value.bracket.chirality;
          let minAngle = Math.min(...angles);
          let maxAngle = Math.max(...angles);

          let wedgePos = angles.indexOf(minAngle);
          let hashPos = angles.indexOf(maxAngle);

          let wedge = neighbouringVectors[wedgePos];
          let hash = neighbouringVectors[hashPos];

          drawWedgeHashLine(vertex.position, wedge, hash, chirality);
        }
      }
    });
  };

  const initPseudoElements = () => {
    graph.vertices.forEach(vertex => {
      if (vertex.value.rings.length === 1 && vertex.value.element === 'C') {
        let neighbours = vertex.getNeighbours();
        let nNeighbours = neighbours.length;

        if (nNeighbours === 2) {
          let neighbour1 = graph.vertices[neighbours[0]];
          let neighbour2 = graph.vertices[neighbours[1]];

          if (neighbour1.value.element === 'C' && neighbour2.value.element === 'C') {
            vertex.value.element = '∴';
          }
        }
      }
    });
  };

  const drawLine = (start, end, color, thickness) => {
    canvasWrapper.drawLine(start.x, start.y, end.x, end.y, color, thickness);
  };

  const drawText = (position, text, color, fontSize, fontFamily, fontSizeLarge, fontSizeSmall) => {
    canvasWrapper.drawText(position.x, position.y, text, color, fontSize, fontFamily, fontSizeLarge, fontSizeSmall);
  };

  const drawWedgeHashLine = (start, wedge, hash, chirality) => {
    let wedgeMidpoint = Vector2.midPoint(start, wedge);
    let wedgeDisplacement = Vector2.subtract(wedge, wedgeMidpoint).normalize();
    let wedgeVertices = [
      start,
      Vector2.add(wedgeMidpoint, wedgeDisplacement),
      Vector2.subtract(wedgeMidpoint, wedgeDisplacement),
    ];

    let hashMidpoint = Vector2.midPoint(start, hash);
    let hashDisplacement = Vector2.subtract(hash, hashMidpoint).normalize();
    let hashVertices = [
      start,
      Vector2.add(hashMidpoint, hashDisplacement),
      Vector2.subtract(hashMidpoint, hashDisplacement),
    ];

    canvasWrapper.drawPolygon(wedgeVertices, theme.C, opts.bondThickness);
    canvasWrapper.drawPolygon(hashVertices, theme.C, opts.bondThickness);
  };

  const getNormals = (a, b, spacing) => {
    let normals = Vector2.normals(a, b);
    normals[0].multiplyScalar(spacing);
    normals[1].multiplyScalar(spacing);
    normals[2].multiplyScalar(spacing);
    normals[3].multiplyScalar(spacing);

    return [
      Vector2.add(a, normals[0]),
      Vector2.add(b, normals[1]),
      Vector2.add(a, normals[2]),
      Vector2.add(b, normals[3]),
    ];
  };

  return {
    draw,
    getBridgedRings,
    getFusedRings,
    getSpiros,
    printRingInfo,
    rotateDrawing,
    getTotalOverlapScore,
    getRingCount,
    hasBridgedRing,
    getHeavyAtomCount,
    getMolecularFormula,
    getRingbondType,
    initDraw,
    processGraph,
    initRings,
    initHydrogens,
    getOverlapScore,
    getSubtreeOverlapScore,
    resolvePrimaryOverlaps,
    resolveSecondaryOverlaps,
    rotateSubtree,
    drawEdges,
    drawVertices,
    isEdgeRotatable,
    annotateStereochemistry,
    initPseudoElements,
    drawLine,
    drawText,
    drawWedgeHashLine,
    getNormals
  };
};
