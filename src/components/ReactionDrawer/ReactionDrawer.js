import React, { useEffect, useRef } from 'react';
import {SvgDrawer} from './SvgDrawer';
import {SvgWrapper} from './SvgWrapper';
import {ThemeManager} from './ThemeManager';
import {formulaToCommonName} from './FormulaToCommonName/FormulaToCommonName';

const ReactionDrawer = ({ options, moleculeOptions }) => {
    const svgRef = useRef(null);
    const drawer = useRef(null);
    const themeManager = useRef(null);
    const defaultOptions = useRef({
        scale: moleculeOptions.scale > 0.0 ? moleculeOptions.scale : 1.0,
        fontSize: moleculeOptions.fontSizeLarge * 0.8,
        fontFamily: 'Arial, Helvetica, sans-serif',
        spacing: 10,
        plus: {
            size: 9,
            thickness: 1.0
        },
        arrow: {
            length: moleculeOptions.bondLength * 4.0,
            headSize: 6.0,
            thickness: 1.0,
            margin: 3
        },
        weights: {
            normalize: false
        }
    });

    useEffect(() => {
        drawer.current = new SvgDrawer(moleculeOptions);
        themeManager.current = new ThemeManager(drawer.current.opts.themes, 'light');
    }, []);

    const draw = (reaction, target, themeName = 'light', weights = null, textAbove = '{reagents}', textBelow = '', infoOnly = false) => {
        themeManager.current = new ThemeManager(drawer.current.opts.themes, themeName);
    
        // Normalize weights
        if (options.weights.normalize && weights) {
            const normalizeWeights = (weightMatrix) => {
                let max = -Number.MAX_SAFE_INTEGER;
                let min = Number.MAX_SAFE_INTEGER;
    
                weightMatrix.forEach(row => {
                    row.forEach(value => {
                        if (value < min) min = value;
                        if (value > max) max = value;
                    });
                });
    
                const absMax = Math.max(Math.abs(min), Math.abs(max)) || 1;
    
                return weightMatrix.map(row => row.map(value => value / absMax));
            };
    
            ['reactants', 'reagents', 'products'].forEach(key => {
                if (weights.hasOwnProperty(key)) {
                    weights[key] = normalizeWeights(weights[key]);
                }
            });
        }
    
        const svg = (target === null || target === 'svg') ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : (typeof target === 'string' || target instanceof String) ? document.getElementById(target) : target;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    
        const elements = [];
        let maxHeight = 0.0;
    
        // Reactants
        reaction.reactants.forEach((reactant, i) => {
            if (i > 0) {
                elements.push({
                    width: defaultOptions.current.plus.size * defaultOptions.current.scale,
                    height: defaultOptions.current.plus.size * defaultOptions.current.scale,
                    svg: getPlus()
                });
            }
    
            const reactantWeights = weights && weights.reactants && weights.reactants[i];
            const reactantSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            drawer.current.draw(reactant, reactantSvg, themeName, reactantWeights, infoOnly, [], options.weights.normalize);
            const element = {
                width: reactantSvg.viewBox.baseVal.width * defaultOptions.current.scale,
                height: reactantSvg.viewBox.baseVal.height * defaultOptions.current.scale,
                svg: reactantSvg
            };
    
            elements.push(element);
            if (element.height > maxHeight) maxHeight = element.height;
        });
    
        // Arrow
        elements.push({
            width: defaultOptions.current.arrow.length * defaultOptions.current.scale,
            height: defaultOptions.current.arrow.headSize * 2.0 * defaultOptions.current.scale,
            svg: getArrow()
        });
    
        // Text above arrow / reagents
        let reagentsText = "";
        reaction.reagents.forEach((reagent, i) => {
            if (i > 0) reagentsText += ", ";
            let text = drawer.current.getMolecularFormula(reagent);
            if (text in formulaToCommonName) text = formulaToCommonName[text];
            reagentsText += SvgWrapper.replaceNumbersWithSubscript(text);
        });
    
        textAbove = textAbove.replace('{reagents}', reagentsText);
    
        const topText = SvgWrapper.writeText(
            textAbove,
            themeManager.current,
            defaultOptions.current.fontSize * defaultOptions.current.scale,
            defaultOptions.current.fontFamily,
            defaultOptions.current.arrow.length * defaultOptions.current.scale
        );
    
        let centerOffsetX = (defaultOptions.current.arrow.length * defaultOptions.current.scale - topText.width) / 2.0;
        elements.push({
            svg: topText.svg,
            height: topText.height,
            width: defaultOptions.current.arrow.length * defaultOptions.current.scale,
            offsetX: -(defaultOptions.current.arrow.length * defaultOptions.current.scale + defaultOptions.current.spacing) + centerOffsetX,
            offsetY: -(topText.height / 2.0) - defaultOptions.current.arrow.margin,
            position: 'relative'
        });
    
        // Text below arrow
        const bottomText = SvgWrapper.writeText(
            textBelow,
            themeManager.current,
            defaultOptions.current.fontSize * defaultOptions.current.scale,
            defaultOptions.current.fontFamily,
            defaultOptions.current.arrow.length * defaultOptions.current.scale
        );
    
        centerOffsetX = (defaultOptions.current.arrow.length * defaultOptions.current.scale - bottomText.width) / 2.0;
        elements.push({
            svg: bottomText.svg,
            height: bottomText.height,
            width: defaultOptions.current.arrow.length * defaultOptions.current.scale,
            offsetX: -(defaultOptions.current.arrow.length * defaultOptions.current.scale + defaultOptions.current.spacing) + centerOffsetX,
            offsetY: bottomText.height / 2.0 + defaultOptions.current.arrow.margin,
            position: 'relative'
        });
    
        // Products
        reaction.products.forEach((product, i) => {
            if (i > 0) {
                elements.push({
                    width: defaultOptions.current.plus.size * defaultOptions.current.scale,
                    height: defaultOptions.current.plus.size * defaultOptions.current.scale,
                    svg: getPlus()
                });
            }
    
            const productWeights = weights && weights.products && weights.products[i];
            const productSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            drawer.current.draw(product, productSvg, themeName, productWeights, infoOnly, [], options.weights.normalize);
            const element = {
                width: productSvg.viewBox.baseVal.width * defaultOptions.current.scale,
                height: productSvg.viewBox.baseVal.height * defaultOptions.current.scale,
                svg: productSvg
            };
    
            elements.push(element);
            if (element.height > maxHeight) maxHeight = element.height;
        });
    
        let totalWidth = 0.0;
    
        elements.forEach(element => {
            let offsetX = element.offsetX ?? 0.0;
            let offsetY = element.offsetY ?? 0.0;
    
            element.svg.setAttributeNS(null, 'x', Math.round(totalWidth + offsetX));
            element.svg.setAttributeNS(null, 'y', Math.round(((maxHeight - element.height) / 2.0) + offsetY));
            element.svg.setAttributeNS(null, 'width', Math.round(element.width));
            element.svg.setAttributeNS(null, 'height', Math.round(element.height));
            svg.appendChild(element.svg);
    
            if (element.position !== 'relative') {
                totalWidth += Math.round(element.width + defaultOptions.current.spacing + offsetX);
            }
        });
    
        svg.setAttributeNS(null, 'viewBox', `0 0 ${totalWidth} ${maxHeight}`);
        svg.style.width = totalWidth + 'px';
        svg.style.height = maxHeight + 'px';
    
        return svg;
    };
    
    const getPlus = () => {
        const s = defaultOptions.current.plus.size;
        const w = defaultOptions.current.plus.thickness;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const rect_h = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const rect_v = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    
        svg.setAttributeNS(null, 'id', 'plus');
    
        rect_h.setAttributeNS(null, 'x', 0);
        rect_h.setAttributeNS(null, 'y', s / 2.0 - w / 2.0);
        rect_h.setAttributeNS(null, 'width', s);
        rect_h.setAttributeNS(null, 'height', w);
        rect_h.setAttributeNS(null, 'fill', themeManager.current.getColor("C"));
    
        rect_v.setAttributeNS(null, 'x', s / 2.0 - w / 2.0);
        rect_v.setAttributeNS(null, 'y', 0);
        rect_v.setAttributeNS(null, 'width', w);
        rect_v.setAttributeNS(null, 'height', s);
        rect_v.setAttributeNS(null, 'fill', themeManager.current.getColor("C"));
    
        svg.appendChild(rect_h);
        svg.appendChild(rect_v);
        svg.setAttributeNS(null, 'viewBox', `0 0 ${s} ${s}`);
    
        return svg;
    };
    
    const getArrowhead = () => {
        const s = defaultOptions.current.arrow.headSize;
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    
        marker.setAttributeNS(null, 'id', 'arrowhead');
        marker.setAttributeNS(null, 'viewBox', `0 0 ${s} ${s}`);
        marker.setAttributeNS(null, 'markerUnits', 'userSpaceOnUse');
        marker.setAttributeNS(null, 'markerWidth', s);
        marker.setAttributeNS(null, 'markerHeight', s);
        marker.setAttributeNS(null, 'refX', 0);
        marker.setAttributeNS(null, 'refY', s / 2);
        marker.setAttributeNS(null, 'orient', 'auto');
        marker.setAttributeNS(null, 'fill', themeManager.current.getColor("C"));
    
        polygon.setAttributeNS(null, 'points', `0 0, ${s} ${s / 2}, 0 ${s}`)
    
        marker.appendChild(polygon);
    
        return marker;
    };
    
    const getCDArrowhead = () => {
        const s = defaultOptions.current.arrow.headSize;
        const sw = s * (7 / 4.5);
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
        marker.setAttributeNS(null, 'id', 'arrowhead');
        marker.setAttributeNS(null, 'viewBox', `0 0 ${sw} ${s}`);
        marker.setAttributeNS(null, 'markerUnits', 'userSpaceOnUse');
        marker.setAttributeNS(null, 'markerWidth', sw * 2);
        marker.setAttributeNS(null, 'markerHeight', s * 2);
        marker.setAttributeNS(null, 'refX', 2.2);
        marker.setAttributeNS(null, 'refY', 2.2);
        marker.setAttributeNS(null, 'orient', 'auto');
        marker.setAttributeNS(null, 'fill', themeManager.current.getColor("C"));
    
        path.setAttributeNS(null, 'style', 'fill-rule:nonzero;');
        path.setAttributeNS(null, 'd', 'm 0 0 l 7 2.25 l -7 2.25 c 0 0 0.735 -1.084 0.735 -2.28 c 0 -1.196 -0.735 -2.22 -0.735 -2.22 z');
    
        marker.appendChild(path);
    
        return marker;
    };
    
    const getArrow = () => {
        const s = defaultOptions.current.arrow.headSize;
        const l = defaultOptions.current.arrow.length;
    
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    
        defs.appendChild(getCDArrowhead());
        svg.appendChild(defs);
    
        svg.setAttributeNS(null, 'id', 'arrow');
    
        line.setAttributeNS(null, 'x1', 0.0);
        line.setAttributeNS(null, 'y1', -defaultOptions.current.arrow.thickness / 2.0);
        line.setAttributeNS(null, 'x2', l);
        line.setAttributeNS(null, 'y2', -defaultOptions.current.arrow.thickness / 2.0);
        line.setAttributeNS(null, 'stroke-width', defaultOptions.current.arrow.thickness);
        line.setAttributeNS(null, 'stroke', themeManager.current.getColor("C"));
        line.setAttributeNS(null, 'marker-end', 'url(#arrowhead)');
    
        svg.appendChild(line);
        svg.setAttributeNS(null, 'viewBox', `0 ${-s / 2.0} ${l + s * (7 / 4.5)} ${s}`);
    
        return svg;
    };
    

    return ({
        draw,
        getPlus,
        getArrow,
        getArrowhead,
        getCDArrowhead,
    });
};