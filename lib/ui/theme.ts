export const HelloDoctorColors = {
    Blue100: '#b5ddff',
    Blue300: '#0A6FC2',
    Blue500: '#096FC3',
    Blue700: '#064579',
    Blue800: '#003154',
    Blue900: '#053862',
    Gray100: '#f2f2f7',
    Gray500: '#667686',
    Gray900: '#00294b',
    Green300: '#15d054',
    Green500: '#198754',
    Green700: '#0e542d',
    Orange300: '#FFB87D',
    Orange500: '#C25D0A',
    Purple700: '#612f6b',
    Red100: '#fcecec',
    Red300: '#E67573',
    Red500: '#bd2f2b',
};

export const ThemeColors = {
    TextMain: HelloDoctorColors.Gray900,
    TextSecondary: HelloDoctorColors.Gray500,
    ScreenBackground: HelloDoctorColors.Gray100,
    GoodAction: HelloDoctorColors.Green500,
    BadAction: HelloDoctorColors.Red500,
};

export const HelloDoctorFonts = {
    TextRegular: 'Nunito-Regular',
    TextSemiBold: 'Nunito-SemiBold',
    TextBold: 'Nunito-Bold',
    TextTitle: 'Nunito-Black',
};

export function alpha(color: string, alphaAmount: number): string {
    const rgb = hexToRgb(color);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaAmount})`;
}

function hexToRgb(hex): {r: number, g: number, b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}
