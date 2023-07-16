import { useEffect, useState, useMemo } from "react";
import { getAllImages, getNextIndex, getSrc } from "./imageHelper";
import { imgData } from "@/data/images";
import { colors } from "@/data/colors";

/**
 * 
 * @param {object} lightboxOptions article.frontmatter.lightbox
 * @returns `lightbox` current index
 * @returns `lightboxKeys` array of all img keys
 * @returns `toggleLightbox` function to update lightbox index
 */
export default function useLightbox( lightboxOptions ) {

    // set up state to store current lightbox index, if null then lightbox is hidden
    const [lightbox, setLightbox] = useState(null);

    // get images for lightbox and store in memo to preserve shuffle
    const [lightboxKeysState, setLightboxKeysState] = useState([]);

    useEffect(() => 
        setLightboxKeysState(
            lightboxOptions ? getAllImages(lightboxOptions.images, lightboxOptions.tag, lightboxOptions.shuffle ?? true) : []
        ), 
        [lightboxOptions]
    );

    const lightboxKeys = useMemo(() => lightboxKeysState, [lightboxKeysState]);

    // function to change lightbox
    const toggleLightbox = (i, direction) => {
        setLightbox(lightbox != i && lightboxOptions ? i : null);

        document.body.style.backgroundColor = (i === null ? colors.offWhite : 'inherit');

        if (i != null) {
            const preloadImage = new Image();
            if (!direction || direction == 'left') preloadImage.src = getSrc(imgData[lightboxKeys[getNextIndex(i, lightboxKeys.length, true)]]);
            if (!direction || direction == 'right') preloadImage.src = getSrc(imgData[lightboxKeys[getNextIndex(i, lightboxKeys.length)]]);

        }
    }

    return [lightbox, lightboxKeys, toggleLightbox];
}