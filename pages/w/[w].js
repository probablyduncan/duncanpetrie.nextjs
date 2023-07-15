import Layout, { HeadData } from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList, Heading1, Heading2, Heading3, CinzelWrapper, LatoWrapper, GaramondWrapper } from "@/components/TextStyles";
import { useContext, useMemo, useRef, useState } from "react";
import { ViewportContext } from "@/pages/_app";
import { animate, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";
import { colors, getGradientTextCSS, gradients } from "@/data/colors";
import { useRouter } from "next/router";
import { CardList, WorldMenu } from "@/components/WorldComponents";

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
    
    const gradient = useMemo(() => {
        const grads = Object.keys(gradients);
        return gradients[grads[Math.floor(grads.length * Math.random())]];
    }, [])

    const router = useRouter();

    const cardListRef = useRef();
    const articleRef = useRef();

    //#region  animations on leaving page
    
    const [exiting, startExiting] = useState(false);
    const { scrollY } = useScroll();
    const toMapAnimation = () => {

        startExiting(true);
        toCardAnimation();

        return 0;
    }

    const toCardAnimation = () => {
        const scroll = Math.min(scrollY.get(), 100)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return scroll;
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
            width: mobile ? '100%' : 'calc(100% + 80px)'
        }}>
            <Img img={img} noBorder />
            {img.caption && <Caption textAlign={'left'}>{img.caption}</Caption>}
        </div>);
    }

    //#endregion

    // scale title on scroll
    const titleY = useTransform(scrollY, [0, 300], [0, -80,]);

    return (<>
        <HeadData title={`${card.w} - Springtide - `} />

        <div style={{
            width: 'calc(100vw - 40px)',
            display: 'flex',
            flexFlow: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'stretch',
        }}>

            {/* nav links */}
            {viewport.width >= 600 && <div>
                <motion.nav style={{
                    width: 270,
                    margin: '40px 40px 0 0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    position: 'sticky', top: 40
                }}>
                        <WorldMenu cardData={cardData} />
                </motion.nav>
            </div>}

            <main style={{
                width: 600,
            }}>
                    <motion.header style={{
                        position: 'fixed', top: -5, left: 0,
                        width: 'calc(100vw)', textAlign: 'center',
                        fontSize: 60, lineHeight: '150%',
                        zIndex: 0, userSelect: 'none',
                        y: titleY,
                    }}>
                        <CinzelWrapper style={{...getGradientTextCSS(...gradient),}}>{card.frontmatter.title}</CinzelWrapper>
                    </motion.header>

                <article style={{
                    margin: '300px 0',
                }}>
                    <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                </article>

            </main>

            <div style={{
                display: 'flex',
                flexFlow: 'column',
                margin: '40px 0 300px 40px',
                width: 270,
            }}>
                <CardList cardData={cardData} delayAction={toCardAnimation} selected={exiting ? null : card.w} />
            </div>


        </div>

    </>);
}