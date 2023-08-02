import { HeadData } from "@/components/Layout";
import { getWikiDataAsObject, getWikiPaths } from "@/lib/dataParser";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { Caption, ComicSansWrapper, GaramondWrapper, UnderLonk } from "@/components/TextStyles";
import { addOpacity, colors, gradients } from "@/data/colors";
import { getMDXComponent } from "mdx-bundler/client";
import { AnimatePresence, motion } from "framer-motion";
import { WikiContext, useHeadings } from "@/lib/wikiHooks";
import { WikiCardHeader, WikiHeading1, WikiHeading2, WikiHeading3, WikiImg, WikiLink, WikiList, WikiMenu, WikiMobileNav, WikiNavButton, WikiText } from "@/components/WikiComponents";
import { getSrc } from "@/lib/imageHelper";
import { imgData } from "@/data/images";

export async function getStaticPaths() {
    const paths = await getWikiPaths();
    return {
        paths,
        fallback: false,
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
    const pushHeadingHistory = false;

    const mapContainerWidth = 680;
    const mapContainerHeight = 850;
    const mapZoomedWidth = 2000;
    const [map, toggleMap] = useState(false);
    const [mapZoomed, setMapZoomed] = useState();
    
    useEffect(() => {
        toggleMap(false);
        setMapZoomed(entriesData[thisID].coords && entriesData[thisID].coords[2] != -1);
    }, [entriesData, thisID])

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
                    let upTop = 0; let newUpID;
                    headings.map(h => h.id).splice(1).reverse().every(h => {
                        
                        const thisTop = mainRef.current.querySelector(`#${h}`).offsetTop + mainRef.current.offsetTop;

                        if (thisTop > window.scrollY - 20) return true;
                        upTop = thisTop; newUpID = h; return false;
                    })
                    window.scrollTo({top: upTop});
                    e.preventDefault();
                    if (pushHeadingHistory) history.pushState({}, '', window.location.href.split('#')[0] + (newUpID ? `#${newUpID}` : ''));
                    break;
                case 'ArrowDown':
                    let downTop = document.body.offsetHeight; let newDownID;
                    headings.map(h => h.id).splice(1).every(h => {

                        const thisTop = mainRef.current.querySelector(`#${h}`).offsetTop + mainRef.current.offsetTop;

                        if (thisTop < window.scrollY + 20) return true;
                        downTop = thisTop; newDownID = h; return false;
                    })
                    window.scrollTo({top: downTop});
                    e.preventDefault();
                    if (pushHeadingHistory && newDownID) history.pushState({}, '', window.location.href.split('#')[0] + (`#${newDownID}`));
                    break;
                case 'KeyM':
                    if (entriesData[thisID].coords) {
                        window.scrollTo({top: map ? (window.scrollY - mapContainerHeight - 40) : 0, behavior: 'smooth'});
                        toggleMap(!map);
                    }
                    break;
                case 'Escape':
                    if (entriesData[thisID].coords && map) {
                        window.scrollTo({top: window.scrollY - mapContainerHeight - 40});
                        toggleMap(!map);
                    }
                    break;
            }
        }

        window.addEventListener('keydown', handleKeypress);
        return () => window.removeEventListener('keydown', handleKeypress);
    }, [headings, thisID, currentHeading, map, entriesData]);

    useEffect(() => {
        toggleMap();
    }, [thisID])

    //#endregion

    return (<>
        <HeadData title={`${entriesData[thisID].title.replace('//', ' ')} - Springtide - `} />

        {/* wrapper */}
        <WikiContext.Provider value={{ thisID, entriesData }}>

            {/* mobile nav */}
            {noMenu && <WikiMobileNav mobileBreakpoint={mobile} thisID={thisID} entriesData={entriesData} />}

            <motion.div style={{ 
                width: !noMenu ? 'calc(100vw - 160px)' : !mobile ? 'calc(100vw - 120px)' : 'calc(100vw - 40px)',
                display: 'grid',
                gridTemplateColumns: !noHeaders ? '1fr 680px 1fr' : !noMenu ? '165px 1fr' : '1fr',
                gap: '40px',
            }} exit={{y: -1000}}>

                {/* left nav container */}
                {!noMenu && <WikiMenu thisID={thisID} entriesData={entriesData} />}


                {/* text container */}
                <div style={{
                    width: !noMenu ? 680 : '100%',
                    marginTop: 40,
                }}>
                    <AnimatePresence>
                        {entriesData[thisID].coords && map && !noMenu && <motion.div 
                            onClick={() => setMapZoomed(!mapZoomed)}
                            key={'map'} 
                            style={{
                                cursor: mapZoomed ? 'zoom-out' : 'zoom-in',
                                width: '100%',
                                borderRadius: '20px',
                                boxSizing: 'border-box',
                                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                                backgroundImage: `url(${getSrc(imgData.bigmapnames)})`,
                                backgroundSize: mapZoomed ? mapZoomedWidth : mapContainerWidth,
                                backgroundPosition: `${
                                    Math.min(
                                        0,          // value must be less than 0
                                        Math.max(
                                            mapContainerWidth - (mapZoomed ? mapZoomedWidth : mapContainerWidth),   // value must be greater than container size - background size
                                            mapContainerWidth/2 - ((mapZoomed ? mapZoomedWidth : mapContainerWidth) * entriesData[thisID].coords[1])    // 1/2 container size - percentage of background size
                                        )
                                    )
                                }px ${
                                    Math.min(
                                        0,          // value must be less than 0
                                        Math.max(
                                            mapContainerHeight - ((mapZoomed ? mapZoomedWidth : mapContainerWidth) * 5/4),  // value must be greater than container size - background size
                                            mapContainerHeight/2 - ((mapZoomed ? mapZoomedWidth : mapContainerWidth) * 5/4 * entriesData[thisID].coords[0])    // 1/2 container size - percentage of background size
                                        )
                                    )
                                }px`,
                            }}
                            initial={{
                                marginBottom: -8,
                                height: 0,
                                border: `4px solid ${colors.white}`,
                            }}
                            animate={{
                                marginBottom: mobile ? 20 : 40,
                                height: mapContainerHeight,
                                border: `4px solid ${colors.slate}`,
                            }}
                            exit={{
                                marginBottom: -8,
                                height: 0,
                                border: `4px solid ${colors.white}`,
                            }}
                        ></motion.div>}
                    </AnimatePresence>

                    <section style={!mobile ? {
                        boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                        padding: '40px', margin: `0 0 calc(50vh)`,
                        backgroundColor: colors.white,
                        borderRadius: '20px',
                    } : { padding: '20px 0px 120px' }}>

                        {/* header */}
                        <WikiCardHeader 
                            title={entriesData[thisID].title}
                            showSideLink={entriesData[thisID].coords && !noMenu}
                            sideLinkText={map ? 'Close' : 'Where'} 
                            sideLinkAction={() => {toggleMap(!map); if (map) window.scrollTo({top: 0})}}
                            sideLinkPunctuation={map ? '.' : '?'} 
                        />

                        {/* content */}
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
                        aria-label={`Table of Contents for ${entriesData[thisID].title.replace('//', ' ')}`} 
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
                                        if (pushHeadingHistory) history.pushState({}, '', window.location.href.split('#')[0] + (h.id ? `#${h.id}` : ''));
                                    }}
                                >
                                    {h.level > 2 && <>~&nbsp;&nbsp;</>}
                                    {h.title ?? entriesData[thisID].title.replace('//', ' ')}
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