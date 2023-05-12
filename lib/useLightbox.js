import { useEffect, useState, useMemo } from "react";
import { getAllImages } from "./imageHelper";

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
    const toggleLightbox = (i) => setLightbox(lightbox != i && lightboxOptions ? i : null);

    // get images for lightbox and store in memo to preserve shuffle
    const [lightboxKeysState, setLightboxKeysState] = useState([]);

    useEffect(() => 
        setLightboxKeysState(
            lightboxOptions ? getAllImages(lightboxOptions.images, lightboxOptions.tag, lightboxOptions.shuffle ?? true) : []
        ), 
        [lightboxOptions]
    );

    const lightboxKeys = useMemo(() => lightboxKeysState, [lightboxKeysState]);

    return [lightbox, lightboxKeys, toggleLightbox];
}