import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardData, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, Dept, Paragraph, Subtitle, Title, UnderLonk, LatoWrapper } from "@/components/TextStyles";
import { useContext, useMemo } from "react";
import { ViewportContext } from "@/components/Viewport";
import { useRouter } from 'next/router';
import Lonk from "@/components/Lonk";
import Head from "next/head";
import { CardList } from "../world";
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

    console.log(cardData);

    const { mobile } = useContext(ViewportContext);
    const Content = useMemo(() => getMDXComponent(card.code), [card.code]);

    // const router = useRouter();
    // const { h } = router.query;

    // // previous page
    // const backlink = h?.split(',').at(-1);

    // function WorldLonk({ href, children }) {

    //     const history = [card.w];
    //     if (backlink && backlink != href) history.unshift(backlink);

    //     return (<UnderLonk href={`${href}?h=${history}`}>
    //         {children}
    //     </UnderLonk>)
    // }

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
                maxWidth: '95vw',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
            }}>
                
                <article style={{
                    margin: '240px 80px',
                    width: '500px',
                }}>
                    {card.frontmatter.dept && <Dept color={card.frontmatter.color ?? '#FFBA5E'} style={{marginTop: 0}}>{card.frontmatter.dept.toUpperCase()}</Dept>}
                    <Title>{card.frontmatter.title}</Title>
                    <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk}} />
                </article>

                <nav style={{
                    margin: '40px 0',
                }}>
                    <LatoWrapper div style={{color: imgData.bigmap.color, position: 'fixed', top: '40px', right: 'calc((100vw - 1280px) / 2)'}}>
                        <Lonk href={'/'}>
                            <motion.div whileHover={{x: -10}}>
                                &lt;&nbsp;&nbsp;HOME
                            </motion.div>
                        </Lonk>
                    </LatoWrapper>
                    <nav style={{
                        margin: '240px 0 '
                    }}>
                        <CardList cardData={cardData} />
                    </nav>

                </nav>

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