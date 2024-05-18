import {Reaction} from './Reaction/Reaction';

export const ReactionParser = () => {

    const parse = (reactionSmiles) => {
        const reaction = new Reaction(reactionSmiles);
        return reaction;
    };

    return { parse };
};