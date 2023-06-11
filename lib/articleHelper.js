import { imgData } from "@/data/images";

/**
 * @param {string} frontmatterColors string like '#color1,#color2
 * @param {string} cover image key for article's cover image
 * @returns array of two colors
 */
export function getColors( frontmatterColors, imgKeys ) {

    if (frontmatterColors && frontmatterColors.constructor !== Array) frontmatterColors = frontmatterColors.split(',').map(c => c.trim());

    if (frontmatterColors) 
        return [frontmatterColors[0], frontmatterColors[1] ?? frontmatterColors[0]];
    else if (imgKeys) 
        return [imgData[imgKeys[0]]?.color, imgData[imgKeys[1]]?.color ?? imgData[imgKeys[0]]?.color];
    else
        return ['#6495ed','#6495ed'];

}