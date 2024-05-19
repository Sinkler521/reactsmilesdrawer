import React from 'react';

export const Drawer = ({ options }) => {
    const svgDrawerRef = useRef(null);
  
    useEffect(() => {
      svgDrawerRef.current = new SvgDrawer(options);
    }, [options]);
  
    const draw = (data, target, themeName = 'light', infoOnly = false, highlight_atoms = []) => {
      let canvas = null;
      if (typeof target === 'string' || target instanceof String) {
        canvas = document.getElementById(target);
      } else {
        canvas = target;
      }
  
      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttributeNS(null, 'viewBox', `0 0 ${svgDrawerRef.current.opts.width} ${svgDrawerRef.current.opts.height}`);
      svg.setAttributeNS(null, 'width', `${svgDrawerRef.current.opts.width}`);
      svg.setAttributeNS(null, 'height', `${svgDrawerRef.current.opts.height}`);
      svgDrawerRef.current.draw(data, svg, themeName, infoOnly, highlight_atoms);
      svgDrawerRef.current.svgWrapper.toCanvas(canvas, svgDrawerRef.current.opts.width, svgDrawerRef.current.opts.height);
    };
  
    const getTotalOverlapScore = () => {
      return svgDrawerRef.current.getTotalOverlapScore();
    };
  
    const getMolecularFormula = () => {
      return svgDrawerRef.current.getMolecularFormula();
    };

    return {
      draw,
      getTotalOverlapScore,
      getMolecularFormula
    };
  };
  
  export default Drawer;