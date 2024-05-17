export const ThemeManager = ({ colors, theme }) => {
    const getColor = (key) => {
        key = key.toUpperCase();
        return key in theme ? theme[key] : theme['C'];
    };

    const setTheme = (newTheme) => {
        if (colors.hasOwnProperty(newTheme)) {
            theme = colors[newTheme];
        }

    };

    return { getColor, setTheme };
};