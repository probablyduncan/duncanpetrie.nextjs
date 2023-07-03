import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList, Heading1, Heading2, Heading3 } from "@/components/TextStyles";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "@/components/Viewport";
import Head from "next/head";
import { BackLink, CardList } from "../world";
import { animate, motion, useScroll } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";
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

    const { mobile } = useContext(ViewportContext);
    const Content = useMemo(() => getMDXComponent(card.code, {Img: WorldImg, ComicSans: ComicSansWrapper}), [WorldImg, card.code]);

    const backLinkRef = useRef();
    const cardListRef = useRef();
    const articleRef = useRef();
    const borderRef = useRef();

    //#region  *currently disabled*  flash selected header on page load
    // const router = useRouter();
    // useEffect(() => {
        
    //     const e = document.getElementById(router.asPath.split('#').at(-1))?.children[0];
    //     if (e) {
    //         e.style.borderRadius = '5px';
    //         e.style.padding = '2px 4px';
    //         e.style.margin = '-4px -6px';
    //         e.style.border = '2px solid ${imgData.bigmap.color}';
    //         animate(e, {border: [null, `2px solid ${imgData.bigmap.color}`, '2px solid #fff']}, {duration: 2});
    //     }

    // }, [router.asPath])
    //#endregion

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
        return (
            a.href.startsWith('#') || a.href.endsWith('#')) ? 
                a.href.replace('#', `#${a.text.replace(' ', '-')}#`).replace(/^#|#$/, '') 
            : 
                (a.href || a.text.replace(' ', '')
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

        return href.includes('/') || cardData.map(w => w.id).includes(page)  ? (
            // should be displayed in full
            <UnderLonk 
                delayAction={toCardAnimation} 
                title={`${cardData.find(w => w.id == page)?.title ?? (page.charAt(0).toUpperCase() + page.slice(1))} ➯`}
                href={href}
            >
                {children}
            </UnderLonk>
        ) : (
            // under construction
            <motion.span 
                title={'I\'m still workin\' on it!'} 
                whileHover={{color: '#e83d3f'}}
                onMouseLeave={() => setCursor(cursors[Math.floor(Math.random() * cursors.length)])}
                style={{
                    color: '#eeac3f' ?? 'darksalmon', 
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
        return href.includes('/') || cardData.filter(w => !w.inProgress).map(w => w.id).includes(page) ? 
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
            <Head>
                <title>{`${card.frontmatter.title} - World - DuncanPetrie.com`}</title>
                <meta name="author" content="Duncan Petrie" />
                <meta name="description" content="Abstract/Impressionist Photography | On the hunt for plants and birds and rocks and things" />
                <meta name="keywords" content="Duncan, Petrie, Photography, Abstract, Impressionist, Impressionism, Wildlife, Wisconsin, Milwaukee, Falmouth, Lake Michigan, water, blur, icm, intentional, camera, movement, probablyduncan" />

                <link rel="icon" href="/favicon-32.png" sizes="32x32" />
                <link rel="icon" href="/favicon-128.png" sizes="128x128" />
                <link rel="icon" href="/favicon-180.png" sizes="180x180" />
                <link rel="icon" href="/favicon-192.png" sizes="192x192" />
                
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main style={{
                width: '1280px',
                maxWidth: '95vw',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'stretch', 
                marginTop: '40px',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <nav style={{
                        margin: '0 0 50vh',
                        textAlign: 'right',
                    }}>
                        <div ref={backLinkRef}>
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
                    </nav>
                </div>

                {/* middle border */}
                {!exiting && <motion.div ref={borderRef} initial={{
                    width: '2px',
                    height: 'calc(100vh - 70px)',
                    top: '40px',
                    backgroundColor: '#242626',
                    position: 'sticky',
                }}></motion.div>}

                <motion.div initial={{ opacity: 0, }} animate={{ opacity: 1 }}>
                    <article ref={articleRef} style={{
                        width: '500px',
                        margin: '200px 60px',
                    }}>
                        <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept?.toUpperCase()}&nbsp;</Dept>
                        <LinkHeading1 pageOnly>{card.frontmatter.title}</LinkHeading1>
                        <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                    </article>
                </motion.div>

            </main>
        </>
    ) : (
        <Layout title={card.frontmatter.title ?? card.w ?? "World"} pageName={'back to map'} color='#DBE76F' menuLink='/world' menuName={'back to map'}>
            
            <article style={{padding: '120px 25px 0', overflow: 'hidden'}}>
                {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                <Title>{card.frontmatter.title}</Title>
                <Content components={{h1: Heading1, h2: Heading2, h3: Heading3, h4: Caption, p: Paragraph, a: MobileWorldLink, ul: UnorderedList, blockquote: 'span'}} />
            </article>
        </Layout>
    )
}