export const Vector2 = (props) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    useEffect(() => {
        if (props.x !== undefined && props.y !== undefined) {
            setX(props.x);
            setY(props.y);
        }
    }, [props.x, props.y]);

    const clone = () => {
        return new Vector2(x, y);
    };

    const toString = () => {
        return '(' + x + ',' + y + ')';
    };

    const add = (vec) => {
        setX(x + vec.x);
        setY(y + vec.y);
    };

    const subtract = (vec) => {
        setX(x - vec.x);
        setY(y - vec.y);
    };

    const divide = (scalar) => {
        setX(x / scalar);
        setY(y / scalar);
    };

    const multiply = (v) => {
        setX(x * v.x);
        setY(y * v.y);
    };

    const multiplyScalar = (scalar) => {
        setX(x * scalar);
        setY(y * scalar);
    };

    const invert = () => {
        setX(-x);
        setY(-y);
    };

    const angle = () => {
        return Math.atan2(y, x);
    };

    const distance = (vec) => {
        return Math.sqrt((vec.x - x) * (vec.x - x) + (vec.y - y) * (vec.y - y));
    };

    const distanceSq = (vec) => {
        return (vec.x - x) * (vec.x - x) + (vec.y - y) * (vec.y - y);
    };

    const clockwise = (vec) => {
        let a = y * vec.x;
        let b = x * vec.y;
        if (a > b) {
            return -1;
        } else if (a === b) {
            return 0;
        }
        return 1;
    };

    const relativeClockwise = (center, vec) => {
        let a = (y - center.y) * (vec.x - center.x);
        let b = (x - center.x) * (vec.y - center.y);
        if (a > b) {
            return -1;
        } else if (a === b) {
            return 0;
        }
        return 1;
    };

    const rotate = (angle) => {
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);
        setX(x * cosAngle - y * sinAngle);
        setY(x * sinAngle + y * cosAngle);
    };

    const rotateAround = (angle, vec) => {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        let newX = x - vec.x;
        let newY = y - vec.y;
        setX(newX * c - newY * s + vec.x);
        setY(newX * s + newY * c + vec.y);
    };

    return ({
        clone,
        toString,
        add,
        subtract,
        divide,
        multiply,
        multiplyScalar,
        invert,
        angle,
        distance,
        distanceSq,
        clockwise,
        relativeClockwise,
        rotate,
        rotateAround,
    });
}