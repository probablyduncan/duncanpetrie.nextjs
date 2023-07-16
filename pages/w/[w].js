import Layout, { HeadData } from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList, Heading1, Heading2, Heading3, CinzelWrapper, LatoWrapper, GaramondWrapper } from "@/components/TextStyles";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "@/pages/_app";
import { animate, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";
import { addOpacity, colors, getGradientBackgroundCSS, lightGradients } from "@/data/colors";
import { CardList, WorldMenu } from "@/components/WorldComponents";
import Lonk from "@/components/Lonk";
import { MobileNav } from "@/components/Navbar";
import { capitalize, processWorldCardGroups } from "@/lib/worldHelper";

export async function getStaticPaths() {
    const paths = await getWorldCardIDs();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps( {params} ) {
    const card = await getWorldCard(params.w);
    const cardData = await getWorldCardData();

    return {
        props: {
            card,
            cardData,
        }
    };
}

export default function World({ card, cardData }) {

    const { mobile, viewport } = useContext(ViewportContext);
    const Content = useMemo(() => getMDXComponent(card.code, {Img: WorldImg, ComicSans: ComicSansWrapper}), [card.code]);

    //#region  animations on leaving page
    
    const [exiting, startExiting] = useState(false);
    const { scrollY } = useScroll();
    const toCardAnimation = () => {

        const scroll = Math.min(scrollY.get(), 100)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return scroll;
    }

    const toMapAnimation = () => {

        startExiting(true);
        return toCardAnimation();
    }

    //#endregion

    //#region world link and world image stuff

    const processWorldLinkHref = (text = '', href = '') => {
        
        const a = {text: text.toLowerCase(), href: href};

        // if no href is supplied, infer from link text
        // this defaults to link text, uses link href if exists, and processes # in href with link text accordingly
        
        return href == '#' ? 
            `${card.w}#${text?.toLowerCase().replaceAll(' ', '-')}` // if the link is just '#', then use text as #heading link on this page
        :(
            a.href.startsWith('#') || a.href.endsWith('#')) ? 
                a.href.replace('#', `#${a.text?.toLowerCase().replaceAll(' ', '-')}#`).replace(/^#|#$/, '') 
            : 
                (a.href || a.text?.toLowerCase().replace(' ', '')
        );
    }

    /**
     * This is for only showing a link to another world card if it has a corresponding mdx file
     */
    const WorldLink = ({ children, ...props }) => {

        // https://emojipedia.org/
        const cursors = [ '⛔', '🚫', '🚷', '🚳', '📵', '☣️', '☢️', '⚠️', '😡', '😬', '😲', ];
        const [cursor, setCursor] = useState('🚫');

        if (viewport.width < 600) return (<MobileWorldLink {...props}>{children}</MobileWorldLink>);

        const href = processWorldLinkHref(children, props.href);
        const page = href.split('#')[0];

        // if this is a link to another header on this page, no need to do card animation
        const isSamePage = card.w == page;

        return href.includes('/') || cardData.map(w => w.id).includes(page)  ? (
            // should be displayed in full
            <UnderLonk 
                delayAction={() => {if (!isSamePage) toCardAnimation()}} 
                title={`${cardData.find(w => w.id == page)?.title ?? (page.charAt(0).toUpperCase() + page.slice(1))} ➯`}
                href={href}
            >
                {children}
            </UnderLonk>
        ) : (
            // under construction
            <motion.span 
                title={'I\'m still workin\' on it!'} 
                whileHover={{color: colors.errorRed}}
                onMouseLeave={() => setCursor(cursors[Math.floor(Math.random() * cursors.length)])}
                style={{
                    color: colors.errorYellow, 
                    // https://www.emojicursor.app/ custom cursor
                    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>${cursor}</text></svg>") 16 16,auto`,
                }}
            >
                {children}
            </motion.span>
        )
    }

    /**
     * This is for only showing a link to another world card if it has a corresponding mdx file
     */
    const MobileWorldLink = ({ children, ...props }) => {
        const href = processWorldLinkHref(children, props.href);
        const page = href.split('#')[0];
        return href.includes('/') || cardData.map(w => w.id).includes(page) ? 
            <UnderLonk href={href}>{children}</UnderLonk>
        : 
            <>{children}</>
    };

    /**
     * this just adds the caption to the bottom of the image
     */
    function WorldImg({ imgKey, src, caption }) {
    
        let img = imgKey in imgData ? imgData[imgKey] : {src, caption}
        
        return (<div style={{
            margin: '40px 0',
        }}>
            <Img img={img} noBorder />
            {img.caption && <Caption textAlign={'left'}>{img.caption}</Caption>}
        </div>);
    }

    //#endregion

    // <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
    // <CardList cardData={cardData} delayAction={toCardAnimation} selected={exiting ? null : card.w} />

    const tempRelatedList = processWorldCardGroups(card.frontmatter)?.map(g => ({
        title: g.groupIsParentID ? cardData.find(w => w.id == g.group)?.title ?? null : capitalize(g.group),
        isCardLink: g.groupIsParentID,
        id: g.group,
    })) ?? [];

    const filter = (category) => {console.log(`filtering ${category}`)};

    // breakpoints
    const wide = viewport.width >= 1200;
    const normal = viewport.width >= 900;
    const textWidth = viewport.width > 1080 ? 600 : 500;

    return (<>
        <HeadData title={`${card.w} - Springtide - `} />

        {/* page wrapper */}
        <div style={{
            display: 'flex',
            flexFlow: 'row-reverse',
            width: '95vw',
            justifyContent: normal ? 'space-between' : 'center'
        }}>

            {/* side links container */}
            {normal && <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                margin: '0 0 0 40px',
                width: `calc(45vw - ${textWidth / 2}px)`,
            }}>
                <span style={{
                    position: 'sticky',
                    top: 0,
                }}>
                    <WorldMenu cardData={cardData} />
                </span>
            </div>}

            {/* article container */}
            <div style={{
                width: 600,
                maxWidth: '90vw',
                marginTop: normal ? 200 : 100,
                marginLeft: !wide && normal ? '20px' : 'inherit',
            }}>
                <header style={{
                    display: 'flex',
                    width: '100%',
                    flexFlow: !normal ? 'column-reverse' : 'column',
                }}>
                    <Title style={{fontSize: 48, margin: `0 0 8px`, lineHeight: '140%'}}>{card.frontmatter.title}</Title>
                    <GaramondWrapper>
                        <motion.nav style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            borderBottom: normal ? `2px solid ${colors.grey}` : 'none',
                        }}>

                            {/* related buttons container */}
                            {normal && <div style={{
                                display: 'flex',
                                flexFlow: 'row wrap',
                                marginBottom: '20px',
                            }}>
                                {tempRelatedList.map((tag, i) => {

                                    const StyleSpan = ({ children }) => (
                                        <motion.div style={{
                                            ...getGradientBackgroundCSS(...lightGradients[i % lightGradients.length]),
                                            color: colors.slate,
                                            fontSize: 15,
                                            fontWeight: 'bold',
                                            display: 'block',
                                            borderRadius: '20px',
                                            padding: '6px 13px 6px 14px',
                                            // margin: '-3px',
                                            boxShadow: `inset 6px 6px 0px ${addOpacity(colors.black)}`, 
                                            // border: `3px solid ${colors.white}`,
                                            userSelect: 'none',
                                        }} whileHover={{
                                            // border: `3px solid ${colors.slate}`,
                                            boxShadow: `inset 0px 0px 0px ${addOpacity(colors.black)}`,
                                        }}>
                                            {children}
                                        </motion.div>
                                    );

                                    if (tag.title) return (

                                        <div key={tag.title} style={{margin: '0 12px 0 0'}}>
                                            <Lonk href={tag.isCardLink ? `/w/${tag.id}` : `/w/${card.w}?filter=${tag.id}`}>
                                                <StyleSpan>{tag.title}.</StyleSpan>
                                            </Lonk>
                                        </div>

                                    );
                                })}
                            </div>}

                            {/* back to home container */}

                        </motion.nav>
                    </GaramondWrapper>
                </header>

                {/* article container */}
                <article style={{
                    margin: normal ? '80px 0 40vh' : '40px 0 120px',
                    maxWidth: '90vw',
                }}>
                    <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                </article>

            </div>

            {/* card list container */}
            {wide && <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                textAlign: 'left',
                marginRight: '40px',
                width: `calc(45vw - ${textWidth / 2}px)`,
                direction: 'rtl',
            }}>
                <div style={{
                    position: 'sticky',
                    top: 40,
                    maxHeight:  'calc(100vh - 40px)',
                    overflowY: 'scroll',
                    marginTop: '40px',
                    padding: '0 40px',
                }}>
                    <CardList cardData={cardData} delayAction={toCardAnimation} selected={exiting ? null : card.w} />
                </div>
            </div>}

        </div>

        {!normal && <MobileNav pageName={'map'} menuLink={'/world'} color={colors.mapGreen} fullWidth />}

    </>);
}