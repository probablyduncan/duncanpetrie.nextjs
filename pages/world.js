import Lonk from "@/components/Lonk";
import Magnifier from "@/components/Magnifier";
import { LatoWrapper, Title, Dept, UnderLonk, UnderLine } from "@/components/TextStyles";
import { imgData } from "@/data/images";
import { getWorldCardData } from "@/lib/dataParser";
import { AnimatePresence, animate, motion } from "framer-motion";
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
    const mapContainer = useRef();
    const cardsContainer = useRef();

    const [hoverCoords, setHoverCoords] = useState();
    const parseHoverCoords = (coords) => {
        if (!mapRef.current || !coords) {
            setHoverCoords(null);
            return;
        };

        const height = mapRef.current.clientHeight;
        const width = mapRef.current.clientWidth;

        // for testing
        // coords = [0.55,0.66]

        setHoverCoords([
            25 - height * coords[0], 
            25 - width * (1 - coords[1]), 
            25 - height * (1 - coords[0]), 
            25 - width * coords[1],
        ]);
    }

    // returns animation duration as delay
    const toCardDelay = 200;
    const toCardAnimation = () => {
        console.log('animating exit!');
        
        // animate map
        animate(mapContainer.current, {
            // animation
            x: 0 - mapContainer.current.clientWidth - mapContainer.current.offsetLeft
        }, {
            // options
            duration: toCardDelay / 1000, 
            damping: 20, 
            stiffness: 20
        });

        // animate cards container
        animate(cardsContainer.current, {
            // animation

        }, {
            // options

        })

        // animate text align

        // animate backlink
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
                justifyContent: 'flex-start',
                alignItems: 'stretch',
            }}>

                {/* map container */}
                <motion.div ref={mapContainer} initial={{
                    width: 'calc(80vh - 70px)',
                }}>
                    <div ref={mapRef} style={{
                        position: 'sticky',
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
                </motion.div>

                {/* cards container */}
                <motion.div ref={cardsContainer} initial={{
                    margin: '40px',
                    textAlign: 'left'
                }}>
                    {/* home link */}
                    <BackLink />
                    
                    <nav style={{
                        margin: '240px 0 '
                    }}>
                        <CardList cardData={worldCards} onHover={(on, coords) => parseHoverCoords(on ? coords : null)} exitDelay={toCardDelay} delayAction={toCardAnimation} />
                    </nav>

                </motion.div>
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
                    <CardList cardData={worldCards} onHover={(on, coords) => parseHoverCoords(on ? coords : null)} />
                </div>
            </Layout>
        )}
    </>
}



export function CardList({ cardData, onHover = () => {}, exitDelay, delayAction }) {

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
                        <UnderLonk href={`/w/${c.id}`} delay={exitDelay} delayAction={delayAction} color='#242626' thick onHover={(on) => onHover(on, c.coords)}>
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

export function BackLink({ text = 'home', href = '/', delay, delayAction, ref }) {

    return (
        <motion.div ref={ref} whileHover="hover" style={{position: 'fixed', top: '40px', right: 'calc(50vw - 640px)', color: imgData.bigmap.color}}>
            <LatoWrapper>
                <Lonk href={href} delay={delay} delayAction={delayAction}>
                    <motion.div variants={{hover: {color: imgData.bigmapnames.color}}}>
                        <motion.span style={{display: 'inline-block', marginRight: 5}} variants={{hover: {x: -5}}}>
                            &lt;
                        </motion.span>
                        <motion.span>
                            {text.toUpperCase()}
                        </motion.span>
                    </motion.div>
                </Lonk>
            </LatoWrapper>
        </motion.div>
    );
}