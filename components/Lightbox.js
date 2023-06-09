import { ArticleContext } from "@/pages/a/[a]";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Caption, LatoWrapper, LightboxButton, LightboxText, UnderLonk } from "./TextStyles";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
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

    /**
     * listener for changing lightbox layout based on aspect ratio
     */

    const [isTall, setIsTall] = useState();
    useEffect(() => {

        const lightboxQuery = matchMedia(`(max-aspect-ratio: 1)`);

        const onLightboxResize = () => {
            setIsTall(lightboxQuery.matches || window.innerWidth <= window.innerHeight);
        }

        onLightboxResize();

        lightboxQuery.addEventListener('change', onLightboxResize);
        window.addEventListener('resize', onLightboxResize);
        return () => {
            lightboxQuery.removeEventListener('change', onLightboxResize);
            window.removeEventListener('resize', onLightboxResize);
        }

    }, [])


    /**
     * handle changing images
     */

    const next = useCallback((prev = false) => {
        // next() to go forward, next(false) to go back
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

    const tallPadding = 25;
    const widePadding = 40;

    return <AnimatePresence> {
        lightboxKeys[index] != null && (
            <motion.div layout 
                style={{
                    width: `calc(100svw - ${2 * (isTall ? tallPadding : widePadding)}px)`, 
                    height: `calc(100svh - ${2 * (isTall ? tallPadding : widePadding)}px)`,
                    padding: isTall ? `${tallPadding}px` : `${widePadding}px`,
                    paddingBottom: `calc(100vh - 100svh + ${isTall ? tallPadding : widePadding}px)`,    // normal padding val plus difference between 100vh and 100svh
                    
                    position: 'fixed',
                    top: 0, left: 0,
                    zIndex: '100',
                    
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    flexFlow: isTall ? 'column' : 'row',
                    
                    backgroundColor: '#fafaff',
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ease: "easeOut", duration: 0.1 }}
            >
                {/* image container */}
                <div style={{
                    width: isTall ? `calc((100svh - 225px) * ${imgData[lightboxKeys[index]].ratio})` : 'calc(100% - 250px)',
                    maxWidth: isTall ? `100%` : `calc((100svh - 80px) * ${imgData[lightboxKeys[index]].ratio})`,
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
                        {isTall && <br />}
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>;
}

/**
 * @param {string} imgKey 
 * @param {boolean} noCaption
 * @returns Img component wrapped in button that toggles lightbox.
 * If no lightbox images, the action/effects are disabled.
 */
export function LightboxLinkedImg({ imgKey, noCaption, noBorder, margin, restrictHeight, width }) {
    const {lightboxKeys, toggleLightbox} = useContext(ArticleContext);

    const openLightbox = () => toggleLightbox(lightboxKeys.indexOf(imgKey));

    const imgObject = imgData[imgKey];

    return (<div style={{display: 'flex', flexFlow: 'column nowrap', width: width ?? '100%', maxWidth: restrictHeight ? `calc(80vh * ${imgObject.ratio})` : width ?? '100%'}}>
        <motion.button
            style={{
                display: 'block', 
                width: !noBorder ? 'calc(100% - 4px)' : '100%',
                boxShadow: !noBorder ? '4px 4px #242626' : '0px 0px 0px #2426260f',
                cursor: lightboxKeys[0] ? 'zoom-in' : 'auto',
                margin
            }} 
            whileHover={lightboxKeys[0] && (noBorder ? {boxShadow: '4px 4px 15px #2426260f'} : {boxShadow: '6px 6px #242626'})}
            whileTap={lightboxKeys[0] && (noBorder ? {boxShadow: '4px 4px 5px #2426260f'} : {boxShadow: '4px 4px #242626'})}
            onClick={lightboxKeys[0] && openLightbox} 
        >
            <Img img={imgObject} style={{boxShadow: 'inherit', width: '100%'}}/>
        </motion.button>
        {!noCaption && <Caption>{getCaption(imgObject)}</Caption>}
    </div>);
}

export function LightboxLinkedSlideshow({ imgKeys, noCaptions, noBorder, margin, restrictHeight, width }) {
    
    const {lightboxKeys, toggleLightbox} = useContext(ArticleContext);

    const openLightbox = () => toggleLightbox(lightboxKeys.indexOf(imgKeys[slide]));

    const [slide, setSlide] = useState(0);
    const arrowLeft = useRef(); const arrowRight = useRef(); const slideshowRef = useRef();
    const slideshowInView = useInView(slideshowRef);

    useEffect(() => {
        const keyDownHandler = (e) => {

            // if slideshow out of view, do not toggle slide
            if (!slideshowInView) return;

            if (e.code === "ArrowLeft") {
                setSlide(getNextIndex(slide, imgKeys.length, true));
                stylePress(arrowLeft.current);
            }
            else if (e.code === "ArrowRight") {
                setSlide(getNextIndex(slide, imgKeys.length, false));
                stylePress(arrowRight.current);
            }
        };

        // flash hover effect on keypress
        const stylePress = (e) => {
            animate(e, {backgroundColor: '#efefef'}, {duration: 0.1});
            setTimeout(() => {
                animate(e, {backgroundColor: '#ffffffff'}, {duration: 0.2});
            }, 200);
        };

        document.addEventListener("keydown", keyDownHandler);
        return () => document.removeEventListener("keydown", keyDownHandler);
        
    }, [imgKeys.length, slide, slideshowInView]);

    const slideshowButtonStyle = {
        style: {
            fontFamily: 'inherit',
            fontSize: '16px',
            color: '#898989',
            margin: '15px 6px 0 6px',
            padding: '0px 6px 2px',
            borderRadius: '20%',
            backgroundColor: '#ffffffff',
        },
        whileHover: {
            backgroundColor: '#efefef',
            transition: {duration: 0.2}
        },
    }

    return (
        <div style={{
            display: 'flex', 
            flexFlow: 'column nowrap', 
            width: width ?? '100%', 
            maxWidth: restrictHeight ? `calc(80vh * ${imgData[imgKeys[slide]].ratio})` : width ?? '100%'
        }}>
            <motion.button
                ref={slideshowRef} 
                style={{
                    display: 'block', 
                    width: !noBorder ? 'calc(100% - 4px)' : '100%',
                    boxShadow: !noBorder ? '4px 4px #242626' : '0px 0px 0px #2426260f',
                    cursor: lightboxKeys[0] ? 'zoom-in' : 'auto',
                    margin
                }} 
                whileHover={lightboxKeys[0] && (noBorder ? {boxShadow: '4px 4px 15px #2426260f'} : {boxShadow: '6px 6px #242626'})}
                whileTap={lightboxKeys[0] && (noBorder ? {boxShadow: '4px 4px 5px #2426260f'} : {boxShadow: '4px 4px #242626'})}
                onClick={lightboxKeys[0] && openLightbox}
            >
                <Img img={imgData[imgKeys[slide]]} style={{boxShadow: 'inherit', width: '100%'}}/>
            </motion.button>
            <div style={{display: 'flex', flexFlow: 'row-reverse nowrap', justifyContent: 'space-between',}}>
                {!noCaptions && <Caption>{getCaption(imgData[imgKeys[slide]])}</Caption>}
                <LatoWrapper div>
                    <div style={{display: 'flex', alignItems: 'flex-end', userSelect: 'none'}}>
                        <motion.button 
                            ref={arrowLeft} 
                            {...slideshowButtonStyle} 
                            onClick={() => setSlide(getNextIndex(slide, imgKeys.length, true))}
                        >
                            &lt;
                        </motion.button>
                        <span style={{
                            fontSize: '12px', 
                            marginBottom: '5px', 
                            color: 'cornflowerblue'
                        }}>
                            {slide + 1 + "/" + imgKeys.length}
                        </span>
                        <motion.button 
                            ref={arrowRight} 
                            {...slideshowButtonStyle} 
                            onClick={() => setSlide(getNextIndex(slide, imgKeys.length))}
                        >
                            &gt;
                        </motion.button>
                    </div>
                </LatoWrapper>
            </div>
        </div>
    );
}