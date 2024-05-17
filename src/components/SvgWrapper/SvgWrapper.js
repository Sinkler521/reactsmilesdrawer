import React from 'react';
import {getChargeText} from './UtilityFunctions/UtilityFunctions'
  
import {Line} from './Line/Line';
import {Vector2} from './Vector2/Vector2';
import {MathHelper} from './MathHelper/MathHelper';
  
export const makeid = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


export const SvgWrapper = ({ themeManager, target, options, clear = true }) => {
    const [svg, setSvg] = useState(null);
    const [container, setContainer] = useState(null);
    const [backgroundItems, setBackgroundItems] = useState([]);
    const [paths, setPaths] = useState([]);
    const [vertices, setVertices] = useState([]);
    const [gradients, setGradients] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [maskElements, setMaskElements] = useState([]);
    const [maxX, setMaxX] = useState(-Number.MAX_VALUE);
    const [maxY, setMaxY] = useState(-Number.MAX_VALUE);
    const [minX, setMinX] = useState(Number.MAX_VALUE);
    const [minY, setMinY] = useState(Number.MAX_VALUE);
    const [drawingWidth, setDrawingWidth] = useState(0);
    const [drawingHeight, setDrawingHeight] = useState(0);
    const [halfBondThickness, setHalfBondThickness] = useState(options.bondThickness / 2.0);
    const [uid, setUid] = useState(makeid(5));
    const [gradientId, setGradientId] = useState(0);
  
    useEffect(() => {
      initializeSvgWrapper();
    }, []);
  
    const initializeSvgWrapper = () => {
      let svgElement = null;
      let containerElement = null;
  
      if (typeof target === 'string' || target instanceof String) {
        svgElement = document.getElementById(target);
      } else {
        svgElement = target;
      }
  
      const clearSvg = () => {
        while (svgElement.firstChild) {
          svgElement.removeChild(svgElement.firstChild);
        }
      };
  
      clear && clearSvg();
  
      setSvg(svgElement);
  
      if (!svgElement) {
        containerElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svgElement.appendChild(containerElement);
        setContainer(containerElement);
      }
  
      setStyleElement(svgElement);
  
      setSvg(svgElement);
    };
  
    const setStyleElement = (svgElement) => {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.appendChild(document.createTextNode(`
        .element {
          font: ${options.fontSizeLarge}pt ${options.fontFamily};
        }
        .sub {
          font: ${options.fontSizeSmall}pt ${options.fontFamily};
        }
      `));
      svgElement.appendChild(style);
    };
  
    const constructSvg = () => {
      let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      let masks = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
      let background = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let highlights = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let pathsElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let verticesElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let pathChildNodes = paths;
  
      let mask = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      mask.setAttributeNS(null, 'x', minX);
      mask.setAttributeNS(null, 'y', minY);
      mask.setAttributeNS(null, 'width', maxX - minX);
      mask.setAttributeNS(null, 'height', maxY - minY);
      mask.setAttributeNS(null, 'fill', 'white');
      masks.appendChild(mask);
      masks.setAttributeNS(null, 'id', uid + '-text-mask');
  
      for (let path of pathChildNodes) {
        pathsElement.appendChild(path);
      }
  
      for (let backgroundItem of backgroundItems) {
        background.appendChild(backgroundItem);
      }
      for (let highlight of highlights) {
        highlights.appendChild(highlight);
      }
      for (let vertex of vertices) {
        verticesElement.appendChild(vertex);
      }
      for (let mask of maskElements) {
        masks.appendChild(mask);
      }
      for (let gradient of gradients) {
        defs.appendChild(gradient);
      }
  
      pathsElement.setAttributeNS(null, 'mask', 'url(#' + uid + '-text-mask)');
  
      updateViewbox(options.scale);
  
      background.setAttributeNS(null, 'style', `transform: translateX(\${minX}px) translateY(\${minY}px)`);
  
      if (svg) {
        svg.appendChild(defs);
        svg.appendChild(masks);
        svg.appendChild(background);
        svg.appendChild(highlights);
        svg.appendChild(pathsElement);
        svg.appendChild(verticesElement);
      } else {
        container.appendChild(defs);
        container.appendChild(masks);
        container.appendChild(background);
        container.appendChild(highlights);
        container.appendChild(pathsElement);
        container.appendChild(verticesElement);
      }
  
      options.maskIds.push(uid + '-text-mask');
      setUid(makeid(5));
    };
  
    const updateViewbox = (scale) => {
      if (svg) {
        svg.setAttributeNS(null, 'viewBox', `\${minX} \${minY} \${drawingWidth} \${drawingHeight}`);
      } else {
        container.setAttributeNS(null, 'transform', 'scale(' + scale + ')');
      }
    };
  
    const clear = () => {
      setBackgroundItems([]);
      setPaths([]);
      setVertices([]);
      setGradients([]);
      setHighlights([]);
      setMaskElements([]);
      setMaxX(-Number.MAX_VALUE);
      setMaxY(-Number.MAX_VALUE);
      setMinX(Number.MAX_VALUE);
      setMinY(Number.MAX_VALUE);
      setDrawingWidth(0);
      setDrawingHeight(0);
    };
  
    const makeid = (length) => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    };
  
    return {
      setBackgroundItems,
      setPaths,
      setVertices,
      setGradients,
      setHighlights,
      setMaskElements,
      setMaxX,
      setMaxY,
      setMinX,
      setMinY,
      setDrawingWidth,
      setDrawingHeight,
      constructSvg,
      clearSvg,
      updateViewbox,
      clear,
    };
  }

  export default SvgWrapper;