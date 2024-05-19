import React from 'react';
import { DrawerBase } from '../DrawerBase/DrawerBase';
import { SvgWrapper } from '../SvgWrapper/SvgWrapper';
import { ThemeManager } from '../ThemeManager/ThemeManager';
import { Vector2 } from '../Vector2/Vector2';

export const SvgDrawer = (options, clear = true) => {
    const preprocessor = new DrawerBase(options);
    const opts = preprocessor.opts;
    let svgWrapper = null;

    const draw = (data, target, themeName = 'light', weights = null, infoOnly = false, highlight_atoms = [], weightsNormalized = false) => {
        if (target === null || target === 'svg') {
            target = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            target.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            target.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            target.setAttributeNS(null, 'width', opts.width);
            target.setAttributeNS(null, 'height', opts.height);
        } else if (typeof target === 'string') {
            target = document.getElementById(target);
        }

        let optionBackup = {
            padding: opts.padding,
            compactDrawing: opts.compactDrawing
        };

        // Overwrite options when weights are added
        if (weights !== null) {
            opts.padding += opts.weights.additionalPadding;
            opts.compactDrawing = false;
        }

        // Инициализация рисовальщика
        preprocessor.initDraw(data, themeName, infoOnly, highlight_atoms);

        if (!infoOnly) {
            // Создание менеджера тем
            const themeManager = new ThemeManager(opts.themes, themeName);
            if (svgWrapper === null || clear) {
                svgWrapper = new SvgWrapper(themeManager, target, opts, clear);
            }
        }

        // Обработка графа
        preprocessor.processGraph();

        // Определение размеров холста
        svgWrapper.determineDimensions(preprocessor.graph.vertices);

        // Рисование выделений атомов
        drawAtomHighlights(preprocessor.opts.debug);
        // Рисование ребер
        drawEdges(preprocessor.opts.debug);
        // Рисование вершин
        drawVertices(preprocessor.opts.debug);

        if (weights !== null) {
            // Рисование весов
            drawWeights(weights, weightsNormalized);
        }

        // Построение SVG
        svgWrapper.constructSvg();

        // Сброс параметров, если добавлены веса
        if (weights !== null) {
            opts.padding = optionBackup.padding;
            opts.compactDrawing = optionBackup.padding;
        }

        return target;
    };

    const drawCanvas = (data, target, themeName = 'light', infoOnly = false) => {
        let canvas = null;
        if (typeof target === 'string' || target instanceof String) {
          canvas = document.getElementById(target);
        } else {
          canvas = target;
        }
    
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttributeNS(null, 'viewBox', '0 0 ' + 500 + ' ' + 500);
        svg.setAttributeNS(null, 'width', 500 + '');
        svg.setAttributeNS(null, 'height', 500 + '');
        svg.setAttributeNS(null, 'style', 'visibility: hidden: position: absolute; left: -1000px');
        document.body.appendChild(svg);
        this.draw(data, svg, themeName, infoOnly);
        this.svgWrapper.toCanvas(canvas, this.opts.width, this.opts.height);
        document.body.removeChild(svg);
        return target;
      }
    
      const drawAromaticityRing = (ring) => {
        let svgWrapper = this.svgWrapper;
        svgWrapper.drawRing(ring.center.x, ring.center.y, ring.getSize());
      }
    
      const drawEdges = (debug) => {
        let preprocessor = this.preprocessor,
          graph = preprocessor.graph,
          rings = preprocessor.rings,
          drawn = Array(preprocessor.graph.edges.length);
    
        drawn.fill(false);
    
        graph.traverseBF(0, vertex => {
          let edges = graph.getEdges(vertex.id);
          for (var i = 0; i < edges.length; i++) {
            let edgeId = edges[i];
            if (!drawn[edgeId]) {
              drawn[edgeId] = true;
              this.drawEdge(edgeId, debug);
            }
          }
        });
    
        if (!this.bridgedRing) {
          for (var i = 0; i < rings.length; i++) {
            let ring = rings[i];
            if (preprocessor.isRingAromatic(ring)) {
              this.drawAromaticityRing(ring);
            }
          }
        }
      }
    
      const drawEdge = (edgeId, debug) => {
        let preprocessor = this.preprocessor,
          opts = preprocessor.opts,
          svgWrapper = this.svgWrapper,
          edge = preprocessor.graph.edges[edgeId],
          vertexA = preprocessor.graph.vertices[edge.sourceId],
          vertexB = preprocessor.graph.vertices[edge.targetId],
          elementA = vertexA.value.element,
          elementB = vertexB.value.element;
    
        if ((!vertexA.value.isDrawn || !vertexB.value.isDrawn) && preprocessor.opts.atomVisualization === 'default') {
          return;
        }
    
        let a = vertexA.position,
          b = vertexB.position,
          normals = preprocessor.getEdgeNormals(edge),
          sides = ArrayHelper.clone(normals);
    
        sides[0].multiplyScalar(10).add(a);
        sides[1].multiplyScalar(10).add(a);
    
        if (edge.bondType === '=' || preprocessor.getRingbondType(vertexA, vertexB) === '=' ||
          (edge.isPartOfAromaticRing && preprocessor.bridgedRing)) {
          let inRing = preprocessor.areVerticesInSameRing(vertexA, vertexB);
          let s = preprocessor.chooseSide(vertexA, vertexB, sides);
    
          if (inRing) {
            let lcr = preprocessor.getLargestOrAromaticCommonRing(vertexA, vertexB);
            let center = lcr.center;
    
            normals[0].multiplyScalar(opts.bondSpacing);
            normals[1].multiplyScalar(opts.bondSpacing);
    
            let line = null;
    
            if (center.sameSideAs(vertexA.position, vertexB.position, Vector2.add(a, normals[0]))) {
              line = new Line(Vector2.add(a, normals[0]), Vector2.add(b, normals[0]), elementA, elementB);
            } else {
              line = new Line(Vector2.add(a, normals[1]), Vector2.add(b, normals[1]), elementA, elementB);
            }
    
            line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);
    
            if (edge.isPartOfAromaticRing) {
              svgWrapper.drawLine(line, true);
            } else {
              svgWrapper.drawLine(line);
            }
    
            svgWrapper.drawLine(new Line(a, b, elementA, elementB));
          } else if ((edge.center || vertexA.isTerminal() && vertexB.isTerminal()) ||
            (s.anCount == 0 && s.bnCount > 1 || s.bnCount == 0 && s.anCount > 1)) {
            this.multiplyNormals(normals, opts.halfBondSpacing);
    
            let lineA = new Line(Vector2.add(a, normals[0]), Vector2.add(b, normals[0]), elementA, elementB),
              lineB = new Line(Vector2.add(a, normals[1]), Vector2.add(b, normals[1]), elementA, elementB);
    
            svgWrapper.drawLine(lineA);
            svgWrapper.drawLine(lineB);
          } else if ((s.sideCount[0] > s.sideCount[1]) ||
            (s.totalSideCount[0] > s.totalSideCount[1])) {
            this.multiplyNormals(normals, opts.bondSpacing);
    
            let line = new Line(Vector2.add(a, normals[0]), Vector2.add(b, normals[0]), elementA, elementB);
    
            line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);
    
            svgWrapper.drawLine(line);
            svgWrapper.drawLine(new Line(a, b, elementA, elementB));
          } else if ((s.sideCount[0] < s.sideCount[1]) ||
            (s.totalSideCount[0] <= s.totalSideCount[1])) {
            this.multiplyNormals(normals, opts.bondSpacing);
    
            let line = new Line(Vector2.add(a, normals[1]), Vector2.add(b, normals[1]), elementA, elementB);
    
            line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);
            svgWrapper.drawLine(line);
            svgWrapper.drawLine(new Line(a, b, elementA, elementB));
          }
        } else if (edge.bondType === '#') {
          normals[0].multiplyScalar(opts.bondSpacing / 1.5);
          normals[1].multiplyScalar(opts.bondSpacing / 1.5);
    
          let lineA = new Line(Vector2.add(a, normals[0]), Vector2.add(b, normals[0]), elementA, elementB);
          let lineB = new Line(Vector2.add(a, normals[1]), Vector2.add(b, normals[1]), elementA, elementB);
    
          svgWrapper.drawLine(lineA);
          svgWrapper.drawLine(lineB);
          svgWrapper.drawLine(new Line(a, b, elementA, elementB));
        } else if (edge.bondType === '.') {
          // TODO: Something... maybe... version 2?
        } else {
          let isChiralCenterA = vertexA.value.isStereoCenter;
          let isChiralCenterB = vertexB.value.isStereoCenter;
    
          if (edge.wedge === 'up') {
            svgWrapper.drawWedge(new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB));
          } else if (edge.wedge === 'down') {
            svgWrapper.drawDashedWedge(new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB));
          } else {
            svgWrapper.drawLine(new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB));
          }
        }
    
        if (debug) {
          let midpoint = Vector2.midpoint(a, b);
          svgWrapper.drawDebugText(midpoint.x, midpoint.y, 'e: ' + edgeId);
        }
      }
    
      const drawAtomHighlights = (debug) => {
        let preprocessor = this.preprocessor;
        let opts = preprocessor.opts;
        let graph = preprocessor.graph;
        let rings = preprocessor.rings;
        let svgWrapper = this.svgWrapper;
    
        for (var i = 0; i < graph.vertices.length; i++) {
          let vertex = graph.vertices[i];
          let atom = vertex.value;
    
          for (var j = 0; j < preprocessor.highlight_atoms.length; j++) {
            let highlight = preprocessor.highlight_atoms[j]
            if (atom.class === highlight[0]) {
              svgWrapper.drawAtomHighlight(vertex.position.x, vertex.position.y, highlight[1]);
            }
          }
        }
      }
    
      const drawVertices = (debug) => {
        let preprocessor = this.preprocessor,
          opts = preprocessor.opts,
          graph = preprocessor.graph,
          rings = preprocessor.rings,
          svgWrapper = this.svgWrapper;
    
        for (var i = 0; i < graph.vertices.length; i++) {
          let vertex = graph.vertices[i];
          let atom = vertex.value;
          let charge = 0;
          let isotope = 0;
          let bondCount = vertex.value.bondCount;
          let element = atom.element;
          let hydrogens = Atom.maxBonds[element] - bondCount;
          let dir = vertex.getTextDirection(graph.vertices, atom.hasAttachedPseudoElements);
          let isTerminal = opts.terminalCarbons || element !== 'C' || atom.hasAttachedPseudoElements ? vertex.isTerminal() : false;
          let isCarbon = atom.element === 'C';
    
          if (graph.vertices.length < 3) {
            isCarbon = false;
          }
    
          if (atom.element === 'N' && atom.isPartOfAromaticRing) {
            hydrogens = 0;
          }
    
          if (atom.bracket) {
            hydrogens = atom.bracket.hcount;
            charge = atom.bracket.charge;
            isotope = atom.bracket.isotope;
          }
    
          if (opts.atomVisualization === 'allballs') {
            svgWrapper.drawBall(vertex.position.x, vertex.position.y, element);
          } else if ((atom.isDrawn && (!isCarbon || atom.drawExplicit || isTerminal || atom.hasAttachedPseudoElements)) || graph.vertices.length === 1) {
            if (opts.atomVisualization === 'default') {
              let attachedPseudoElements = atom.getAttachedPseudoElements();
              if (atom.hasAttachedPseudoElements && graph.vertices.length === Object.keys(attachedPseudoElements).length + 1) {
                dir = 'right';
              }
    
              svgWrapper.drawText(vertex.position.x, vertex.position.y,
                element, hydrogens, dir, isTerminal, charge, isotope, graph.vertices.length, attachedPseudoElements);
            } else if (opts.atomVisualization === 'balls') {
              svgWrapper.drawBall(vertex.position.x, vertex.position.y, element);
            }
          } else if (vertex.getNeighbourCount() === 2 && vertex.forcePositioned == true) {
            let a = graph.vertices[vertex.neighbours[0]].position;
            let b = graph.vertices[vertex.neighbours[1]].position;
            let angle = Vector2.threePointangle(vertex.position, a, b);
    
            if (Math.abs(Math.PI - angle) < 0.1) {
              svgWrapper.drawPoint(vertex.position.x, vertex.position.y, element);
            }
          }
    
          if (debug) {
            svgWrapper.drawDebugText(vertex.position.x, vertex.position.y, 'v: ' + i);
          }
        }
      }
    
      const drawWeights = (weights, normalized) => {
        let preprocessor = this.preprocessor,
          svgWrapper = this.svgWrapper,
          opts = preprocessor.opts,
          rings = preprocessor.rings,
          max = Math.max(...weights),
          min = Math.min(...weights),
          diff = max - min,
          colorFunc = gauss.getColorFunc(0, 1, 0.5, 1);
    
        for (var i = 0; i < preprocessor.graph.vertices.length; i++) {
          let vertex = preprocessor.graph.vertices[i];
          let weight = weights[i];
    
          if (!normalized) {
            weight = (weight - min) / diff;
          }
    
          if (weight > 1) {
            weight = 1;
          }
    
          if (weight < 0) {
            weight = 0;
          }
    
          let color = colorFunc(weight);
    
          if (preprocessor.graph.vertices.length > 1) {
            svgWrapper.drawBall(vertex.position.x, vertex.position.y, vertex.value.element, null, null, null, color);
          }
        }
      }
    
    const multiplyNormals = (normals, length) => {
        normals[0].multiplyScalar(length);
        normals[1].multiplyScalar(length);
      }

    return {
        draw,
        drawCanvas,
        drawAromaticityRing,
        drawEdges,
        drawEdge,
        drawAtomHighlights,
        drawVertices,
        drawWeights,
        multiplyNormals
    };
};