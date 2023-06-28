import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, Paragraph, Subtitle, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { useContext, useMemo, useRef, useState } from "react";
import { ViewportContext } from "@/components/Viewport";
import Head from "next/head";
import { BackLink, CardList } from "../world";
import { animate, motion, useScroll } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";
import { useRand } from "@/lib/rand";

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
    const Content = useMemo(() => getMDXComponent(card.code, {Img: WorldImg, ComicSans: ComicSansWrapper}), [card.code]);

    const backLinkRef = useRef();
    const cardListRef = useRef();
    const articleRef = useRef();
    const borderRef = useRef();

    const [exiting, startExiting] = useState(false);
    const { scrollY } = useScroll();
    const toMapAnimation = () => {

        startExiting(true);
        toCardAnimation();

        animate(cardListRef.current, {
            // animation
            textAlign: 'left',
            margin: '240px 40px 180px',
            x: window.innerWidth / 2 + window.innerHeight * 0.8 - cardListRef.current.offsetLeft - 670
        }, {
            // options
            duration: 0.2, 
            damping: 20, 
            stiffness: 20
        });

        animate(articleRef.current, {
            // animation
            x: window.innerWidth * 5/8 + 2
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

    function WorldImg({ imgKey, src, caption }) {
    
        let img = imgKey in imgData ? imgData[imgKey] : {src, caption}
        
        return (<>
            <Img img={img} noBorder />
            {img.caption && <Caption>{img.caption}</Caption>}
        </>);
    }
    
    const WorldLink = ({ children, ...props }) => {
        
        // if card exists or is external, show full link. if card has inProgress, show red link. if card doesn't have a mdx file, just display text
        const valid = props.href.includes('/') || (
            cardData.map(w => w.id).includes(props.href) ? 
                cardData.filter(w => !w.inProgress).map(w => w.id).includes(props.href)
                 : null
            );
        
        const [cursor, setCursor] = useState('🚫');
        const cursors = ['⛔', '🚫', '🚷', '🚳', '📵', '🔞', ];
        // const cursors = ['⚠️', '⚠️', '⚠️', '☢️', '☣️', ];

        switch (valid) {
            case true:
                return (
                    <UnderLonk 
                        delayAction={toCardAnimation} 
                        title={`${cardData.find(w => w.id == props.href)?.title ?? (props.href.charAt(0).toUpperCase() + props.href.slice(1))} ➯`}
                        {...props} 
                    >
                        {children}
                    </UnderLonk>
                );
            case false:
                return (
                    <motion.span 
                        title={'I\'m workin\' on it!'} 
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
                );
            case null:
                return (
                    <span>{children}</span>
                )
        }
        
        return valid ? (
            <UnderLonk 
                delayAction={toCardAnimation} 
                title={`${cardData.find(w => w.id == props.href)?.title ?? (props.href.charAt(0).toUpperCase() + props.href.slice(1))} ➯`}
                {...props} 
            >
                {children}
            </UnderLonk>
        ) : (
            <motion.span 
                title={'I\'m workin\' on it!'} 
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
        );
    }

    return !mobile ? (
        <>
            <Head>
                <title>{`${card.frontmatter.title} - Yon - DuncanPetrie.com`}</title>
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

            <div style={{
                width: '100vw',
                display: 'grid',
                gridTemplateColumns: '3fr 2px 5fr',
                alignItems: 'stretch',
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
                            margin: '40px 40px -60px',
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
                        {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                        <Title style={{marginBottom: '35px'}}>{card.frontmatter.title}</Title>
                        <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                    </article>
                </motion.div>

            </div>
        </>
    ) : (
        <Layout title={card.frontmatter.title ?? card.w ?? "World"} pageName={'back to map'} color='#DBE76F' menuLink='/world' menuName={'back to map'}>
            
            <article style={{padding: '120px 25px 0'}}>
                {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                <Title>{card.frontmatter.title}</Title>
                <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk, ul: UnorderedList}} />
            </article>
        </Layout>
    )
}