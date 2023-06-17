import Lonk from "@/components/Lonk";
import Magnifier from "@/components/Magnifier";
import { LatoWrapper, Title, Dept, UnderLonk } from "@/components/TextStyles";
import { imgData } from "@/data/images";
import { getWorldCardData } from "@/lib/dataParser";
import { motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import { RoughNotation } from "react-rough-notation";
import groupBy from "@/lib/groupBy";
import { ViewportContext } from "@/components/Viewport";
import Img from "@/components/Img";
import Head from "next/head";
import Layout from "@/components/Layout";

export async function getStaticProps() {
    
    const worldCards = await getWorldCardData();

    return {
        props:
            {worldCards}
    };
}

export default function World({ worldCards }) {

    const { mobile } = useContext(ViewportContext);
    
    const mapRef = useRef();

    const [hoverCoords, setHoverCoords] = useState();
    const parseHoverCoords = (coords) => {
        if (!mapRef.current || !coords) return null;

        const height = mapRef.current.clientHeight;
        const width = mapRef.current.clientWidth;

        // for testing
        // coords = [0.55,0.66]

        return [
            25 - height * coords[0], 
            25 - width * (1 - coords[1]), 
            25 - height * (1 - coords[0]), 
            25 - width * coords[1],
        ];
    }

    return <>
        <Head>
            <title>{`World - DuncanPetrie.com`}</title>
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
        {!mobile ? (
            <div style={{
                width: '1280px',
                maxWidth: '95vw',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>

                {/* split these up 5/8 to map and 3/8 to list */}

                {/* map container */}
                <div ref={mapRef} style={{
                    width: 'calc(80vh - 70px)',
                    position: 'fixed',
                    top: '40px',
                }}>
                    <RoughNotation
                        show={hoverCoords != null}
                        type="box"
                        iterations={1}
                        strokeWidth={2}
                        color={'#242626'}
                        animationDuration={200}
                        padding={hoverCoords}
                    >
                        <Magnifier 
                            img={imgData.bigmap}
                            magImg={imgData.bigmapnames}
                            noBorder
                            magStrength={0.8}
                            magWidth={200}
                            magHeight={250}
                        />
                    </RoughNotation>
                </div>

                {/* cards container */}
                <div style={{
                    margin: '40px 40px 40px calc(80vh - 40px)',
                    width: `calc(100% - 80vh)`,
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
                        <CardList cardData={worldCards} onHover={(coords) => setHoverCoords(parseHoverCoords(coords))} offHover={() => setHoverCoords(null)} />
                    </nav>

                </div>
            </div>
        ) : (
            <Layout pageName='world' menuLink='/i/all' color={imgData.bigmap.color}>
                {/* <LatoWrapper div className={"opacityLink"} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px 24px'
                }}>
                    <Link href='mailto:duncanpetrie1@gmail.com' style={{color: '#32ae5d'}}>WORLD</Link>
                    <Lonk href='https://instagram.com/probablyduncan' style={{color: '#fad549'}}>BACK</Lonk>
                </LatoWrapper> */}
                <div style={{padding: '25px 20px 0'}} >
                    <Img img={imgData.bigmap} />
                </div>
                <div style={{padding: '80px 24px 0'}}>
                    <CardList cardData={worldCards} onHover={(coords) => setHoverCoords(parseHoverCoords(coords))} offHover={() => setHoverCoords(null)} />
                </div>
            </Layout>
        )}
    </>
}



export function CardList({ cardData, onHover, offHover }) {

    // group cards
    return Object.entries(groupBy(cardData, 'group')).map(([group, cards]) => 
        // map each group
        <div key={group}>
            <Dept small color={cards[0].color}>{group.toUpperCase()}</Dept>
            <br />
            {cards.map(c => 
                // map each card
                <div key={c.id}>
                    <Title small >
                        <UnderLonk href={`/w/${c.id}`} color='#242626' thick onHover={ onHover ? (on) => on ? onHover(c.coords) : offHover() : null} >
                            {c.title}
                        </UnderLonk>
                    </Title>
                    <br />
                </div>
            )}
            <br />
            <br />
        </div>
    );
}