import { HeadData } from "@/components/Layout";
import { getWikiDataAsObject, getWikiPaths } from "@/lib/dataParser";
import { goToRandom } from "@/lib/wikihelper";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { Caption, ComicSansWrapper, GaramondWrapper, Paragraph, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { addOpacity, colors } from "@/data/colors";
import { getMDXComponent } from "mdx-bundler/client";
import { AnimatePresence, motion } from "framer-motion";
import { WikiContext, useHeadings } from "@/lib/wikiHooks";
import { Preview, WikiHeading1, WikiHeading2, WikiHeading3, WikiImg, WikiLink, WikiList, WikiNavButton, WikiText } from "@/components/WikiComponents";
import Image from "next/image";
import { getSrc } from "@/lib/imageHelper";
import { imgData } from "@/data/images";

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
    const mapDialogRef = useRef();
    
    const {headings, currentHeading} = useHeadings(mainRef, thisID);
    const [preview, setPreview] = useState({});
    const [fullscreen, setFullscreen] = useState(null); // should be null, or id of fullscreen card

    const Content = useMemo(() => getMDXComponent(entriesData[thisID].code, {Img: WikiImg, ComicSans: ComicSansWrapper}), [entriesData, thisID]);

    // breakpoints
    const noHeaders = viewport.width < 1200;
    const noMenu = viewport.width < 1000;
    const mobile = viewport.width < 600;

    // style

    const panelStyle = {
        boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
        padding: '40px 30px', marginTop: '40px',
        backgroundColor: colors.white,
        borderRadius: '20px',
    }

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
                    e.preventDefault();
                    break;
            }
        }
        window.addEventListener('keydown', handleKeypress);
        return () => window.removeEventListener('keydown', handleKeypress);
    }, [headings, thisID]);

    //#endregion

    const openMap = (id) => {
        id ? mapDialogRef.current.showModal() : mapDialogRef.current.close();
    }

    return (<>
        <HeadData title={'Wiki - '} />

        {/* wrapper */}
        <WikiContext.Provider value={{ thisID, entriesData }}>
            <motion.div style={{ 
                width: !noMenu ? 'calc(100vw - 160px)' : !mobile ? 'calc(100vw - 80px)' : 'calc(100vw - 40px)',
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
                }}>
                    <section style={{
                        boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                        padding: '40px', margin: `${noMenu ? 0 : 40}px 0 calc(50vh)`,
                        backgroundColor: colors.white,
                        borderRadius: '20px',
                    }}>
                        <header style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                            <Title>{entriesData[thisID].title}</Title>
                            {!mobile && <GaramondWrapper div style={{
                                color: colors.slate,
                                minWidth: '120px',
                                textAlign: 'right',
                            }}>
                                <motion.button onClick={() => openMap(thisID)} style={{color: colors.slate}} whileHover={{color: colors.rellow}}>Where</motion.button>?
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
                        ...panelStyle
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
                                    // href={`#${h.id}`}
                                    action={() => {scrollTo({top: h.id ? mainRef.current.querySelector(`#${h.id}`).offsetTop + mainRef.current.offsetTop : 0})}}
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

            <dialog ref={mapDialogRef} onClick={() => openMap(false)}>
                <Image src={getSrc(imgData.bigmapnames)} alt="map" width={80} height={100}></Image>
            </dialog>
            
        </WikiContext.Provider>
    </>);
}