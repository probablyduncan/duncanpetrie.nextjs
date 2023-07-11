export const colors = {
    black: '#242626',
    slate: '#444a4a',
    caption: '#737878',
    grey: '#cdcdcd',
    light: '#fafaff',
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
}

export const gradients = {
    black: [colors.black, colors.black],
    redYellow: [colors.red, colors.yellow],
    greenYellow: ['#CFCB6E', '#E4B87D'],
    pinkPurple: ['#FFD8D8', '#D7DBF9'],
    purpleGreen: ['#DFE2FF', '#C9F6DE'],
    yellowGreen: ['#F8EDC7', '#D7F9E7'],
    purpleRed: ['#F2D9ED', '#FFD7D7'],
    mapGreen: [colors.mapGreen, colors.mapLightGreen],
}

/**
 * Examples: 
 * 
 * - \<tag style={getGradientBackgroundCSS(colors.red, colors.yellow)} />
 * - \<tag style={{p: 1, ...getGradientBackgroundCSS(...gradients.redYellow) }} />
 */
export const getGradientBackgroundCSS = ( c1, c2, deg ) => { return {background: `linear-gradient(${deg ?? 130}deg, ${c1 ?? colors.black} 0%, ${c2 ?? colors.clear} 100%)`, ...extraGradientBackgroundStyle,} }
export const extraGradientBackgroundStyle = { WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', }



export const printColors = () => {
    Object.keys(colors).map(c => {
        console.log("%c" + c, "color:" + colors[c] + ";font-weight:bold;");
    })
}