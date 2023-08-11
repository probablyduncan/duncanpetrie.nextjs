import Lonk from "@/components/Lonk";
import Magnifier from "@/components/Magnifier";
import { LatoWrapper, Title, Dept, UnderLonk, UnderLine, GaramondWrapper, Caption } from "@/components/TextStyles";
import { imgData } from "@/data/images";
import { getWorldCardData } from "@/lib/dataParser";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { RoughNotation } from "react-rough-notation";
import groupBy from "@/lib/groupBy";
import { ViewportContext } from "@/pages/_app";
import Img from "@/components/Img";
import Head from "next/head";
import Layout, { HeadData } from "@/components/Layout";
import { colors, getGradientTextCSS, gradients } from "@/data/colors";
import { processWorldCardGroups } from "@/lib/worldHelper";
import { MobileNav } from "@/components/Navbar";
import { CardList, WorldDialogs, WorldMenu } from "@/components/WorldComponents";
import { WikiMobileNav } from "@/components/WikiComponents";

export async function getStaticProps() {
    
    const worldCards = await getWorldCardData();

    return {
        props:
            {worldCards}
    };
}

export default function World({ worldCards }) {

    const { mobile, viewport } = useContext(ViewportContext);
    
    const mapRef = useRef();
    const mapContainer = useRef();
    const cardsContainer = useRef();
    const navContainer = useRef();

    const [homeLinkHover, setHomeLinkHover] = useState();

    const [hoverCoords, setHoverCoords] = useState();
    const parseHoverCoords = (coords) => {
        if (!mapRef.current || !coords) {
            setHoverCoords(null);
            return;
        };

        const height = mapRef.current.clientHeight;
        const width = mapRef.current.clientWidth;

        // for testing
        // coords = [0.425,0.425,1.2]

        const size = 40000 / (coords[2] ?? 1200);

        setHoverCoords([
            size - height * coords[0], 
            size - width * (1 - coords[1]), 
            size - height * (1 - coords[0]), 
            size - width * coords[1],
        ]);
    }

    // returns animation duration as delay
    const toCardDelay = 200;
    const [exiting, startExiting] = useState(false);
    const toCardAnimation = () => {    

        startExiting(true);
        // window.scrollTo({ top: 0, behavior: 'smooth' });

        // if (!mapContainer.current || !cardsContainer.current) 
        return 0;

        // animate map
        // animate(mapContainer.current, {
        //     // animation
        //     x: 0 - mapContainer.current.clientWidth - (window.innerWidth - 1280) / 2
        // }, {
        //     // options
        //     duration: toCardDelay / 1000, 
        //     damping: 20, 
        //     stiffness: 20
        // });

        // // animate cards container
        // animate(cardsContainer.current, {
        //     // animation
        //     textAlign: 'right',
        //     y: -240,
        //     x: 40 - cardsContainer.current.offsetLeft
        // }, {
        //     // options
        //     duration: toCardDelay / 1000, 
        //     damping: 20, 
        //     stiffness: 20
        // });

        // return toCardDelay;
    }


    // mapwidth = (viewport.height - 80) * 4/5
    // ultrawide: viewport.width - 80 >= (viewport.height - 80) * 8/5 + 400
    const ultrawideWidth = (viewport.height - 80) * 8/5 + 400;
    const ultrawide = viewport.width - 80 >= ultrawideWidth;

    // wide: viewport.width - 80 >= (viewport.height - 80) * 8/5
    const wideWidth = (viewport.height - 80) * 8/5;
    const wide = viewport.width - 80 >= wideWidth;

    // square: viewport.width - 80 >= (viewport.height - 80) * 4/5 + 300
    const squareWidth = (viewport.height - 80) * 4/5 + 365;
    const square = viewport.width - 80 >= squareWidth;

    const menuWidth = 170;

    return <>
        <HeadData title={'Springtide - '} />

        {square ? (
            
            // landscape screens

            <div style={{
                width: ultrawide ? `${ultrawideWidth}px` : `${wideWidth}px`,
                maxWidth: 'calc(100vw - 80px)',
                margin: '40px 0',
                display: 'flex',
                flexFlow: 'row-reverse',
                justifyContent: ultrawide ? 'center' : 'flex-start',
                alignItems: 'stretch',
            }}>

                {/* nav links */}
                <div>
                    <motion.nav ref={navContainer} style={{
                        width: ultrawide ? (viewport.height - 80) * 4/5 : menuWidth, 
                        position: 'sticky',
                        top: '40px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <WorldMenu cardData={worldCards} mapPage />
                    </motion.nav>
                </div>
                

                {/* entry list */}
                <motion.div ref={cardsContainer} style={{
                    width: ultrawide ? 400 : (viewport.height - 80) * 4/5 - menuWidth,
                    margin: `${viewport.height >= 400 ? 300 : 20}px ${ultrawide ? 40 : 0}px 300px 40px`

                }}>
                    <CardList 
                        cardData={worldCards} 
                        onHover={(on, coords) => parseHoverCoords(on ? coords : null)} 
                        delayAction={toCardAnimation} 
                        exiting={exiting}
                    />
                </motion.div>


                {/* map */}
                <motion.div ref={mapContainer} initial={{opacity: 0}} animate={{opacity: 1}}>
                    <div ref={mapRef} style={{
                        width: `${(viewport.height - 80) * 4/5}px`, 
                        position: 'sticky',
                        top: '40px',
                    }}>
                        <RoughNotation
                            show={hoverCoords != null}
                            type="box"
                            iterations={1}
                            strokeWidth={2}
                            color={colors.black}
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

                <WorldDialogs cardData={worldCards} />
            </div>
        ) : (

            viewport.width >= 720 ? (

                // tall screens, tablets, portait monitors, etc  
                <div style={{
                    width: 'calc(100vw - 80px)',
                    marginTop: '40px',
                    display: 'flex',

                }}>

                    {/* BACKLINK HERE */}
                    <LatoWrapper div style={{
                        position: 'fixed',
                        top: 40,
                        right: 40
                    }}>
                        <Lonk href={'/'}><motion.span whileHover={{color: colors.rellow}}>HOME</motion.span></Lonk>
                    </LatoWrapper>

                    {/* map */}
                    <motion.div ref={mapContainer} initial={{opacity: 0}} animate={{opacity: 1}}>
                        <div ref={mapRef} style={{
                            width: viewport.width - 380, 
                            position: 'sticky',
                            top: '40px',
                            marginBottom: '40px',
                        }}>
                            <RoughNotation
                                show={hoverCoords != null}
                                type="box"
                                iterations={1}
                                strokeWidth={2}
                                color={colors.black}
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

                    {/* entry list */}
                    <motion.div ref={cardsContainer} style={{
                        width: 260,
                        margin: '200px 0 200px 40px'
                    }}>
                        <CardList 
                            cardData={worldCards} 
                            onHover={(on, coords) => parseHoverCoords(on ? coords : null)} 
                            delayAction={toCardAnimation} 
                            exiting={exiting}
                        />
                    </motion.div>

                </div>
            
            ) : (
            
                // portrait mobile screens
                <div style={{
                    margin: viewport.width >= 500 ? '40px' : '20px'
                }}>
                    <motion.div ref={mapContainer} initial={{opacity: 0}} animate={{opacity: 1}}>
                        <Img img={imgData.bigmapnames} />
                    </motion.div>

                    <div style={{ margin: '80px 4px' }}>
                        <CardList 
                            cardData={worldCards} 
                        />
                    </div>

                    <WikiMobileNav 
                        mobileBreakpoint={viewport.width < 500} 
                        entriesData={ worldCards.reduce( (newObject, w) => ({ ...newObject, [w.id]: w}), {} ) } 
                    />
                </div>
            )
        )}
        

    </>
}



