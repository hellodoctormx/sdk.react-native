export const hdColors = {
    lightHeaderBackground: "#894bec",
    darkAccentColor: "#4a2478",
    containerBackground: "#f2f2f7",
    containerBackgroundAlt: "#f2f7fb",
    primary: "#5D4760",
    primaryLight: "#8b768b",
    primaryLighter: "#a99aa9",
    primaryLightest: "#c7bdc7",
    secondary: "#0084F0",
    secondaryComplement: "#F06C00",
    secondaryLight: "#45AAFF",
    secondaryLightOriginal: "#7dc4ff",
    secondaryLightComplement: "#FFB87D",
    secondaryLighter: "#82c6ff",
    secondaryLightest: "#ecf7ff",
    secondaryDark: "#0062B2",
    secondaryDarkComplement: "#B25000",
    secondaryDarker: "#003154",
    secondaryDarkest: "#00294b",
    secondaryDarkestest: "#00070d",
    tertiary: "#ECE4E1",
    tertiaryLight: "#f2ebea",
    tertiaryLighter: "#f5f1ef",
    tertiaryLightest: "#f2f7fb",
    goodDarker: "#0e542d",
    goodDark: "#10810a",
    good: "#16B00E",
    goodLight: "#99f794",
    goodLightest: "#effeee",
    bad: "#e36663",
    badLight: "#F9DFDE",
    negative: "#C52723",
    negativeLight: "#E67573",
    negativeLightest: "#fcecec",
    gynecology: "#fce0f1",
    warn: "#dee837",
    badge: "#d51326",
    textMain: "#00294b",
    textSecondary: "#667686",
    textHighlight: "#0062B2"
};

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function alpha(color, alpha) {
    const rgb = hexToRgb(color);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function shade(color, percent) {
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    r = Math.min(255, parseInt(r * (100 + percent) / 100));
    g = Math.min(255, parseInt(g * (100 + percent) / 100));
    b = Math.min(255, parseInt(b * (100 + percent) / 100));

    const hex = v => v.toString(16).padStart(2, 0);

    return `#${hex(r)}${hex(g)}${hex(b)}`;
}
