import { HeadData } from "@/components/Layout";
import { getWikiDataAsObject, getWikiPaths } from "@/lib/dataParser";
import { goToRandom } from "@/lib/wikihelper";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { Caption, ComicSansWrapper, GaramondWrapper, LatoWrapper, MerriweatherWrapper, Paragraph, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { addOpacity, colors, gradients } from "@/data/colors";
import { getMDXComponent } from "mdx-bundler/client";
import { AnimatePresence, motion } from "framer-motion";
import { WikiContext, useHeadings } from "@/lib/wikiHooks";
import { Preview, WikiHeading1, WikiHeading2, WikiHeading3, WikiImg, WikiLink, WikiList, WikiNavButton, WikiText } from "@/components/WikiComponents";
import Image from "next/image";
import { getSrc } from "@/lib/imageHelper";
import { imgData } from "@/data/images";
import { RoughNotation } from "react-rough-notation";
import Lonk from "@/components/Lonk";

export async function getStaticPaths() {
    const paths = await getWikiPaths();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps( {params} ) {
    const entriesData = await getWikiDataAsObject(params.id);

    return {
        props: {
            thisID: params.id,
            entriesData,
        }
    };
}

/** 
 * id: alexa, zigglewomping, etc
 * data: object containing frontmatter of all wiki entries
 * data[id] contains data[id].code as well for mdx
 */
export default function Wiki({ thisID, entriesData }) {

    const {viewport} = useContext(ViewportContext);

    const mainRef = useRef();
    
    const {headings, currentHeading} = useHeadings(mainRef, thisID);
    const [map, toggleMap] = useState();

    const Content = useMemo(() => getMDXComponent(entriesData[thisID].code, {Img: WikiImg, ComicSans: ComicSansWrapper}), [entriesData, thisID]);

    // breakpoints
    const noHeaders = viewport.width < 1200;
    const noMenu = viewport.width < 1000;
    const mobile = viewport.width < 600;

    //#region arrow key listener for scrolling

    useEffect(() => {

        const handleKeypress = (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    let upTop = 0;
                    headings.map(h => h.id).splice(1).reverse().every(h => {
                        
                        const thisTop = mainRef.current.querySelector(`#${h}`).offsetTop + mainRef.current.offsetTop;

                        if (thisTop > window.scrollY - 20) return true;
                        upTop = thisTop; return false;
                    })
                    window.scrollTo({top: upTop});
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    let downTop = document.body.offsetHeight;
                    headings.map(h => h.id).splice(1).every(h => {

                        const thisTop = mainRef.current.querySelector(`#${h}`).offsetTop + mainRef.current.offsetTop;

                        if (thisTop < window.scrollY + 20) return true;
                        downTop = thisTop; return false;
                    })
                    window.scrollTo({top: downTop});
                    history.pushState({}, '', window.location.href.split('#')[0] + (currentHeading ? `#${currentHeading}` : ''));
                    e.preventDefault();
                    break;
                case 'KeyM':
                    toggleMap(!map);
                case 'Escape':
                    if (map) toggleMap(!map);
            }
        }

        window.addEventListener('keydown', handleKeypress);
        return () => window.removeEventListener('keydown', handleKeypress);
    }, [headings, thisID, currentHeading, map]);

    //#endregion

    const mapWidth = 680;
    const mapHeight = 420;
    const mapSize = 1600;

    return (<>
        <HeadData title={'Wiki - '} />

        {/* wrapper */}
        <WikiContext.Provider value={{ thisID, entriesData }}>

            {/* mobile nav */}
            {noMenu && <motion.div style={{
                position: 'fixed',
                zIndex: 2,
                bottom: mobile ? 20 : 40,
                left: 0,
                marginLeft: mobile ? 20 : 40,
                padding: mobile ? '20px' : '20px 40px',
                backgroundColor: colors.white,
                width: mobile ? 'calc(100vw - 80px)' :'calc(100vw - 160px)',
                borderRadius: '20px',
                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <Lonk href={'/'}><LatoWrapper style={{
                    color: colors.black,
                }}>DUNCANPETRIE.COM</LatoWrapper></Lonk>
                <Lonk href={'/world'}><GaramondWrapper style={{
                    color: colors.slate,
                }}>Back! to the map.</GaramondWrapper></Lonk>
            </motion.div>}

            <motion.div style={{ 
                width: !noMenu ? 'calc(100vw - 160px)' : !mobile ? 'calc(100vw - 120px)' : 'calc(100vw - 40px)',
                display: 'grid',
                gridTemplateColumns: !noHeaders ? '1fr 680px 1fr' : !noMenu ? '165px 1fr' : '1fr',
                gap: '40px',
            }} exit={{y: -1000}}>

                {/* left nav container */}
                <div>
                    {!noMenu && <nav style={{
                        position: 'sticky',
                        top: 80,
                        width: 165,
                        maxHeight: 'calc(100vh - 160px)',
                        overflowY: 'scroll',
                        fontSize: '16px',
                        color: colors.slate,
                        userSelect: 'none',
                    }}>
                        <WikiNavButton href={'/'} title={'Back! to the front page.'}>Back to home.</WikiNavButton>
                        <br />
                        <WikiNavButton href={'yon'}>About this world.</WikiNavButton>
                        <WikiNavButton href={'influences'}>Inspiration.</WikiNavButton>
                        <WikiNavButton href={'/world'}>Map.</WikiNavButton>
                        <br />
                        <WikiNavButton href={'/'}>Stories.</WikiNavButton>
                        <WikiNavButton href={'/'}>Cultures.</WikiNavButton>
                        <WikiNavButton href={'/'}>Regions.</WikiNavButton>
                        <WikiNavButton href={'/'}>Towns.</WikiNavButton>
                        <br />
                        <WikiNavButton action={() => goToRandom(thisID, entriesData)}>Random.</WikiNavButton>
                        <WikiNavButton href={'index'}>Index.</WikiNavButton>
                        <br />
                    </nav>}
                </div>


                {/* text container */}
                <div style={{
                    width: !noMenu ? 680 : '100%',
                    marginTop: !noMenu ? 40 : 0,
                }}>
                    <AnimatePresence>
                        {entriesData[thisID].coords && map && !noMenu && <motion.div 
                            key={'map'} 
                            style={{
                                width: '100%',
                                borderRadius: '20px',
                                boxSizing: 'border-box',
                                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                                backgroundImage: `url(${getSrc(imgData.bigmapnames)})`,
                                backgroundSize: mapSize,
                                backgroundPosition: `${
                                    Math.min(
                                        0,          // value must be less than 0
                                        Math.max(
                                            mapWidth - mapSize,   // value must be greater than container size - background size
                                            mapWidth/2 - (mapSize * entriesData[thisID].coords[1])    // 1/2 container size - percentage of background size
                                        )
                                    )
                                }px ${
                                    Math.min(
                                        0,          // value must be less than 0
                                        Math.max(
                                            mapHeight - (mapSize * 5/4),  // value must be greater than container size - background size
                                            mapHeight/2 - (mapSize * 5/4 * entriesData[thisID].coords[0])    // 1/2 container size - percentage of background size
                                        )
                                    )
                                }px`,
                            }}
                            initial={{
                                marginBottom: -8,
                                height: 0,
                                border: `4px solid ${colors.clear}`,
                            }}
                            animate={{
                                marginBottom: mobile ? 20 : 40,
                                height: mapHeight,
                                border: `4px solid ${colors.slate}`,
                            }}
                            exit={{
                                marginBottom: -8,
                                height: 0,
                                border: `4px solid ${colors.clear}`,
                            }}
                        ></motion.div>}
                    </AnimatePresence>

                    <section style={!mobile ? {
                        boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                        padding: '40px', margin: `0 0 calc(50vh)`,
                        backgroundColor: colors.white,
                        borderRadius: '20px',
                    } : { padding: '20px 20px 120px' }}>
                        <header style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                            <WikiHeading1 noClass >{entriesData[thisID].title}</WikiHeading1>
                            {!noMenu && <GaramondWrapper div style={{
                                color: colors.slate,
                                minWidth: '120px',
                                textAlign: 'right',
                                lineHeight: '100%',
                            }}>
                                <motion.button onClick={() => {toggleMap(!map); if (map) window.scrollTo({top: 0})}} style={{color: colors.slate, lineHeight: 'inherit'}} whileHover={{color: colors.rellow}}>
                                    {map ? 'Close' : 'Where'}
                                </motion.button>
                                {map ? '.' : '?'}
                            </GaramondWrapper>}
                        </header>
                        <main ref={mainRef}>
                            <Content components={{h1: WikiHeading1, h2: WikiHeading2, h3: WikiHeading3, h4: Caption, p: WikiText, ul: WikiList, a: WikiLink}} />
                            {entriesData[thisID].inspiration && <>
                                <br /><br />
                                <WikiHeading2>Inspiration</WikiHeading2>
                                <WikiList>
                                    {entriesData[thisID].inspiration.map(i => (
                                        <li key={`insp-${i.text.substring(0, 4)}`}>
                                            {i.text.substring(0, i.text.indexOf('['))}
                                            <UnderLonk href={i.url}>{i.text.substring(i.text.indexOf('[') + 1, i.text.indexOf(']'))}</UnderLonk>
                                            {i.text.substring(i.text.indexOf(']') + 1)}
                                        </li>
                                    ))}
                                </WikiList>
                            </>}
                        </main>
                    </section>
                    {/* <section style={{
                        
                    }}>
                        <footer>
                            <WikiHeading2>Related</WikiHeading2>
                        </footer>
                    </section> */}
                </div>


                {/* table of contents sticky container */}
                <AnimatePresence>
                    {!noHeaders && headings.length > 0 && <motion.nav 
                        key='table-of-contents'
                        role="complementary" 
                        aria-label={`Table of Contents for ${entriesData[thisID].title}`} 
                        style={{
                            width: 165,
                            position: 'sticky',
                            top: 80,
                            marginLeft: '20px',
                            maxHeight: 'calc(100vh - 160px)',
                            overflowY: 'scroll',
                            fontSize: '16px',
                            color: colors.slate,
                            userSelect: 'none',
                        }} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <GaramondWrapper>
                            {headings.map(h => (
                                <WikiNavButton 
                                    key={`${h.id}-headinglink`}
                                    color={h.id == currentHeading ? colors.rellow : colors.slate}
                                    hoverColor={colors.rellow}
                                    action={() => {
                                        scrollTo({top: h.id ? mainRef.current.querySelector(`#${h.id}`).offsetTop + mainRef.current.offsetTop : 0});
                                        history.pushState({}, '', window.location.href.split('#')[0] + (h.id ? `#${h.id}` : ''));
                                    }}
                                >
                                    {h.level > 2 && <>~&nbsp;&nbsp;</>}
                                    {h.title ?? entriesData[thisID].title}
                                    {h.level == 0 && <><br /></>}
                                </WikiNavButton>
                            ))}
                        </GaramondWrapper>
                    </motion.nav>}

                </AnimatePresence>

            </motion.div>
            
        </WikiContext.Provider>
    </>);
}