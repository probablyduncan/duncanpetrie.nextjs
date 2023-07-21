import Img from '@/components/Img';
import { Caption, ComicSansWrapper, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList } from '@/components/TextStyles';
import { addOpacity, colors } from '@/data/colors';
import { imgData } from '@/data/images';
import { getWorldCard, getWorldCardData, getWorldCardIDs } from '@/lib/dataParser';
import { getMDXComponent } from 'mdx-bundler/client';
import { useEffect } from 'react';
import { useState, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

const getKey = (id) => `/api/card?id=${id}`;

const  cacheExpirationDays = 1;
const addToLocalStorage = (id, code) => {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + cacheExpirationDays);
    
    localStorage.setItem(getKey(id), JSON.stringify({id, code, expiration: expiration.getTime()}));
}


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






export default function Wiki({ card, cardData }) {
    // hold list of currently rendered cards in state
    const [openCards, setOpenCards] = useState([card.w]);

    useEffect(() => { addToLocalStorage(card.w, card.code); }, [card.code, card.w]);

    const { mutate } = useSWRConfig();

    const openCard = (id) => {

        // check if valid id
        if (cardData.find(w => id == w.id)) {

            // make sure not already open
            if (openCards.indexOf(id) == -1) {

                // update list of open cards
                setOpenCards([...openCards, id]);
                
                // update url
                history.pushState({}, '', `/wiki/${id}`);

                // try get from localstorage before fetching
                const key = getKey(id);
                const fromLocalStorage = localStorage.getItem(key);

                // if exists in localstorage, check expiration and either use or remove
                if (fromLocalStorage) {
                    const cacheData = JSON.parse(localStorage.getItem(key));
                    
                    if (cacheData.expiration && cacheData.expiration > new Date().getTime()) {
                        cardData.find(w => w.id == id).code = cacheData.code;
                    }
                }

            } else {

                // if already open, just scroll to card
                window.scrollTo({ top: document.getElementById(id)?.offsetTop - 40, behavior: 'smooth' });
            }
        }

        if (openCards.indexOf(id) == -1) {

            setOpenCards([...openCards, id]);
            history.pushState({}, '', `/wiki/${id}`);
        }

    }

    return (
        <div style={{
            width: 'calc(100vw - 80px)',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: colors.offWhite
        }}>
            <button onClick={() => openCard('alexa')}>alexa</button>
            <button onClick={() => openCard('edya')}>edya</button>
            <button onClick={() => openCard('daggard')}>daggard</button>
            <button onClick={() => openCard('baron')}>baron</button>
            <button onClick={() => openCard('zigglewomping')}>zigglewomping</button>
            <br />
            {openCards.map((id, i) => <CardWrapper card={card.w == id ? {...card.frontmatter, id, code: card.code} : cardData.find(w => w.id == id)} key={`${id}-${i}`} id={id} />)}
        </div>
    );
}

function CardWrapper({ card, id }) {
    
    return (
        <div id={id} style={{
            boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
            padding: '40px', marginTop: '40px',
            maxWidth: '680px', maxHeight: 'calc(100vh - 160px)', 
            overflowX: 'hidden', overflowY: 'scroll',
            backgroundColor: colors.white,
            borderRadius: '20px',

        }}>
            {/* inner wrapper */}
            <div style={{

            }}>
                <Title>{card.title}</Title>
                {card.code ? (<MDXContent id={id} code={card.code} />) : <CardFetcher id={id} />}
            </div>
        </div>
    );

}

function CardFetcher({ id }) {

    const { data, error, isLoading } = useSWR(getKey(id), fetcher, {
        onSuccess(code) {
            addToLocalStorage(id, code);
        },
        
    });

    useEffect(() => {
        if (!isLoading) window.scrollTo({ top: document.getElementById(id)?.offsetTop - 40, behavior: 'smooth' });
    }, [id, isLoading])

    return !isLoading && !error && data ? <MDXContent id={id} code={data} /> : 'loading'
}

export function MDXContent({ id, code }) {

    function WorldImg({ imgKey, src, caption }) {
    
        let img = imgKey in imgData ? imgData[imgKey] : {src, caption}
        
        return (<div style={{
            margin: '40px 0',
        }}>
            <Img img={img} noBorder />
            {img.caption && <Caption textAlign={'left'}>{img.caption}</Caption>}
        </div>);
    }

    const Content = useMemo(() => getMDXComponent(code, {Img: WorldImg, ComicSans: ComicSansWrapper}), [code]);

    useEffect(() => { window.scrollTo({ top: document.getElementById(id)?.offsetTop - 40, behavior: 'smooth' }); }, [id])

    return <div style={{}}>
        <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: UnderLonk, ul: UnorderedList}} />
    </div>
}