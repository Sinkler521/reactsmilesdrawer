import {Parser} from './Parser/Parser';

export const Reaction = (reactionSmiles) => {
    const reaction = {
        reactantsSmiles: [],
        reagentsSmiles: [],
        productsSmiles: [],

        reactantsWeights: [],
        reagentsWeights: [],
        productsWeights: [],

        reactants: [],
        reagents: [],
        products: [],
    };

    const parts = reactionSmiles.split(">");

    if (parts.length !== 3) {
        throw new Error("Invalid reaction SMILES. Did you add fewer than or more than two '>'?");
    }

    if (parts[0] !== "") {
        reaction.reactantsSmiles = parts[0].split(".");
    }

    if (parts[1] !== "") {
        reaction.reagentsSmiles = parts[1].split(".");
    }

    if (parts[2] !== "") {
        reaction.productsSmiles = parts[2].split(".");
    }

    reaction.reactants = reaction.reactantsSmiles.map(smile => Parser.parse(smile));
    reaction.reagents = reaction.reagentsSmiles.map(smile => Parser.parse(smile));
    reaction.products = reaction.productsSmiles.map(smile => Parser.parse(smile));

    return reaction;
};