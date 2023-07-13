import { useContext, useRef } from "react";
import { imgData } from "@/data/images";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { ViewportContext } from "@/pages/_app";
import { LightboxLinkedImg, LightboxLinkedSlideshow } from "./Lightbox";
import { ArticleContext } from "@/pages/a/[a]";
import { Caption } from "./TextStyles";
import { getCaption } from "@/lib/imageHelper";

/**
 * @param {string} imgKey for imgData
 * @param {boolean} first styles image as cover 
 * @returns 
 */
export default function ArticleImage({ imgKey, imgKeys, first, type, inlineOptions = {}, sidePosition, mobileOnly, noMobile, sticky, noCaptions, slideOnScroll }) {
    const {mobile} = useContext(ViewportContext);
    
    const processedImgKeys = (imgKey ? [imgKey] : imgKeys?.split(',') ?? []).filter(k => k in imgData);

    // for cover
    const stickyStyle = first && sticky ? {position: 'sticky', top: '300px'} : {};

    // put override captions param into options
    if (mobile) {
        inlineOptions.noCaptions = false;
    }
    else if (noCaptions) {
        inlineOptions.noCaptions = true;
    }

    return (processedImgKeys.length > 0 && (
        <div style={{
            display: 'flex', justifyContent: (first || type == 'side') ? 'flex-start' : 'center', ...stickyStyle
        }}>
            {mobile ? 
                (!noMobile && <MobileImage first={first} imgKey={processedImgKeys[0]} noCaptions={!mobile && noCaptions} />)
            :
                (first || type == 'side' ? 
                    (!mobileOnly && <SideImage first={first} imgKeys={processedImgKeys} sidePosition={sidePosition} noCaptions={!mobile && noCaptions} slideOnScroll={first && slideOnScroll} />)
                :
                    (!mobileOnly && <InlineImage imgKeys={processedImgKeys} type={type} options={inlineOptions} />)
                )
            }
        </div>
    ));
}

function MobileImage({ imgKey, first, noCaptions }) {

    return (
        <div style={{
            padding: first ? '0' : '50px 0',
        }}>
            <LightboxLinkedImg imgKey={imgKey} noCaptions={noCaptions} />
        </div>
    );
}

function SideImage({ imgKeys, first, sidePosition = {width: 1, left: 0}, noCaptions, slideOnScroll }) {

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
            y: -180,
        }}>
            {imgKeys.length > 1 ? 
                <LightboxLinkedSlideshow imgKeys={imgKeys} noCaptions={noCaptions} slideOnScroll={slideOnScroll} /> 
            : 
                <LightboxLinkedImg imgKey={imgKeys[0]} noCaptions={noCaptions} />}
        </motion.div>
    );
}

