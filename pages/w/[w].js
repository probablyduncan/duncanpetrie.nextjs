import Layout, { HeadData } from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList, Heading1, Heading2, Heading3, CinzelWrapper, LatoWrapper, GaramondWrapper } from "@/components/TextStyles";
import { useContext, useMemo, useRef, useState } from "react";
import { ViewportContext } from "@/pages/_app";
import { BackLink, CardList } from "../world";
import { animate, motion, useScroll } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";
import { colors, getGradientTextCSS, gradients } from "@/data/colors";
import { useRouter } from "next/router";

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

    const router = useRouter();

    const cardListRef = useRef();
    const articleRef = useRef();

    //#region  animations on leaving page
    
    const [exiting, startExiting] = useState(false);
    const { scrollY } = useScroll();
    const toMapAnimation = () => {

        startExiting(true);
        toCardAnimation();

        animate(cardListRef.current, {
            // animation
            textAlign: 'left',
            y: 240,
            x: (window.innerHeight * 0.8) - 70
        }, {
            // options
            duration: 0.2, 
            damping: 20, 
            stiffness: 20
        });

        animate(articleRef.current, {
            // animation
            x: window.innerWidth
        }, {
            // options
            duration: 0.2,
            damping: 20,
            stiffness: 20
        });

        return 200;
    }

    const toCardAnimation = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return Math.min(scrollY.get(), 100);
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

    return !mobile ? (
        <>
            <HeadData title={`${card.frontmatter.title} - Springtide - `} />

            <div style={{
                maxWidth: '100vw',
                display: 'flex',
                flexFlow: 'row nowrap',
                justifyContent: 'space-between',
            }}>


                {viewport.width >= 980 && <div style={{
                    width: '270px',
                    paddingRight: '40px',
                    borderRight: `2px solid ${colors.black}`,
                    height: 'calc(100vh - 70px)',
                    marginTop: '40px',
                }}>
                    <nav ref={cardListRef} style={{
                        margin: '0 0 160px 0',
                    }}>
                        <CardList cardData={cardData} delayAction={toCardAnimation} selected={exiting ? null : card.w} />
                    </nav>
                </div>}


                <div style={{
                    width: '680px',
                    maxWidth: '100%',
                    backgroundColor: colors.white,
                }}>
                    <header style={{
                        margin: '160px 40px 20px',
                        userSelect: 'none'
                    }}>
                        <CinzelWrapper style={{fontSize: '52px', ...getGradientTextCSS(...gradients.mapGreen)}}>{card.frontmatter.title}</CinzelWrapper>
                    </header>
                    <nav style={{
                        padding: '10px 0 10px 40px',
                        borderBottom: `2px solid ${colors.black}`,
                        borderTop: `2px solid ${colors.grey}`,
                        // position: 'sticky',
                        // top: 0,
                        backgroundColor: colors.white,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <LatoWrapper>
                            GRUNK&nbsp;&nbsp;|&nbsp;&nbsp;BUNK&nbsp;&nbsp;|&nbsp;&nbsp;ZUNK
                        </LatoWrapper>
                        <GaramondWrapper>
                            Back to map.
                        </GaramondWrapper>
                    </nav>
                    <article style={{
                        margin: '40px 40px 160px '
                    }}>
                        <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                    </article>
                </div>


                {viewport.width >= 1200 && <div style={{
                    width: '180px',
                }}>
                </div>}


            </div>

            {/* <div style={{
                width: '1280px',
                maxWidth: '95vw',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'stretch', 
                marginTop: '40px',
            }}>

                <nav style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <div style={{
                        margin: '0 0 50vh',
                        textAlign: 'right',
                    }}>
                        <div>
                            <BackLink href="/world/" text="map" delayAction={toMapAnimation} />
                        </div>
                        <div ref={cardListRef} style={{
                            width: '270px',
                            margin: '0 40px -60px',
                            // position: 'sticky',
                            // top: '40px',
                        }}>
                            <CardList cardData={cardData} delayAction={toCardAnimation} selected={exiting ? null : card.w} />
                        </div>
                    </div>
                </nav>

                {!exiting && <motion.div aria-hidden="true" initial={{
                    width: '2px',
                    height: 'calc(100vh - 70px)',
                    top: '40px',
                    backgroundColor: colors.black,
                    position: 'sticky',
                }}></motion.div>}

                <motion.div initial={{ opacity: 0, }} animate={{ opacity: 1 }}>
                    <main ref={articleRef} style={{
                        width: '600px',
                        margin: '200px 60px',
                    }}>
                        <header>
                            <LinkHeading1 pageOnly>{card.frontmatter.title}</LinkHeading1>
                        </header>
                        <article>
                            <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                        </article>
                    </main>
                </motion.div>

            </div> */}
        </>
    ) : (
        <Layout title={card.frontmatter.title ?? card.w ?? "World"} pageName={'back to map'} color={colors.mapGreen} menuLink='/world' menuName={'back to map'}>
            
            <article style={{padding: '120px 25px 0', overflow: 'hidden'}}>
                {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? colors.yellow} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                <Title>{card.frontmatter.title}</Title>
                <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: MobileWorldLink, ul: UnorderedList, blockquote: 'span'}} />
            </article>
        </Layout>
    )
}