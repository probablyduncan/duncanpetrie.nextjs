import { Caption, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, UnderLonk, UnorderedList } from '@/components/TextStyles';
import { getWorldCard, getWorldCardData, getWorldCardIDs } from '@/lib/dataParser';
import { getMDXComponent } from 'mdx-bundler/client';
import { useEffect } from 'react';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

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

    const cache = {};
    cache[card.w] = card;

    const openCard = (id) => {

        if (cardData.find(w => id == w.id)) {

            console.log('valid id');

            if (openCards.indexOf(id) == -1) {

                console.log('fetching');

                setOpenCards([...openCards, id]);
                history.pushState({}, '', `/wiki/${id}`);
            } else {
                window.scrollTo({ top: document.getElementById(id)?.offsetTop, behavior: 'smooth' });
            }
        } else {
            console.log('invalid id');
        }

        if (openCards.indexOf(id) == -1) {

            setOpenCards([...openCards, id]);
            history.pushState({}, '', `/wiki/${id}`);
        }

    }

    return (
        <div style={{
            width: '95vw',
        }}>
            <button onClick={() => openCard('alexa')}>alexa</button>
            <button onClick={() => openCard('edya')}>edya</button>
            <button onClick={() => openCard('daggard')}>daggard</button>
            <button onClick={() => openCard('baron')}>baron</button>
            <button onClick={() => openCard('zigglewomping')}>zigglewomping</button>
            <br />
            {openCards.map((id, i) => <CardWrapper data={cache[id]} key={`${id}-${i}`} id={id} i={i} />)}
        </div>
    );
}

function CardWrapper({ id, data, i }) {
    
    return <div id={id} style={{
        border: '2px solid black'
    }}>
        {data ? <MDXContent data={data} /> : <CardFetcher id={id} />}
    </div>

}

function CardFetcher({ id }) {
    const { data, error, isLoading } = useSWR(`/api/card?id=${id}`, fetcher);

    useEffect(() => {
        if (!isLoading) window.scrollTo({ top: document.getElementById(id)?.offsetTop, behavior: 'smooth' });
    }, [isLoading])

    return !isLoading && !error && data?.data?.code ? <MDXContent data={data.data} /> : 'loading'
}

export function MDXContent({ data }) {

    const Content = useMemo(() => getMDXComponent(data.code, {}), [data?.code]);

    return <Content components={{h1: LinkHeading1, h2: LinkHeading2, h3: LinkHeading3, h4: Caption, p: Paragraph, a: UnderLonk, ul: UnorderedList}} />
}