import {Drawer} from './Drawer/Drawer';
import {Parser} from './Parser/Parser';
import {ReactionParser} from './ReactionParser/ReactionParser';
import {SvgDrawer} from './SvgDrawer/SvgDrawer';
import {ReactionDrawer} from './ReactionDrawer/ReactionDrawer';
import {SvgWrapper} from './SvgWrapper/SvgWrapper';
import {Options} from './Options/Options';

export const SmilesDrawer = () => {
    const drawMolecule = (smiles, target, theme, weights, callback) => {
        // Реализация метода drawMolecule
    };

    const drawReaction = (smiles, target, theme, settings, weights, callback) => {
        // Реализация метода drawReaction
    };

    const getDimensions = (element, svg = null) => {
        // Реализация метода getDimensions
    };

    return {
         drawMolecule,
         drawReaction,
         getDimensions 
        };
};