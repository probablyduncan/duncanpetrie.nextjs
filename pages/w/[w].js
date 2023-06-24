import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, Dept, Paragraph, Subtitle, Title, UnderLonk } from "@/components/TextStyles";
import { useContext, useMemo, useRef } from "react";
import { ViewportContext } from "@/components/Viewport";
import Head from "next/head";
import { BackLink, CardList } from "../world";
import { motion } from "framer-motion";
import { imgData } from "@/data/images";

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
    const Content = useMemo(() => getMDXComponent(card.code), [card.code]);

    const backLinkRef = useRef();
    const cardListRef = useRef();
    const articleRef = useRef();

    const toMapAnimation = () => {
        return 200;
    }

    const toCardAnimation = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return 100;
    }

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
                gridTemplateColumns: '5fr 2px 8fr',
                alignItems: 'stretch',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <nav style={{
                        margin: '240px 0 40px 0',
                        textAlign: 'right'
                    }}>
                        <div ref={backLinkRef}>
                            <BackLink href="/world/" text="map" delayAction={toMapAnimation} />
                        </div>
                        <div ref={cardListRef} style={{
                            position: 'sticky',
                            top: '40px',
                            margin: '40px 40px 40px 0',
                        }}>
                            <CardList cardData={cardData} delayAction={toCardAnimation} />
                        </div>
                    </nav>
                </div>

                {/* middle border */}
                <div style={{
                    width: '2px',
                    height: 'calc(100vh - 70px)',
                    top: '40px',
                    backgroundColor: '#242626',
                    position: 'sticky',
                }}></div>

                <div style={{
                }}>
                    <article ref={articleRef} style={{
                        width: '500px',
                        margin: '240px 60px',
                    }}>
                        {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                        <Title>{card.frontmatter.title}</Title>
                        <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk}} />
                    </article>
                </div>

            </div>
        </>
    ) : (
        <Layout title={card.frontmatter.title ?? card.w ?? "World"} pageName={'back to map'} color='#DBE76F' menuLink='/world' menuName={'back to map'}>
            
            <article style={{padding: '120px 25px 0'}}>
                {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                <Title>{card.frontmatter.title}</Title>
                <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk}} />
            </article>
        </Layout>
    )
}