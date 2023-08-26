import { HeadData } from "@/components/Layout";
import { WikiCardHeader, WikiHeading1, WikiIndexLink, WikiList, WikiMenu, WikiMobileNav, WikiPageList, WikiText } from "@/components/WikiComponents";
import { addOpacity, colors, gradients } from "@/data/colors";
import { motion } from "framer-motion";
import { useContext } from "react";
import { ViewportContext } from "../_app";
import { getSortedIDsForIndex, getWikiDataAsObject } from "@/lib/dataParser";
import { useRouter } from "next/router";
import Lonk from "@/components/Lonk";
import { GaramondWrapper } from "@/components/TextStyles";
import { CardList } from "@/components/WorldComponents";

export async function getStaticProps({ }) {
    const entriesData = await getWikiDataAsObject();
    const sortedIDs = await getSortedIDsForIndex(entriesData);

    return {
        props: {
            entriesData,
            sortedIDs,
        }
    };
}

export default function Index({ entriesData, sortedIDs }) {

    const {viewport} = useContext(ViewportContext);
    const noHeaders = viewport.width < 1200;
    const noMenu = viewport.width < 1000;
    const mobile = viewport.width < 600;

    const {query: {filter}} = useRouter();

    return (<>
        <HeadData title={`Springtide - DuncanPetrie.com`} description={'An index of the world of Springtide.'} ogUseMap />

        {noMenu && <WikiMobileNav mobileBreakpoint={mobile} entriesData={entriesData} />}

        <motion.div style={{ 
            width: !noMenu ? 'calc(100vw - 160px)' : !mobile ? 'calc(100vw - 120px)' : 'calc(100vw - 40px)',
            display: 'grid',
            gridTemplateColumns: !noHeaders ? '1fr 680px 1fr' : !noMenu ? '165px 1fr' : '1fr',
            gap: '40px',
        }} exit={{y: -1000}}>

            {/* left nav container */}
            {!noMenu && <WikiMenu entriesData={entriesData} />}

            {/* text container */}
            <div style={{
                width: !noMenu ? 680 : '100%',
                marginTop: 40,
            }}>
                <section style={!mobile ? {
                    boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                    padding: '40px', margin: `0 0 calc(50vh)`,
                    backgroundColor: colors.white,
                    borderRadius: '20px',
                } : { padding: '20px 0px 120px' }}>
                    <WikiCardHeader 
                        title={filter ? filter[0].toUpperCase() + filter.substring(1) : 'Index'} 
                        showSideLink={filter}
                        sideLinkHref={'/w'} 
                        sideLinkText={'All cards'} 
                        sideLinkPunctuation={'.'} 
                    />
                    <main style={{
                        marginTop: '40px'
                    }}>
                        {/* content goes here */}
                        {/* <CardList 
                            cardData={Object.entries(entriesData).map(([id, data]) => data)}
                            noClear
                        /> */}
                        <GaramondWrapper>
                        {sortedIDs.map(id => {

                            const data = entriesData[id];
                            if (data && (!filter || data.groups.includes(filter))) return (
                                <div key={data.id}>
                                    <WikiIndexLink data={data} />
                                    <br />
                                </div>
                            );
                        })}
                        </GaramondWrapper>
                    </main>
                </section>
            </div>

        </motion.div>
    </>)
}