function InlineImage({ imgKeys, type, options }) {

    if (!type || type == 'slideshow') {
        return (
            <InlineImageWrapper width={options?.width ?? '65%'}>
                {imgKeys.length > 1 ?
                    <LightboxLinkedSlideshow imgKeys={imgKeys} noBorder restrictHeight={options?.restrictHeight ?? true} noCaptions={options.noCaptions} />
                :
                    <LightboxLinkedImg imgKey={imgKeys[0]} noBorder restrictHeight={options?.restrictHeight ?? true} noCaptions={options.noCaptions} />

                }
            </InlineImageWrapper>
        );
    } else if (type == 'equalWidths') {

        const captions = [getCaption(imgData[imgKeys[0]]), getCaption(imgData[imgKeys[1]])];

        // put captions under the shortest image
        return imgData[imgKeys[0]].ratio > imgData[imgKeys[1]].ratio ? (
                <InlineImageWrapper 
                    width={options?.width ?? '100%'} 
                    align={options?.align} 
                    margin={`80px 0 calc(80px + ${Math.max(options?.leftOffset ?? 0, 0)}px) 15%`}
                >
                    <div style={{
                        display: 'flex', 
                        flexFlow: options?.align == 'bottom' ? 'column-reverse' : 'column', 
                        transform: `translateY(${options?.leftOffset ?? 0}px)`,
                        width: `calc(50% - ${IMAGE_GAP / 2}px)`,
                    }}>
                        <LightboxLinkedImg 
                            imgKey={imgKeys[0]} 
                            noCaptions 
                            noBorder 
                            margin={options?.align == 'bottom' ? '20px 0 0 0' : '0 0 8px 0'} 
                        />
                        {!options?.noCaptions && <>
                            {captions[0] && <Caption><i>{options?.align == 'bottom' ? 'Below' : 'Top'}:&nbsp;&nbsp;</i>{captions[0]}</Caption>}
                            {captions[1] && <Caption><i>Right:&nbsp;&nbsp;</i>{captions[1]}</Caption>}
                        </>}
                    </div>
                    <LightboxLinkedImg imgKey={imgKeys[1]} noCaptions noBorder margin={`${options?.rightOffset ?? 0}px 0 0 0`} width={`calc(50% - ${IMAGE_GAP / 2}px)`} />
                </InlineImageWrapper>
            ) : (
                <InlineImageWrapper 
                    width={options?.width ?? '100%'}
                    align={options?.align} 
                    margin={`80px 0 calc(80px + ${Math.max(options?.rightOffset ?? 0, 0)}px) 15%`}
                >
                    <LightboxLinkedImg imgKey={imgKeys[0]} noCaptions noBorder margin={`0 0 ${options?.leftOffset ?? 0}px 0`} width={`calc(50% - ${IMAGE_GAP / 2}px)`} />
                    <div style={{
                        display: 'flex', 
                        flexFlow: options?.align == 'bottom' ? 'column-reverse' : 'column', 
                        transform: `translateY(${options?.rightOffset ?? 0}px)`,
                        width: `calc(50% - ${IMAGE_GAP / 2}px)`,
                    }}>
                        <LightboxLinkedImg 
                            imgKey={imgKeys[1]} 
                            noCaptions 
                            noBorder 
                            margin={options?.align == 'bottom' ? '20px 0 0 0' : '0 0 8px 0'} 
                        />
                        {!options?.noCaptions && <>
                            {captions[1] && <Caption textAlign='left'><i>{options?.align == 'bottom' ? 'Below' : 'Top'}:&nbsp;&nbsp;</i>{captions[1]}</Caption>}
                            {captions[0] && <Caption textAlign='left'><i>Left:&nbsp;&nbsp;</i>{captions[0]}</Caption>}
                        </>}
                    </div>
                </InlineImageWrapper>
            )
    } else if (type == 'equalHeights') {
        
        return (
            <InlineImageWrapper 
                width={options?.width ?? '100%'}
                // get column sizes from image ratios
                columns={imgKeys.map(k => `${imgData[k].ratio}fr`).join(' ')} 
                // get top/bottom margin for wrapper based on offset
                margin={`calc(80px + ${Math.max(0, -1 * (options?.leftOffset ?? ((options?.rightOffset ?? 0) * -1)))}px) 0 calc(80px) 15%`} 
            >
                <LightboxLinkedImg 
                    imgKey={imgKeys[0]}
                    noBorder
                    margin={`${options?.leftOffset ?? ((options?.rightOffset ?? 0) * -1)}px 0 0 0`}
                    noCaptions={options?.noCaptions}
                />
                <LightboxLinkedImg 
                    imgKey={imgKeys[1]}
                    noBorder
                    noCaptions={options?.noCaptions}
                />
            </InlineImageWrapper>
        );
    } else if (type == 'filmstrip') {

        return (
            <InlineImageWrapper>
                <Filmstrip imgKeys={imgKeys} options={options} />
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

const IMAGE_GAP = 28;

function InlineImageWrapper({ children, width = '85%', margin = '80px 0 80px 15%', align = 'flex-start', columns }) {

    const layout = columns ? {
        display: 'grid',
        gridTemplateColumns: columns
    } : {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: align == 'bottom' ? 'flex-end' : align,
    }

    return (
        <div style={{
            zIndex: '50',
            gap: `${IMAGE_GAP}px`,
            width,
            margin,
            ...layout
        }}>
            {children}
        </div>
    );
}

function Filmstrip({ imgKeys, options }) {

    const filmstripRef = useRef();


    // get sum of image widths for the height, plus gaps
    const height = options?.height ?? 400; 
    const totalWidth = imgKeys.reduce((sum, imgKey) => sum + height * imgData[imgKey].ratio + IMAGE_GAP, -1 * IMAGE_GAP);

    const {scrollYProgress} = useScroll({
        target: filmstripRef,
        offset: ["end end", "start start"]
    });
    const filmstripScroll = useTransform(
        scrollYProgress,
        [0.3, 0.8],
        [0, height * imgData[imgKeys[0]].ratio - totalWidth],
        // { clamp: false }
    )
    // const springFilmstripScroll = useSpring(filmstripScroll, { stiffness: 800, damping: 120 });

    return (
        <motion.div ref={filmstripRef} style={{
            width: `${totalWidth}px`,
            // height: `${height}px`,
            display: 'flex',
            flexFlow: 'row nowrap',
            gap: `${IMAGE_GAP}px`,
            flexShrink: 0,
            x: filmstripScroll,
        }}>
            {imgKeys.map((imgKey, i) => 
                <div key={`${imgKey}-${i}`} style={{
                    width: `${imgData[imgKey].ratio * height}px`,
                    marginTop: options?.stagger && i % 2 ? '0' : '30px',
                }}>
                    <LightboxLinkedImg imgKey={imgKey} restrictHeight noBorder noCaptions={options?.noCaptions ?? false} />
                </div>
            )}
        </motion.div>
    );
}