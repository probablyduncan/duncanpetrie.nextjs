import { getArticle, getArticleIDs } from "@/lib/dataParser";
import { createContext, useContext, useMemo, useRef } from "react";
import { getMDXComponent } from "mdx-bundler/client"
import { ViewportContext } from "@/components/Viewport";
import Layout from "@/components/Layout";
import { Paragraph, Title, Dept, Caption, UnderLonk, Subtitle } from "@/components/TextStyles";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { getColors } from "@/lib/articleHelper";
import ArticleImage from "@/components/ArticleImage";
import Lightbox, { LightboxLink } from "@/components/Lightbox";
import useLightbox from "@/lib/useLightbox";

export async function getStaticPaths() {
    const paths = await getArticleIDs();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps( {params} ) {
    const article = await getArticle(params.a);
    const otherArticles = [];
    return {
        props: {
            article,
            otherArticles
        }
    };
}

/**
 * markdown api:
 * title: 'Capitalized, Please'
 * dept: 'dept. of will be upper case'
 * colors: '#color1,rgb(co,lo,r2)'
 * location: 'Falmouth, Cornwall'
 * date: 'Spring, 2022'
 * tags: 'writing,photography'
 * 
 * cover: 'jubilee'
 * textWidth: '50%'
 * 
 * lightbox: {
 *     tag: 'myth',
 *     shuffle: true,       // defaults to true?
 *     images: 'extra,images,here',
 *     link: true,  // defaults to true?
 * }
 * 
 */

export const ArticleContext = createContext();

export default function ArticleLayout({ article }) {
    
    const Content = useMemo(() => getMDXComponent(article.code, {ArticleImage: ArticleImage, LightboxLink: LightboxLink}), [article.code]);
    const {mobile} = useContext(ViewportContext);

    const [lightbox, lightboxKeys, toggleLightbox] = useLightbox(article.frontmatter.lightbox);

    // get colors from frontmatter
    const colors = getColors(article.frontmatter.colors, [article.frontmatter.cover].concat(lightboxKeys));
    
    // this is the distance between the top of the window and the start of the article
    const topOffset = article.frontmatter.text?.top ?? 300;
    const textWidth = article.frontmatter.text?.width ?? 500;
    const textCentered = !mobile && (article.frontmatter.text?.centered ?? true);

    const { scrollY } = useScroll();
    const springScroll = useSpring(scrollY, { stiffness: 400, damping: 50 });
    const x = useTransform(
        scrollY,
        [500, 700],
        [0, -160]
    );

    const galleryAction = article.frontmatter.lightbox?.link ? () => toggleLightbox(0) : null;

    return (<>
        <Layout 
            color={colors[1]} 
            pageName={article.a} 
            menuName={'all projects'} 
            menuLink={'/i/all'} 
            galleryAction={galleryAction}
            galleryColor={colors[0]} 
            galleryName={article.frontmatter.lightbox?.link}
        >
            <ArticleContext.Provider value={{lightboxKeys, toggleLightbox, topOffset, textCentered, textWidth}}>
                <Lightbox index={lightbox} />
                <motion.div id="articleWrapper" style={{ 
                    display: 'flex', justifyContent: 'flex-end',
                    margin: mobile ? '0 20px ' : `0 calc(50% - ${textWidth}px) 0 0`, 
                    paddingTop: mobile ? '25px' : 'inherit',
                    x
                }}>
                    <div id="articleContainer" style={{ 
                        width: `${textWidth}px`,
                        margin: mobile ? '0' : `${topOffset}px 0 20vh 0`,
                    }}>
                        <ArticleImage imgKey={article.frontmatter.cover ?? lightboxKeys[0]} first />
                        <Dept color={colors[0]}>
                            {article.frontmatter.dept.toUpperCase()}
                        </Dept>
                        <Title>
                            {article.frontmatter.title}
                        </Title>
                        <article>
                            <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk}} />
                        </article>
                        <Caption>
                            {'location' in article.frontmatter && <><br />{article.frontmatter.location}.</>}
                            {'date' in article.frontmatter && <><br />{article.frontmatter.date}.</>}
                        </Caption>
                    </div>
                </motion.div>
            </ArticleContext.Provider>
        </Layout>
    </>);
}

