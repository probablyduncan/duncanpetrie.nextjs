export const colors = {
    black: '#242626',
    slate: '#444a4a',
    caption: '#737878',
    grey: '#cdcdcd',
    offWhite: '#fafaff',
    white: '#ffffff',
    clear: '#ffffff00',

    highlight: '#fff8ac',

    errorYellow: '#eeac3f',
    errorRed: '#e83d3f',

    red: '#ff4b4b',
    yellow: '#ffb053' ?? '#ffba5e',
    rellow: '#ff7b4f',

    mapGreen: '#dbe76f',
    mapLightGreen: '#e7efa2',
    
    cornflowerBlue: '#6495ed',
    lightBlue: '#b0c5fb',

    surrogateRed: '#f47665',
    surrogateGreen: '#32ae5d',
    surrogateYellow: '#fad549',

    jubileeBlue: '#72bcd5',
    jubileeOrange: '#ff9200',

    // world colors
    worldGreen1: '#CFCB6E',
    worldGreen2: '#D7F9E7',
    worldYellow1: '#E4B87D',
    worldYellow2: '#F8EDC7',
}

export const addOpacity = (color, alphaHex) => (color[0] + (alphaHex ?? 40) + color.substring(1));

export const gradients = {
    black: [colors.black, colors.black],                        // fully black
    redYellow: [colors.red, colors.yellow],                     // dark red to yellow
    greenYellow: [colors.worldGreen1, colors.worldYellow1],     // dark-ish green to dark-ish grellow
    pinkPurple: ['#FFD8D8', '#D7DBF9'],                         // light red-pink to light purple, similar to map background
    purpleGreen: ['#DFE2FF', '#C9F6DE'],                        // lightish purple to aqua green, similar to map background
    yellowGreen: [colors.worldYellow2, colors.worldGreen2],     // lightish yellow to lightish bluegreen
    purpleRed: ['#F2D9ED', '#FFD7D7'],                          // medium purple to medium red
    mapGreen: [colors.mapGreen, colors.mapLightGreen],
}

export const pastels = [
    colors.highlight,
    colors.mapGreen,
    colors.mapLightGreen,
    ...gradients.pinkPurple,
    ...gradients.purpleRed,
]

export const worldGradients = [
    gradients.redYellow, gradients.greenYellow, gradients.pinkPurple, gradients.purpleGreen, gradients.yellowGreen, gradients.purpleRed, gradients.mapGreen
]

export const darkGradients = [
    gradients.redYellow, gradients.greenYellow, gradients.pinkPurple
];

export const lightGradients = [
    gradients.pinkPurple, gradients.yellowGreen, gradients.purpleGreen
];

/**
 * Examples: 
 * 
 * - \<tag style={getGradientTextCSS(colors.red, colors.yellow)} />
 * - \<tag style={{p: 1, ...getGradientTextCSS(...gradients.redYellow) }} />
 */
export const getGradientBackgroundCSS = ( c1, c2, deg ) => ({
    background: `linear-gradient(${deg ?? 135}deg, ${c1 ?? colors.black} 0%, ${c2 ?? colors.clear} 100%)`
});

export const getGradientTextCSS = ( c1, c2, deg ) => ({...getGradientBackgroundCSS(c1, c2, deg), ...gradientTextExtraStyle });

export const gradientTextExtraStyle = { WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', }



export const printColors = () => {
    Object.keys(colors).map(c => {
        console.log("%c" + c, "color:" + colors[c] + ";font-weight:bold;");
    })
}