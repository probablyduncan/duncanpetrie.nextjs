import Layout from "@/components/Layout";
import { useRouter } from 'next/router';
import { imgData } from "@/data/images";
import { getArticleData } from "@/lib/dataParser";
import Lonk from "@/components/Lonk";
import shuffle from "@/lib/shuffle";
import { Dept, Title } from "@/components/TextStyles";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Img from "@/components/Img";
import { ViewportContext } from "@/pages/_app";
import { colors } from "@/data/colors";

export async function getStaticProps() {
    
    const articleData = await getArticleData();

    return {
        props:
            {articleData}
    };
}

export async function getStaticPaths() {

    const paths = ['photography', 'writing', 'films', 'all']
    
    return {
        paths: paths.map(p => {return {params: { i: p}}}),
        fallback: false
    };
}

const extraLinks = [
    {
        id: 'wiki',
        title: 'The Triumph of the Commons',
        dept: 'dept. of rabbit holes',
        link: 'https://youtu.be/JRXZAaDxGCQ',
        cover: {images: 'cover_wiki'},
        tags: ['films'],
    },
    {
        id: 'world',
        title: 'Charting the Wilds',
        dept: 'mind map',
        tags: ['writing','world'],
        link: '/world',
        cover: {images: 'bigmap'},
    },
    {
        id: 'stars',
        title: 'A Necklace of Stars',
        dept: 'springtide',
        link: '/w/stars',
        tags: ['writing','world'],
        cover: {images: 'heartland6'},
    },
    // {
    //     id: 'zigglewomping',
    //     title: 'Zigglewomping',
    //     dept: 'springtide',
    //     link: '/w/zigglewomping',
    //     tags: ['writing', 'world'],
    //     cover: {images: 'heartland7'},
    // },
    {
        id: 'baron',
        title: 'The Baron of Inselberg',
        dept: 'springtide',
        link: '/w/baron',
        tags: ['writing', 'world'],
        cover: {images: 'aboutcv'},
    },
    {
        id: 'wander',
        title: 'Something about Wandering',
        dept: 'springtide',
        link: '/w/wander',
        tags: ['writing', 'world'],
        cover: {images: 'heartland26'},
    }
]

export default function Index({ articleData }) {

    const { mobile } = useContext(ViewportContext);

    const router = useRouter();
    const { i } = router.query;

    const [articlesState, setArticlesState] = useState([]);
    useEffect(() => {

        const tempArticles = articleData.concat(extraLinks).filter(a => i == 'all' || a.tags?.includes(i));
        shuffle(tempArticles);

        let tempArticleGroups = [tempArticles];
        if (!mobile) {
            tempArticleGroups = [
                tempArticles.splice(0, tempArticles.length/3), 
                tempArticles.splice(0, tempArticles.length/2), 
                tempArticles,
            ];
        }

        setArticlesState(tempArticleGroups);

    }, [articleData, i, mobile, setArticlesState]);
    const articles = useMemo(() => articlesState, [articlesState]);

    return(<Layout title='Index' pageName={i == 'all' ? 'all projects' : i} menuName='all projects' menuLink='/i/all' color={'green'}>
        <div 
            style={{display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: '18px', margin: mobile ? '0 0 120px 0' : '120px 0 20vh 0'}}
        >
            {articles.map((ag, ig) =>
                <div key={`group${ig}`} style={{display: 'flex', flexFlow: 'column nowrap', marginTop: mobile ? '25px' : `${((ig + 2) % 3) * 240}px`}}>
                    {ag.map((a, i) => <IndexCard article={a} key={`${i}-${a.title}`} first={i == 0} />)}
                </div>
            )}
        </div>
    </Layout>)
}

function IndexCard({ article, first }) {
    
    const { mobile } = useContext(ViewportContext);

    const ref = useRef();

    // create a random number and store it in memo
    const [randState, setRandState] = useState(0.5);
    useEffect(() => setRandState(Math.random()), []);
    const rand = useMemo(() => randState, [randState]);

    const imageKey = article.indexImages ? article.indexImages[Math.floor(article.indexImages.length * rand)] : (article.cover?.images.split(',')[Math.floor(article.cover?.images.split(',').length * rand)] ?? null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const springScrollProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 50 });

    const y = useTransform(
        springScrollProgress,
        [0, 1],
        [0, mobile ? 0 : rand * 300]
    )

    const isInView = useInView(ref, {once: true});

    return(
        <motion.div ref={ref} style={{
            width: mobile ? '100%' : '80%',
            marginLeft: mobile ? '0' : `${20 * rand}%`,
            breakInside: 'avoid',
            userSelect: 'none',
            boxShadow: !mobile && `4px 4px 20px ${colors.black}18`,
            backgroundColor: colors.white,
            marginTop: mobile ? '0' : `${!first ? (400 + 200 * rand) * (rand > 0.6 ? 2 : 1) : 0}px`,
            y,
            zIndex: mobile ? 'inherit' : '100',
            opacity: mobile || isInView ? 1 : 0, transition: 'opacity 0.5s',
        }} whileHover={!mobile && {boxShadow: `4px 4px 30px ${colors.black}32`}} whileTap={!mobile && {boxShadow: `4px 4px 5px ${colors.black}32`}}>
            <Lonk href={article.link ?? `/a/${article.id}`} style={{padding: '18px 18px 12px 18px', display: 'block'}}>
                {!mobile && imageKey && <Img img={imgData[imageKey]} style={{marginBottom: '12px', boxShadow: 'none', width: '100%'}} />}
                <Dept color={imageKey ? imgData[imageKey].color : (article.colors ? article.colors[0] : article.color ?? colors.cornflowerBlue)} small={!mobile}>{article.dept.toUpperCase() }</Dept>
                <Title small={!mobile}>{article.title}</Title>
            </Lonk>

        </motion.div>
    );
}