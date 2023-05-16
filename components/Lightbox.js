import { ArticleContext } from "@/pages/a/[a]";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Caption, LightboxButton, LightboxText, UnderLonk } from "./TextStyles";
import { ViewportContext } from "./Viewport";
import { motion } from "framer-motion";
import Img from "./Img";
import { getCaption, getNextIndex } from "@/lib/imageHelper";
import { imgData } from "@/data/images";

/**
 * @param {number} index of image key in lightbox keys array
 * @param {string} imageKey optional, use instead of index, key of image in lightbox keys array 
 * @returns link to lightbox for `imageKey` specified, or for `index` if no key is given
 */
export function LightboxLink({ index = 0, imageKey, children }) {

    const {lightboxKeys, toggleLightbox} = useContext(ArticleContext);

    if (imageKey) index = lightboxKeys.indexOf(imageKey);

    return lightboxKeys.length > 0 ? <UnderLonk title="Gallery" action={() => toggleLightbox(index)}>{children}</UnderLonk> : <>{children}</>;
}

/**
 * @param {number} index
 * @returns lightbox if `index` is not null.
 */
export default function Lightbox({ index }) {
    
    const {lightboxKeys, toggleLightbox} = useContext(ArticleContext);
    const {mobile} = useContext(ViewportContext);


    /**
     * listener for changing lightbox layout based on aspect ratio
     */

    const [isTall, setLightboxTall] = useState();
    useLayoutEffect(() => {

        const lightboxQuery = matchMedia(`(max-aspect-ratio: 1)`);

        const onLightboxResize = () => {
            setLightboxTall(lightboxQuery.matches);
        }

        onLightboxResize();

        lightboxQuery.addEventListener('change', onLightboxResize);
        return () => {
            lightboxQuery.removeEventListener('change', onLightboxResize);
        }

    }, [])


    /**
     * handle changing images
     */

    // next() to go forward, next(false) to go back
    const next = useCallback((prev = false) => {
        if (index != null) toggleLightbox(getNextIndex(index, lightboxKeys.length, prev, 1), prev ? 'left' : 'right');
    }, [index, toggleLightbox, lightboxKeys.length]);

    // set up keypress events
    useEffect(() => {
        const keyDownHandler = (e) => {
            if (e.code === "ArrowLeft") next(true);
            if (e.code === "ArrowRight") next();
            if (e.code === "Escape") toggleLightbox(false);
        };

        window.addEventListener("keydown", keyDownHandler);
        return () => window.removeEventListener("keydown", keyDownHandler);
    }, [index, next, toggleLightbox]);


    /**
     * prevent scrolling while in lightbox
     */

    useEffect(() => {
        const handleWindowWheel = (e) => {
            if (index) e.preventDefault();
        };
        
        window.addEventListener('wheel', handleWindowWheel, { passive: false });
        window.addEventListener('touchmove', handleWindowWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWindowWheel, { passive: false });
            window.removeEventListener('touchmove', handleWindowWheel, { passive: false });
        };

    }, [index]);

    return ( lightboxKeys[index] != null &&
        <motion.div layout initial={{
            width: `calc(100svw - ${2 * (isTall ? 25 : 40)}px)`, height: `calc(100svh - ${2 * (isTall ? 25 : 40)}px)`,
            padding: isTall ? '25px' : '40px',
            top: 0, left: 0,
            display: 'flex', justifyContent: 'space-between',
            backgroundColor: '#fafaff',
            position: 'fixed',
            zIndex: '100',
            opacity: 0
        }} animate={{
            opacity: 1,
            flexFlow: isTall ? 'column' : 'row',
            alignItems: 'flex-end',
            width: `calc(100svw - ${2 * (isTall ? 25 : 40)}px)`, height: `calc(100svh - ${2 * (isTall ? 25 : 40)}px)`, 
            padding: isTall ? '25px' : '40px',
        }}>
            {/* image container */}
            <div style={{
                width: isTall ? `calc((100vh - 225px) * ${imgData[lightboxKeys[index]].ratio})` : 'calc(100% - 250px)',
                maxWidth: isTall ? `100%` : `calc((100dvh - 80px) * ${imgData[lightboxKeys[index]].ratio})`,
                display: 'flex',
                alignItems: 'flex-end',
            }}>
                <Img img={imgData[lightboxKeys[index]]} onClick={() => toggleLightbox(null)} style={{cursor: 'zoom-out', boxShadow: 'none', width: '100%', }} />
            </div>
            {/* text container */}
            <div style={{
                height: '100%', width: isTall ? '100%' : '200px',
                display: 'flex', flexFlow: isTall ? 'column-reverse' : 'column',
                justifyContent: isTall ? 'flex-start' : 'space-between', 
                alignItems: 'flex-end',
            }}>
                <div style={isTall ? {
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'flex-end'
                } : {}}>
                    <LightboxText noSelect color={imgData[lightboxKeys[index]].color} >{index + 1}&nbsp;/&nbsp;{lightboxKeys.length}</LightboxText>
                    <br />
                    <div>
                        <LightboxText noSelect>
                            <LightboxButton action={() => next(true)}>prev</LightboxButton>
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            <LightboxButton action={() => next()}>next</LightboxButton>
                        </LightboxText>
                        <br />
                        <LightboxText noSelect><LightboxButton action={() => toggleLightbox(null)}>exit.</LightboxButton></LightboxText>
                    </div>
                </div>
                <div>
                    <LightboxText select>{getCaption(imgData[lightboxKeys[index]])}</LightboxText>
                    <br />
                </div>
            </div>
        </motion.div>
    );
}

/**
 * @param {string} imgKey 
 * @param {boolean} noCaption
 * @returns Img component wrapped in button that toggles lightbox.
 * If no lightbox images, the action/effects are disabled.
 */
export function LightboxLinkedImg({ imgKey, noCaption }) {
    const {lightboxKeys, toggleLightbox} = useContext(ArticleContext);

    const openLightbox = () => toggleLightbox(lightboxKeys.indexOf(imgKey))

    return (<>
        <motion.button
            style={{
                display: 'block', 
                width: 'calc(100% - 4px)',
                boxShadow: '4px 4px #242626',
                cursor: lightboxKeys[0] ? 'zoom-in' : 'auto',
            }} 
            whileHover={lightboxKeys[0] && {boxShadow: '6px 6px #242626'}}
            whileTap={lightboxKeys[0] && {boxShadow: '4px 4px #242626'}}
            onClick={lightboxKeys[0] && openLightbox} 
        >
            <Img img={imgData[imgKey]} style={{boxShadow: 'inherit', width: '100%'}}/>
        </motion.button>
        {!noCaption && <Caption>{getCaption(imgData[imgKey])}</Caption>}
    </>);
}