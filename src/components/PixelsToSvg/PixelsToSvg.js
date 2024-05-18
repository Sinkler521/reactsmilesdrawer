// convertImage.js

export const convertImage = (img) => {
    "use strict";

    const each = (obj, fn) => {
        const length = obj.length;
        const likeArray = (length === 0 || (length > 0 && (length - 1) in obj));
        let i = 0;

        if (likeArray) {
            for (; i < length; i++) {
                if (fn.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else {
            for (i in obj) {
                if (fn.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        }
    };

    const componentToHex = (c) => {
        const hex = parseInt(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const getColor = (r, g, b, a) => {
        a = parseInt(a);
        if (a === undefined || a === 255) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        if (a === 0) {
            return false;
        }
        return `rgba(${r},${g},${b},${a / 255})`;
    };

    const makePathData = (x, y, w) => `M${x} ${y}h${w}`;
    const makePath = (color, data) => `<path stroke="${color}" d="${data}" />\n`;

    const colorsToPaths = (colors) => {
        let output = "";

        each(colors, (color, values) => {
            const orig = color;
            color = getColor.apply(null, color.split(','));

            if (color === false) {
                return;
            }

            const paths = [];
            let curPath;
            let w = 1;

            each(values, function () {
                if (curPath && this[1] === curPath[1] && this[0] === (curPath[0] + w)) {
                    w++;
                } else {
                    if (curPath) {
                        paths.push(makePathData(curPath[0], curPath[1], w));
                        w = 1;
                    }
                    curPath = this;
                }
            });

            paths.push(makePathData(curPath[0], curPath[1], w));
            output += makePath(color, paths.join(''));
        });

        return output;
    };

    const getColors = (img) => {
        const colors = {};
        const data = img.data;
        const len = data.length;
        const w = img.width;
        const h = img.height;
        let x = 0;
        let y = 0;

        for (let i = 0; i < len; i += 4) {
            if (data[i + 3] > 0) {
                const color = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
                colors[color] = colors[color] || [];
                x = (i / 4) % w;
                y = Math.floor((i / 4) / w);
                colors[color].push([x, y]);
            }
        }

        return colors;
    };

    const colors = getColors(img);
    const paths = colorsToPaths(colors);
    const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 ${img.width} ${img.height}" shape-rendering="crispEdges"><g shape-rendering="crispEdges">${paths}</g></svg>`;

    const dummyDiv = document.createElement('div');
    dummyDiv.innerHTML = output;

    return dummyDiv.firstChild;
};
