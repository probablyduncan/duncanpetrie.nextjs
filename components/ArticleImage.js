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
export default function ArticleImage({ imgKey, first }) {
    const {textCentered} = useContext(ArticleContext);
    const {mobile} = useContext(ViewportContext);
    const ref = useRef();

    const inView = useInView(ref, {once: true, margin: '0px 0px -100px 0px'});
    // opacity: isInView ? 1 : 0, transition: 'opacity 0.5s',

    return (imgKey in imgData && (
        <div ref={ref} style={{opacity: inView ? 1 : 0, transition: 'opacity 0.5s'}}>
            {mobile ? 
                <MobileImage first={first} imgKey={imgKey} />
            :
                (textCentered && !first ? 
                    <InlineImage />
                : 
                    <SideImage first={first} imgKey={imgKey} />
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

function SideImage({ imgKey, first }) {

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
            width: 'calc(50% - 60px)',
            height: '0',
            zIndex: '50',
            x: -640,
            y,
        }}>
            <LightboxLinkedImg imgKey={imgKey} />
        </motion.div>
    );
}

function InlineImage({ imgKey }) {

    return (<div></div>);
    // what types do we want?
    
    // wide (single across 1280px)
    // twoWide (two across 1280px, equal heights, staggered widths)
    // single
    // something that hijacks the scroll for a sec and scrolls sideways to show a filmstrip
    // or parallax images behind the text
}