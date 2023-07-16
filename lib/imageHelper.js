import { imgData } from "@/data/images";
import shuffle from "@/lib/shuffle";


/**
 * @param {object} img 
 * @returns source of image object, with route appended
 */
export function getSrc(img) {
    return img && 'src' in img ? 
        '/images/' + img.src 
    : 
        '';
}

/**
 * @param {object} img 
 * @returns caption and year of image, properly punctuated. If no caption, return blank string
 */
export function getCaption(img) {
    return img?.caption ? 
        img.caption + (!img.caption.endsWith('!') && !img.caption.endsWith('?') ? '. ' : ' ') + getYear(img, '.') 
    : 
        '';
}

/**
 * @param {object} img 
 * @param {string} puctuation 
 * @returns year from image's date or year field, with punctuation
 */
export function getYear(img, puctuation) {
    return 'date' in img ? 
        img.date.substring(0,4) + puctuation 
    :
        (img.year ? img.year + puctuation : '');
}


/**
 * @param {string[]} images list of image keys
 * @param {string} tag 
 * @param {boolean} doShuffle if `true`, shuffles images from `tag`
 * @returns list of image keys that are in `images` or match `tag`. Keys in `image` will be at the front of the array
 */
export function getAllImages(images, tag, doShuffle) {

    if (!images) {
        if (!tag) return [];
        images = [];
    }
    
    return images.concat(
        imagesFromTag(tag, doShuffle)               // get image keys for the tag (returns [] if no tag)
        .filter(image => !images.includes(image))   // but only the ones that aren't already specified
    )
    .filter(image => image in imgData) ?? [];             // filter out ones that don't exist
}

/**
 * @param {string[]} images list of image keys
 * @param {string} tag 
 * @returns random image from all images which are in `images` or match `tag`, or null if no images found
 */
export function getRandImage(images, tag) {
    
    const imageKeys = getAllImages(images, tag, true);
    return imageKeys ? imageKeys[0] : null;
}

/**
 * @param {string} tag 
 * @param {boolean} doShuffle 
 * @returns all images in images.js that match `tag`, shuffled if `doShuffle`
 */
export function imagesFromTag(tag, doShuffle) {

    const imageKeys = [];

    if (tag) {
        for (let key in imgData) if (imgData[key].tags?.includes(tag)) imageKeys.push(key);
        if (doShuffle) shuffle(imageKeys);
    }

    return imageKeys;
}

/**
 * @returns list of all image tags, defined in images.js
 */
export function getImgTags() {
    const tags = [];
    for (const img in imgData) {
        if ( 'tags' in imgData[img]) {
            for (const tag of imgData[img].tags) {
                if (!tags.includes(tag)) tags.push(tag);
            }
        }

    }

    return tags;
}

/**
 * @returns either the next index or previous, based on `prev`, wrapped around `length`
 */
export function getNextIndex(current, length, prev = false, step = 1) {

    return (current + length + step * (prev ? -1 : 1)) % length;
}