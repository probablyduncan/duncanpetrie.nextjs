import { imgData } from "@/data/images";

/**
 * @param {string} frontmatterColors string like '#color1,#color2
 * @param {string} cover image key for article's cover image
 * @returns array of two colors
 */
export function getColors( frontmatterColors, imageKeys ) {

    if (frontmatterColors && frontmatterColors.constructor !== Array) frontmatterColors = frontmatterColors.split(',').map(c => c.trim());
    
    return frontmatterColors ? [frontmatterColors[0], frontmatterColors[1] ?? frontmatterColors[0]] : [imgData[imageKeys[0]]?.color ?? '#6495ed', imgData[imageKeys[1]]?.color ?? imgData[imageKeys[0]]?.color ?? '#6495ed'];

}