import { useContext, useRef } from "react";
import { imgData } from "@/data/images";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { ViewportContext } from "./Viewport";
import { LightboxLinkedImg } from "./Lightbox";
import { ArticleContext } from "@/pages/a/[a]";
import { Caption } from "./TextStyles";
import { getCaption } from "@/lib/imageHelper";

/**
 * @param {string} imgKey for imgData
 * @param {boolean} first styles image as cover 
 * @returns 
 */
export default function ArticleImage({ imgKey, imgKeys, first, type, inlineOptions, sidePosition, mobileOnly, noMobile }) {
    const {mobile} = useContext(ViewportContext);

    const processedImgKeys = (imgKey ? [imgKey] : imgKeys?.split(',') ?? []).filter(k => k in imgData);

    return (processedImgKeys.length > 0 && (
        <div style={{
            display: 'flex', justifyContent: !first ? 'center' : 'flex-start'
        }}>
            {mobile ? 
                (!noMobile && <MobileImage first={first} imgKey={processedImgKeys[0]} />)
            :
                (!first ? 
                    (!mobileOnly && <InlineImage imgKeys={processedImgKeys} type={type} options={inlineOptions} />)
                : 
                    (!mobileOnly && <SideImage first={first} imgKey={processedImgKeys[0]} sidePosition={sidePosition} />)
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

    const { textCentered } = useContext(ArticleContext);

    const { scrollY } = useScroll();
    const x = useTransform(
        scrollY,
        [640, 820],
        [580 * sidePosition.left, 580 * sidePosition.left - (textCentered ? 80 : 0)]
    )
    const springX = useSpring(x, { stiffness: 200, damping: 40 });

    return (
        <motion.div style={{
            display: 'block',
            position: 'absolute',
            width: `${580 * sidePosition.width}px`,
            x: springX,
            height: '0',
            zIndex: '50',
            y: first ? -180 : 0,
        }}>
            <LightboxLinkedImg imgKey={imgKey} />
        </motion.div>
    );
}

function InlineImage({ imgKeys, type, options }) {

    if (!type) {
        return (
            <InlineImageWrapper>
                <LightboxLinkedImg imgKey={imgKeys[0]} noBorder />
            </InlineImageWrapper>
        );
    } else if (type == 'equalWidths') {

        // put captions under the shortest image
        return imgData[imgKeys[0]].ratio > imgData[imgKeys[1]].ratio ? (
                <InlineImageWrapper align={options?.align} margin={`80px 0 calc(80px + ${options?.leftOffset ?? 0}px) 15%`}>
                    <div style={{
                        display: 'flex', 
                        flexFlow: options?.align == 'bottom' ? 'column-reverse' : 'column', 
                        transform: `translateY(${options?.leftOffset ?? 0}px)`,
                    }}>
                        <LightboxLinkedImg 
                            imgKey={imgKeys[0]} 
                            noCaption 
                            noBorder 
                            margin={options?.align == 'bottom' ? '20px 0 0 0' : '0 0 20px 0'} 
                        />
                        <Caption><i>{options?.align == 'bottom' ? 'Below' : 'Top'}:&nbsp;&nbsp;</i>{getCaption(imgData[imgKeys[0]])}</Caption>
                        <Caption><i>Right:&nbsp;&nbsp;</i>{getCaption(imgData[imgKeys[1]])}</Caption>
                    </div>
                    <LightboxLinkedImg imgKey={imgKeys[1]} noCaption noBorder margin={`${options?.rightOffset ?? 0}px 0 0 0`} />
                </InlineImageWrapper>
            ) : (
                <InlineImageWrapper align={options?.align} margin={`80px 0 calc(80px + ${options?.rightOffset ?? 0}px) 15%`}>
                    <LightboxLinkedImg imgKey={imgKeys[0]} noCaption noBorder margin={`0 0 ${options?.leftOffset ?? 0}px 0`} />
                    <div style={{
                        display: 'flex', 
                        flexFlow: options?.align == 'bottom' ? 'column-reverse' : 'column', 
                        transform: `translateY(${options?.rightOffset ?? 0}px)`,
                    }}>
                        <LightboxLinkedImg 
                            imgKey={imgKeys[1]} 
                            noCaption 
                            noBorder 
                            margin={options?.align == 'bottom' ? '20px 0 0 0' : '0 0 20px 0'} 
                        />
                        <Caption textAlign='left'><i>{options?.align == 'bottom' ? 'Below' : 'Top'}:&nbsp;&nbsp;</i>{getCaption(imgData[imgKeys[1]])}</Caption>
                        <Caption textAlign='left'><i>Left:&nbsp;&nbsp;</i>{getCaption(imgData[imgKeys[0]])}</Caption>
                    </div>
                </InlineImageWrapper>
            )
    } else if (type == 'equalHeights') {
        
        return (
            <InlineImageWrapper 
                // get column sizes from image ratios
                columns={imgKeys.map(k => `${imgData[k].ratio}fr`).join(' ')} 
                // get top/bottom margin for wrapper based on offset
                margin={`calc(80px + ${Math.max(0, -1 * (options?.leftOffset ?? 0))}px) 0 calc(80px + ${Math.max(0, options?.leftOffset ?? 0)}px) 15%`} 
            >
                <LightboxLinkedImg 
                    imgKey={imgKeys[0]}
                    noBorder
                    margin={`${options?.leftOffset ?? 0}px 0 0 0`}
                />
                <LightboxLinkedImg 
                    imgKey={imgKeys[1]}
                    noBorder
                />
            </InlineImageWrapper>
        );
    }

    
    // what types do we want?
    
    // wide (single across 1280px)
    // twoWide (two across 1280px, equal heights, staggered widths)
    // single
    // something that hijacks the scroll for a sec and scrolls sideways to show a filmstrip
    // or parallax images behind the text
}

function InlineImageWrapper({ children, width = '85%', margin = '80px 0 80px 15%', align = 'flex-start', columns }) {

    const layout = columns ? {
        display: 'grid',
        gridTemplateColumns: columns
    } : {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: align == 'bottom' ? 'flex-end' : align,
    }

    return (
        <div style={{
            zIndex: '50',
            gap: '30px',
            width,
            margin,
            ...layout
        }}>
            {children}
        </div>
    );
}