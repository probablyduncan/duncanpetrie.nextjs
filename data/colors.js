export const colors = {
    black: '#242626',
    slate: '#444a4a',
    caption: '#737878',
    grey: '#cdcdcd',
    light: '#fafaff',
    white: '#ffffff',

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

export const printColors = () => {
    Object.keys(colors).map(c => {
        console.log("%c" + c, "color:" + colors[c] + ";font-weight:bold;");
    })
}