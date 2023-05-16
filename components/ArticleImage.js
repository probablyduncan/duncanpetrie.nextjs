import { useContext, useRef } from "react";
import { imgData } from "@/data/images";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { ViewportContext } from "./Viewport";
import { LightboxLinkedImg } from "./Lightbox";
import { ArticleContext } from "@/pages/a/[a]";

/**
 * @param {string} imgKey for imgData
 * @param {boolean} first styles image as cover 
 * @returns 
 */
export default function ArticleImage({ imgKey, first, type, sidePosition, mobileOnly, noMobile }) {
    const {textCentered} = useContext(ArticleContext);
    const {mobile} = useContext(ViewportContext);
    const ref = useRef();

    const inView = useInView(ref, {once: true, margin: '0px 0px 0px 0px'});

    return (imgKey in imgData && (
        <div ref={ref} style={{
            opacity: inView ? 1 : 0, 
            transition: 'opacity 0.5s',
            display: 'flex', justifyContent: textCentered && !first ? 'center' : 'flex-start'
        }}>
            {mobile ? 
                (!noMobile && <MobileImage first={first} imgKey={imgKey} />)
            :
                (textCentered && !first ? 
                    (!mobileOnly && <InlineImage imgKey={imgKey} type={type} />)
                : 
                    (!mobileOnly && <SideImage first={first} imgKey={imgKey} sidePosition={sidePosition} />)
                )
            }
        </div>
    ));
}

function MobileImage({ imgKey, first }) {

    return (
        <div style={{
            padding: first ? '0' : '50px 0',
        }}>
            <LightboxLinkedImg imgKey={imgKey} />
        </div>
    );
}

function SideImage({ imgKey, first, sidePosition = {width: 1, left: 0} }) {

    const ref = useRef();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const springScrollProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 50 });

    const y = useTransform(
        springScrollProgress,
        [0, 1],
        first ? [-200, -100] : [0, 100]
    );

    return (
        <motion.div ref={ref} style={{
            display: 'block',
            position: 'absolute',
            width: `${580 * sidePosition.width}px`,
            x: 580 * sidePosition.left,
            height: '0',
            zIndex: '50',
            y: first ? -180 : 0,
        }}>
            <LightboxLinkedImg imgKey={imgKey} />
        </motion.div>
    );
}

function InlineImage({ imgKey, type }) {

    return (
        <motion.div style={{
            display: 'block',
            width: '85%',
            // borderTop: '4px solid #242626',
            zIndex: '50',
            margin: '80px 0 80px 15%',
        }}>
            
            <LightboxLinkedImg imgKey={imgKey} />
        </motion.div>
    );
    // what types do we want?
    
    // wide (single across 1280px)
    // twoWide (two across 1280px, equal heights, staggered widths)
    // single
    // something that hijacks the scroll for a sec and scrolls sideways to show a filmstrip
    // or parallax images behind the text
}

function InlineImageTypes({ type }) {
    switch (type) {
        case "equalWidths":
            return <></>
        case "equalHeights":
            return <></>
        default:    // full width single
            return <LightboxLinkedImg imgKey={imgKey} />
    }
}