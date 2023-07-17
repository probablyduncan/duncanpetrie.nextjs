import { getMDXComponent, getMDXExport } from 'mdx-bundler/client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Wiki({ card }) {

    // use history.pushState() to update url

    // hold list of currently rendered cards in state
    const [openCards, setOpenCards] = useState([]);

    // could I just have all wiki data included statically? would that make the page way too big? probably
    // const { data, error, isLoading } = useSWR(`/api/card/${'alexa'}`, fetcher);

    // console.log(data);

    const openCard = (id) => {
        // if (id in cardData) 
            setOpenCards([...openCards, id]);
    }

    return (
        <div style={{
            width: '95vw',
        }}>
            <button onClick={() => openCard('alexa')}>alexa</button>
            <button onClick={() => openCard('zigglewomping')}>ziggle</button>
            <button onClick={() => openCard('baron')}>baron</button>
            <br />
            {openCards.map((id, i) => <CardWrapper key={`${id}-${i}`} id={id} i={i} />)}
        </div>
    );
}

function CardWrapper({ id, i }) {
    const { data, error, isLoading } = useSWR(`/api/card?id=${id}`, fetcher);

    return !isLoading && !error && data?.data?.code ? <MDXContent data={data.data} /> : <>loading</>
}

export function MDXContent({ data }) {

    const Content = useMemo(() => getMDXComponent(data.code, {}), [data?.code]);

    return <Content />
}