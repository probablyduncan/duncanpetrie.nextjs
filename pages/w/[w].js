import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, ComicSansWrapper, Dept, Paragraph, Subtitle, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { useContext, useMemo, useRef } from "react";
import { ViewportContext } from "@/components/Viewport";
import Head from "next/head";
import { BackLink, CardList } from "../world";
import { animate, motion, useScroll } from "framer-motion";
import { imgData } from "@/data/images";
import Img from "@/components/Img";

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

    const toMapAnimation = () => {

        window.scrollTo({ top: 0, behavior: 'smooth' });

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

        animate(borderRef.current, { display: 'none' });

        return 200;
    }

    const { scrollY } = useScroll();

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
    
    const WorldLink = ({ children, ...props }) => (<UnderLonk delayAction={toCardAnimation} {...props}>{children}</UnderLonk>);

    return !mobile ? (
        <>
            <Head>
                <title>{`${card.frontmatter.title ?? card.w ?? "World"} - DuncanPetrie.com`}</title>
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
                    justifyContent: 'flex-end'
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
                            position: 'sticky',
                            top: '40px',
                        }}>
                            <CardList cardData={cardData} delayAction={toCardAnimation} selected={card.w} />
                        </div>
                    </nav>
                </div>

                {/* middle border */}
                <motion.div ref={borderRef} initial={{
                    width: '2px',
                    height: 'calc(100vh - 70px)',
                    top: '40px',
                    backgroundColor: '#242626',
                    position: 'sticky',
                }}></motion.div>

                <div style={{
                }}>
                    <article ref={articleRef} style={{
                        width: '500px',
                        margin: '200px 60px',
                    }}>
                        {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                        <Title>{card.frontmatter.title}</Title>
                        <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: WorldLink, ul: UnorderedList}} />
                    </article>
                </div>

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