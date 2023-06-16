import Lonk from "@/components/Lonk";
import Magnifier from "@/components/Magnifier";
import { LatoWrapper, Title, Paragraph, Dept, UnderLonk } from "@/components/TextStyles";
import { imgData } from "@/data/images";
import { getWorldCardData } from "@/lib/dataParser";
import { motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import { RoughNotation } from "react-rough-notation";
import groupBy from "@/lib/groupBy";
import { ViewportContext } from "@/components/Viewport";

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

    return (
        <div style={{
            width: '1280px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start'

        }}>
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

            {/* articles container */}
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
    )
}



function CardList({ cardData, onHover, offHover }) {

    // group cards
    return Object.entries(groupBy(cardData, 'group')).map(([group, cards]) => 
        // map each group
        <div key={group}>
            <Dept small color={cards[0].color}>{group.toUpperCase()}</Dept>
            <br />
            {cards.map(c => 
                // map each card
                <div key={c.id}>
                    <Title small>
                        <UnderLonk href={`/w/${c.id}`} color='#242626' thick onHover={(on) => on ? onHover(c.coords) : offHover()} >
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