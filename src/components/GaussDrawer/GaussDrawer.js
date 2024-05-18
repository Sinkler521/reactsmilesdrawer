import {Vector2} from './Vector2/Vector2';
import {convertImage} from './PixelsToSvg/PixelsToSvg';
import chroma from 'chroma-js';

export const GaussDrawer = ({
    points,
    weights,
    width,
    height,
    sigma = 0.3,
    interval = 0,
    colormap = null,
    opacity = 1.0,
    normalized = false,
}) => {
    if (colormap === null) {
        colormap = [
            "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef",
            "#ffffff",
            "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"
        ];
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const setFromArray = (arr_points, arr_weights) => {
        points = arr_points.map(a => new Vector2(a[0], a[1]));
        weights = arr_weights;
    };

    const draw = () => {
        let m = Array.from({ length: width }, () => Array(height).fill(0));

        const divisor = 1.0 / (2 * sigma ** 2);

        points.forEach((v, i) => {
            const a = weights[i];
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const v_xy = ((x - v.x) ** 2 + (y - v.y) ** 2) * divisor;
                    const val = a * Math.exp(-v_xy);
                    m[x][y] += val;
                }
            }
        });

        let abs_max = 1.0;
        if (!normalized) {
            let max = -Number.MAX_SAFE_INTEGER;
            let min = Number.MAX_SAFE_INTEGER;
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    if (m[x][y] < min) min = m[x][y];
                    if (m[x][y] > max) max = m[x][y];
                }
            }
            abs_max = Math.max(Math.abs(min), Math.abs(max));
        }

        const scale = chroma.scale(colormap).domain([-1.0, 1.0]);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (!normalized) m[x][y] = m[x][y] / abs_max;
                if (interval !== 0) m[x][y] = Math.round(m[x][y] / interval) * interval;
                const [r, g, b] = scale(m[x][y]).rgb();
                setPixel(new Vector2(x, y), r, g, b);
            }
        }
    };

    const getImage = (callback) => {
        let image = new Image();
        image.onload = () => {
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, width, height);
            if (callback) callback(image);
        };
        image.onerror = (err) => console.log(err);
        image.src = canvas.toDataURL();
    };

    const getSVG = () => convertImage(context.getImageData(0, 0, width, height));

    const setPixel = (vec, r, g, b) => {
        context.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        context.fillRect(vec.x, vec.y, 1, 1);
    };

    return {
        setFromArray,
        draw,
        getImage,
        getSVG,
        setPixel,
        canvas,
    };
};
