import React, { useState, useEffect } from 'react';
import Vector2 from '../Vector2/Vector2';

export const Line = (props) => {
    const [from, setFrom] = useState(new Vector2(0, 0));
    const [to, setTo] = useState(new Vector2(0, 0));
    const [elementFrom, setElementFrom] = useState(null);
    const [elementTo, setElementTo] = useState(null);
    const [chiralFrom, setChiralFrom] = useState(false);
    const [chiralTo, setChiralTo] = useState(false);

    useEffect(() => {
        // This effect will run on mount and whenever any of the props change
        setFrom(props.from || new Vector2(0, 0));
        setTo(props.to || new Vector2(0, 0));
        setElementFrom(props.elementFrom || null);
        setElementTo(props.elementTo || null);
        setChiralFrom(props.chiralFrom || false);
        setChiralTo(props.chiralTo || false);
    }, [props.from, props.to, props.elementFrom, props.elementTo, props.chiralFrom, props.chiralTo]);

    const getLength = () => {
        return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    };

    const getAngle = () => {
        let diff = Vector2.subtract(getRightVector(), getLeftVector());
        return diff.angle();
    };

    const getRightVector = () => {
        if (from.x < to.x) {
            return to;
        } else {
            return from;
        }
    };

    const getLeftVector = () => {
        if (from.x < to.x) {
            return from;
        } else {
            return to;
        }
    };

    const getRightElement = () => {
        if (from.x < to.x) {
            return elementTo;
        } else {
            return elementFrom;
        }
    };

    const getLeftElement = () => {
        if (from.x < to.x) {
            return elementFrom;
        } else {
            return elementTo;
        }
    };

    const getRightChiral = () => {
        if (from.x < to.x) {
            return chiralTo;
        } else {
            return chiralFrom;
        }
    };

    const getLeftChiral = () => {
        if (from.x < to.x) {
            return chiralFrom;
        } else {
            return chiralTo;
        }
    };

    const setRightVector = (x, y) => {
        if (from.x < to.x) {
            setTo({ x: x, y: y });
        } else {
            setFrom({ x: x, y: y });
        }
    };

    const setLeftVector = (x, y) => {
        if (from.x < to.x) {
            setFrom({ x: x, y: y });
        } else {
            setTo({ x: x, y: y });
        }
    };

    const rotateToXAxis = () => {
        let left = getLeftVector();
        setRightVector(left.x + getLength(), left.y);
    };

    const rotate = (theta) => {
        let l = getLeftVector();
        let r = getRightVector();
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);
        let x = cosTheta * (r.x - l.x) - sinTheta * (r.y - l.y) + l.x;
        let y = sinTheta * (r.x - l.x) - cosTheta * (r.y - l.y) + l.y;
        setRightVector(x, y);
    };

    const shortenFrom = (by) => {
        let f = Vector2.subtract(to, from);
        f.normalize();
        f.multiplyScalar(by);
        setFrom({ x: from.x + f.x, y: from.y + f.y });
    };

    const shortenTo = (by) => {
        let f = Vector2.subtract(from, to);
        f.normalize();
        f.multiplyScalar(by);
        setTo({ x: to.x + f.x, y: to.y + f.y });
    };

    const shortenRight = (by) => {
        if (from.x < to.x) {
            shortenTo(by);
        } else {
            shortenFrom(by);
        }
    };

    const shortenLeft = (by) => {
        if (from.x < to.x) {
            shortenFrom(by);
        } else {
            shortenTo(by);
        }
    };

    const shorten = (by) => {
        let f = Vector2.subtract(from, to);
        f.normalize();
        f.multiplyScalar(by / 2.0);
        setTo({ x: to.x + f.x, y: to.y + f.y });
        setFrom({ x: from.x - f.x, y: from.y - f.y });
    };

    return ({
        getLength,
        getAngle,
        getRightVector,
        getLeftVector,
        getRightElement,
        getLeftElement,
        getRightChiral,
        getLeftChiral,
        setRightVector,
        setLeftVector,
        rotateToXAxis,
        rotate,
        shortenFrom,
        shortenTo,
        shortenRight,
        shortenLeft,
        shorten,
    });
}

export default Line;