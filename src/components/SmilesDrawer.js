import {Drawer} from './Drawer/Drawer';
import {Parser} from './Parser/Parser';
import {ReactionParser} from './ReactionParser/ReactionParser';
import {SvgDrawer} from './SvgDrawer/SvgDrawer';
import {ReactionDrawer} from './ReactionDrawer/ReactionDrawer';
import {SvgWrapper} from './SvgWrapper/SvgWrapper';
import {Options} from './Options/Options';
import { useEffect } from 'react';

export const SmilesDrawer = ({ moleculeOptions = {}, reactionOptions = {}, attribute = 'data-smiles', theme = 'light', successCallback = null, errorCallback = null }) => {
  useEffect(() => {
    const apply = () => {
      const elements = document.querySelectorAll(`[${attribute}]`);
      elements.forEach(element => {
        const smiles = element.getAttribute(attribute);

        if (smiles === null) {
          throw Error('No SMILES provided.');
        }

        let currentTheme = theme;
        let weights = null;

        if (element.hasAttribute('data-smiles-theme')) {
          currentTheme = element.getAttribute('data-smiles-theme');
        }

        if (element.hasAttribute('data-smiles-weights')) {
          weights = element.getAttribute('data-smiles-weights').split(",").map(parseFloat);
        }

        if (element.hasAttribute('data-smiles-reactant-weights') ||
          element.hasAttribute('data-smiles-reagent-weights') ||
          element.hasAttribute('data-smiles-product-weights')) {
          weights = { reactants: [], reagents: [], products: [] };
          if (element.hasAttribute('data-smiles-reactant-weights')) {
            weights.reactants = element.getAttribute('data-smiles-reactant-weights').split(';').map(v => {
              return v.split(',').map(parseFloat);
            });
          }

          if (element.hasAttribute('data-smiles-reagent-weights')) {
            weights.reagents = element.getAttribute('data-smiles-reagent-weights').split(';').map(v => {
              return v.split(',').map(parseFloat);
            });
          }

          if (element.hasAttribute('data-smiles-product-weights')) {
            weights.products = element.getAttribute('data-smiles-product-weights').split(';').map(v => {
              return v.split(',').map(parseFloat);
            });
          }
        }

        if (element.hasAttribute('data-smiles-options') || element.hasAttribute('data-smiles-reaction-options')) {
          let moleculeOptions = {};
          if (element.hasAttribute('data-smiles-options')) {
            moleculeOptions = JSON.parse(element.getAttribute('data-smiles-options').replaceAll('\'', '"'));
          }

          let reactionOptions = {};
          if (element.hasAttribute('data-smiles-reaction-options')) {
            reactionOptions = JSON.parse(element.getAttribute('data-smiles-reaction-options').replaceAll('\'', '"'));
          }

          drawSmiles(smiles, element, currentTheme, moleculeOptions, reactionOptions, successCallback, errorCallback, weights);
        } else {
          drawSmiles(smiles, element, currentTheme, moleculeOptions, reactionOptions, successCallback, errorCallback, weights);
        }
      });
    };

    const drawSmiles = (smiles, target, theme, moleculeOptions, reactionOptions, successCallback, errorCallback, weights) => {
      let rest = [];
      [smiles, ...rest] = smiles.split(' ');
      let info = rest.join(' ');

      let settings = {};

      if (info.includes('__')) {
        let settingsString = info.substring(info.indexOf('__') + 2, info.lastIndexOf('__'));
        settings = JSON.parse(settingsString.replaceAll('\'', '"'));
      }

      let defaultSettings = {
        textAboveArrow: '{reagents}',
        textBelowArrow: ''
      };

      settings = { ...defaultSettings, ...settings };

      if (smiles.includes('>')) {
        try {
          drawReaction(smiles, target, theme, settings, weights, successCallback);
        } catch (err) {
          if (errorCallback) {
            errorCallback(err);
          } else {
            console.error(err);
          }
        }
      } else {
        try {
          drawMolecule(smiles, target, theme, weights, successCallback);
        } catch (err) {
          if (errorCallback) {
            errorCallback(err);
          } else {
            console.error(err);
          }
        }
      }
    };

    const drawMolecule = (smiles, target, theme, weights, callback) => {
      const parseTree = Parser.parse(smiles);

      if (target === null || target === 'svg') {
        const svg = new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights);
        const dims = getDimensions(svg);
        svg.setAttributeNS(null, 'width', '' + dims.w);
        svg.setAttributeNS(null, 'height', '' + dims.h);
        if (callback) {
          callback(svg);
        }
      } else if (target === 'canvas') {
        const canvas = svgToCanvas(new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights));
        if (callback) {
          callback(canvas);
        }
      } else if (target === 'img') {
        const img = svgToImg(new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights));
        if (callback) {
          callback(img);
        }
      } else if (target instanceof HTMLImageElement) {
        svgToImg(new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights), target);
        if (callback) {
          callback(target);
        }
      } else if (target instanceof SVGElement) {
        new SvgDrawer(moleculeOptions).draw(parseTree, target, theme, weights);
        if (callback) {
          callback(target);
        }
      } else {
        const elements = document.querySelectorAll(target);
        elements.forEach(element => {
          const tag = element.nodeName.toLowerCase();
          if (tag === 'svg') {
            new SvgDrawer(moleculeOptions).draw(parseTree, element, theme, weights);
            if (callback) {
              callback(element);
            }
          } else if (tag === 'canvas') {
            svgToCanvas(new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights), element);
            if (callback) {
              callback(element);
            }
          } else if (tag === 'img') {
            svgToImg(new SvgDrawer(moleculeOptions).draw(parseTree, null, theme, weights), element);
            if (callback) {
              callback(element);
            }
          }
        });
      }
    };

    const drawReaction = (smiles, target, theme, settings, weights, callback) => {
      const reaction = ReactionParser.parse(smiles);

      if (target === null || target === 'svg') {
        const svg = new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme);
        const dims = getDimensions(svg);
        svg.setAttributeNS(null, 'width', '' + dims.w);
        svg.setAttributeNS(null, 'height', '' + dims.h);
        if (callback) {
          callback(svg);
        }
      } else if (target === 'canvas') {
        const canvas = svgToCanvas(new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme, weights, settings.textAboveArrow, settings.textBelowArrow));
        if (callback) {
          callback(canvas);
        }
      } else if (target === 'img') {
        const img = svgToImg(new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme, weights, settings.textAboveArrow, settings.textBelowArrow));
        if (callback) {
          callback(img);
        }
      } else if (target instanceof HTMLImageElement) {
        svgToImg(new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme, weights, settings.textAboveArrow, settings.textBelowArrow), target);
        if (callback) {
          callback(target);
        }
      } else if (target instanceof SVGElement) {
        new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, target, theme, weights, settings.textAboveArrow, settings.textBelowArrow);
        if (callback) {
          callback(target);
        }
      } else {
        const elements = document.querySelectorAll(target);
        elements.forEach(element => {
          const tag = element.nodeName.toLowerCase();
          if (tag === 'svg') {
            new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, element, theme, weights, settings.textAboveArrow, settings.textBelowArrow);
            if (callback) {
              callback(element);
            }
          } else if (tag === 'canvas') {
            svgToCanvas(new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme, weights, settings.textAboveArrow, settings.textBelowArrow), element);
            if (callback) {
              callback(element);
            }
          } else if (tag === 'img') {
            svgToImg(new ReactionDrawer(reactionOptions, JSON.parse(JSON.stringify(new SvgDrawer(moleculeOptions).opts))).draw(reaction, null, theme, weights, settings.textAboveArrow, settings.textBelowArrow), element);
            if (callback) {
              callback(element);
            }
          }
        });
      }
    };

    const svgToCanvas = (svg, canvas = null) => {
      if (canvas === null) {
        canvas = document.createElement('canvas');
      }

      const dims = getDimensions(canvas, svg);

      SvgWrapper.svgToCanvas(svg, canvas, dims.w, dims.h);
      return canvas;
    };

    const svgToImg = (svg, img = null) => {
      if (img === null) {
        img = document.createElement('img');
      }

      const dims = getDimensions(img, svg);

      SvgWrapper.svgToImg(svg, img, dims.w, dims.h);
      return img;
    };

    const getDimensions = (element, svg = null) => {
      let w = moleculeOptions.width;
      let h = moleculeOptions.height;

      if (moleculeOptions.scale <= 0) {
        if (w === null) {
          w = element.width;
        }

        if (h === null) {
          h = element.height;
        }

        if (element.style.width !== "") {
          w = parseInt(element.style.width);
        }

        if (element.style.height !== "") {
          h = parseInt(element.style.height);
        }
      } else if (svg) {
        w = parseFloat(svg.style.width);
        h = parseFloat(svg.style.height);
      }

      return { w, h };
    };

    apply();
  }, [moleculeOptions, reactionOptions, attribute, theme, successCallback, errorCallback]);

  return null;
};
