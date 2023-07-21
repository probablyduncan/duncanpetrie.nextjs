import { HeadData } from "@/components/Layout";
import { getWikiDataAsObject, getWikiPaths } from "@/lib/dataParser";
import { addToLocalStorage, getDateNumber, getSectionID, getWikiAPIKey, pushPopOpenCards } from "@/lib/wikihelper";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { Caption, ComicSansWrapper, GaramondWrapper, Heading1, Heading2, Heading3, LatoWrapper, LinkHeading1, LinkHeading2, LinkHeading3, Paragraph, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { addOpacity, colors } from "@/data/colors";
import { getMDXComponent } from "mdx-bundler/client";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { WikiContext, useFetchWikiCode, useHeadings } from "@/lib/wikiHooks";
import Img from "@/components/Img";

export async function getStaticPaths() {
    const paths = await getWikiPaths();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps( {params} ) {
    const data = await getWikiDataAsObject(params.id);

    return {
        props: {
            initialID: params.id,
            data,
        }
    };
}

/** 
 * id: alexa, zigglewomping, etc
 * data: object containing frontmatter of all wiki entries
 * data[id] contains data[id].code as well for mdx
 */
export default function Wiki({ initialID, data }) {

    const {viewport} = useContext(ViewportContext);

    const router = useRouter();
    
    const [entriesData, updateEntriesData] = useState(data);
    const [openCards, updateOpenCards] = useState([initialID]);
    const [currentCard, updateCurrentCard] = useState(initialID);

    // this runs once, on page load
    useEffect(() => { 

        router.query?.open?.split(',').forEach(id => {
            if (!openCards.includes(id)) openCards.push(id);
            updateOpenCards(openCards);
        });

        // first, add/update initial code to localstorage
        addToLocalStorage(initialID, data[initialID].code); 

        // then, populate entriesData with all cached mdx code
        const tempData = {...entriesData};
        Object.keys(tempData).forEach(w => {
            if (w == initialID) return;
            const inCache = localStorage.getItem(getWikiAPIKey(w));
            if (inCache) {
                const cacheJSON = JSON.parse(inCache);
                if ('code' in cacheJSON && 'expiration' in cacheJSON && cacheJSON.expiration > getDateNumber() )
                    tempData[w].code = cacheJSON.code;
            }
        });
        updateEntriesData(tempData);

        // ~ secret message ~
        if (!localStorage.getItem('hey!')) localStorage.setItem('hey!', 'get outta here! this is my secret little hidey-hole, ya dig?');

    }, [initialID, data, router.query.open]);

    return (<>
        <HeadData title={'Wiki - '} />

        {/* wrapper */}
        <WikiContext.Provider value={{entriesData, openCards}}>
            <div style={{ 
                minWidth: 'calc(100vw - 80px)',
                marginBottom: '40px',

                display: 'flex',
                justifyContent: 'space-between',
            }}>

                {/* left nav container */}
                <div style={{
                    
                }}>
                    <nav style={{
                        ...panelStyle,
                        position: 'sticky',
                        top: 40,
                    }}>
                        Back to home.
                    </nav>
                </div>

                {/* entries and contents container */}
                <main style={{
                    width: `calc(${textWidth / 2}px + 50vw)`,   // width should half of page plus the half of textwidth that's spilling over
                }}>
                    {openCards.map(id => <Card key={`${id}-card`} id={id} /> )}
                </main>

            </div>
        </WikiContext.Provider>
    </>);
}



/**
 * -- COMPONENTS
 */

function Card({ id }) {

    const {entriesData} = useContext(WikiContext);

    const textSectionRef = useRef();
    const headings = useHeadings(textSectionRef);

    return (<div style={{
        display: 'flex',
    }}>
        {/* card container */}
        <section ref={textSectionRef} id={getSectionID(entriesData[id].id)} aria-label={`Entry for ${entriesData[id].title}`} style={{
            ...panelStyle,
            width: textWidth
        }}>
            <Title>{entriesData[id].title}</Title>
            <MDXContent id={id} />
        </section>

        {/* table of contents sticky container */}
        {headings.length > 0 && <div>
            <nav role="complementary" aria-label={`Table of Contents for ${entriesData[id].title}`} style={{
                ...panelStyle,
                width: navWidth,
                marginLeft: '40px',
                position: 'sticky',
                top: 40,
                maxHeight: 'calc(100vh - 160px)',
                overflowY: 'scroll',
            }}>
                <LatoWrapper style={{fontSize: 14}}>CONTENTS</LatoWrapper>
                <br /><br />
                <GaramondWrapper div style={{
                    fontSize: '16px',
                    lineHeight: '200%',
                    color: colors.slate,
                }}>
                    {headings.map(h => (
                        <motion.button 
                            initial={{
                                // fontStyle: h.level == 3 ? 'italic' : 'inherit',
                                display: 'block'
                            }}
                            whileHover={{
                                color: colors.rellow,
                            }}
                            onClick={() => { 
                                window.scrollTo({ 
                                    top: document.querySelector(`section#${getSectionID(entriesData[id].id)}${(h.id ? ` #${h.id}` : '')}`)?.offsetTop - h.offset, 
                                    behavior: 'smooth' 
                                }) 
                            }}
                            key={`${h.id}-headinglink`}
                        >
                            {h.level > 2 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
                            {h.title}
                            {/* {h.title.at(-1) == '.' ? '' : '.'} */}
                            <br />
                            <br />
                        </motion.button>
                    ))}
                </GaramondWrapper>
            </nav>

        </div>}
    </div>)
}

/**
 * this is the component that builds the mdx, so all mdx components should go in here
 * @param {*} entryData object with id and (sometimes) code 
 */

function MDXContent({ id }) {

    const {entriesData} = useContext(WikiContext);

    const code = useFetchWikiCode(entriesData[id]);

    const Content = useMemo(() => code ? getMDXComponent(code, {Img: Img, ComicSans: ComicSansWrapper}) : <></>, [code]);

    return code && (<Content components={{h1: Heading1, h2: Heading2, h3: Heading3, h4: Caption, p: Paragraph, a: UnderLonk, ul: UnorderedList}} />);

}


const textWidth = 720;
const navWidth = 165;

const panelStyle = {
    boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
    padding: '40px 30px', marginTop: '40px',
    // maxWidth: '680px', maxHeight: 'calc(100vh - 160px)', 
    // overflowX: 'hidden', overflowY: 'scroll',
    backgroundColor: colors.white,
    borderRadius: '20px',
}