import { HeadData } from "@/components/Layout";
import { getWikiDataAsObject, getWikiPaths } from "@/lib/dataParser";
import { addToLocalStorage, getSectionID, getSectionSelector } from "@/lib/wikihelper";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { Caption, ComicSansWrapper, GaramondWrapper, Heading1, Heading2, Heading3, Paragraph, Title, UnderLonk, UnorderedList } from "@/components/TextStyles";
import { addOpacity, colors } from "@/data/colors";
import { getMDXComponent } from "mdx-bundler/client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRouter } from "next/router";
import { WikiContext, useFetchWikiCode, useHeadings } from "@/lib/wikiHooks";
import Img from "@/components/Img";
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
            initialID: params.id,
            entriesData,
        }
    };
}

/** 
 * id: alexa, zigglewomping, etc
 * data: object containing frontmatter of all wiki entries
 * data[id] contains data[id].code as well for mdx
 */
export default function Wiki({ initialID, entriesData }) {

    const {viewport} = useContext(ViewportContext);

    const router = useRouter();
    const mainRef = useRef();
    
    const [openCards, setOpenCards] = useState([initialID]);
    const [currentCard, setCurrentCard] = useState(initialID);
    const [fullscreen, setFullscreen] = useState(null); // should be null, or id of fullscreen card

    const textWidth = viewport.width > 1410 ? 720 : viewport.width > 1000 ? 600 : viewport.width - 140 ;
    const navWidth = 165;

    //#region init, read router query and add code to localstorage

    // this runs once, on page load
    useEffect(() => { 

        // this keeps openCards up to date with open path query
        if (router.query.open) {
            const fromQuery = [...new Set(router.query.open.split(',').map(w => w.trim()).filter(w => w in entriesData))];
            if (!fromQuery.includes(initialID)) fromQuery.unshift(initialID);
            setOpenCards(fromQuery);
        }

        // add/update initial code to localstorage
        addToLocalStorage(initialID, entriesData[initialID].code);

        // ~ secret message ~
        if (!localStorage.getItem('hey!')) localStorage.setItem('hey!', 'get outta here! go find your own secret little hidey-hole, this one is mine!');

        setTimeout(() => {
            window.scrollTo({
                top: document.querySelector(getSectionSelector(initialID)).offsetTop - 40,
                behavior: 'smooth'
            });
        }, 100);

    }, [initialID, entriesData, router.query.open]);

    //#endregion

    //#region current card scroll listener

    const { scrollY } = useScroll();
    const cardTopPadding = 120  // the distance above a card where it will be current. 40 for bottom of prev card
    useMotionValueEvent(scrollY, 'change', (scroll) => {
        if (!mainRef.current) return;

        let newCurrent = openCards[0];
        openCards.every(id => {
            if (mainRef.current.querySelector(getSectionSelector(id))?.offsetTop - cardTopPadding > scroll)
                return false;
            
            newCurrent = id;
            return true;
        });

        if (currentCard != newCurrent) setCurrentCard(newCurrent);
    });

    //#endregion

    //#region toggle card, random card

    // to add even if already open:         toggleCard({id, add: true})
    // to toggle based on current state:    toggleCard({id})
    // to close even if not already open:   toggleCard({id, add: false})
    const toggleCard = ({id, add = null, openAtEnd}) => {

        const cardIsOpen = openCards.includes(id);

        // if adding or toggling open
        if (add ?? !cardIsOpen) {

            // if not already open, add to openCards, right after current card
            if (!cardIsOpen) {

                setOpenCards(cards => {

                    // if openAtEnd, just append
                    if (openAtEnd) 
                        cards.push(id);

                    // otherwise put after current card
                    else
                        cards.splice(cards.indexOf(currentCard) + 1, 0, id);

                    return [...new Set(cards)];
                });
            }

            // scroll to card
            setTimeout(() => scrollTo({ id }), cardIsOpen ? 0 : 200);
        }

        // if removing or toggling closed
        else {

            // if closing last card, update current card to 2nd to last card. Otherwise, set to next card
            setCurrentCard(openCards.at(-1) == id ? openCards.at(-2) : openCards[openCards.indexOf(id) + 1]);

            // close card
            setOpenCards(cards => cards.filter(c => c != id));
        }
    }

    const openRandomCard = () => {
        const options = Object.keys(entriesData).filter(w => !openCards.includes(w));
        toggleCard({id: options[Math.floor(options.length * Math.random())], add: true, openAtEnd: true});
    }

    //#endregion

    //#region scrollTo function

    const scrollTo = useCallback(({id, top = 0, toBottom = false, next = false, prev = false}) => {

        if (id) {

            // if going down:
            if (next) {

                // if this is the last card, scroll to end of it
                if (openCards.at(-1) == id) toBottom = true;

                // otherwise set id to next id
                else id = openCards[Math.min(openCards.indexOf(id) + 1, openCards.length - 1)];
            } 

            // if going up and we are not at top card already and we are at the top of the current card, scroll to previous card 
            else if (prev && openCards[0] != id && window.scrollY < mainRef.current.querySelector(getSectionSelector(id)).offsetTop) {

                // set id to previous open card
                id = openCards[openCards.indexOf(id) - 1];
            }
            
            // add id offset to top
            top += mainRef.current.querySelector(getSectionSelector(id))?.offsetTop - 40;
        }

        // if toBottom, just scroll to end of document
        if (toBottom) top = document.body.scrollHeight;

        window.scrollTo({top, behavior: 'smooth'});

    }, [openCards]);

    //#endregion

    //#region arrow key listener for scrolling

    useEffect(() => {

        const handleKeypress = (e) => {
            switch (e.code) {
                case 'ArrowUp': 
                    scrollTo({id: currentCard, prev: true}); 
                    e.preventDefault();
                    break;
                case 'ArrowDown': 
                    scrollTo({id: currentCard, next: true}); 
                    e.preventDefault();
                    break;
            }
        }
        window.addEventListener('keydown', handleKeypress);
        return () => window.removeEventListener('keydown', handleKeypress);
    }, [currentCard, scrollTo]);

    //#endregion


    return (<>
        <HeadData title={'Wiki - '} />

        {/* wrapper */}
        <WikiContext.Provider value={{entriesData, openCards, currentCard, toggleCard, scrollTo, textWidth, navWidth}}>
            <div style={{ 
                width: 'calc(100vw - 80px)',
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'space-between',
            }}>

                {/* left nav container */}
                {viewport.width > 1000 && <GaramondWrapper style={{
                    fontSize: '16px',
                    color: colors.slate,
                    userSelect: 'none',

                }}>
                    <nav style={{
                        boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                        padding: '40px 30px', marginTop: '40px',
                        backgroundColor: colors.white,
                        borderRadius: '20px',
                        position: 'sticky',
                        top: 40,
                        width: navWidth,
                        marginRight: 40,
                        maxHeight: 'calc(100vh - 160px)',
                        overflowY: 'scroll',
                    }}>
                        <WikiNavButton href={'/'} title={'Back! to the front page.'}>Back to home.</WikiNavButton>
                        <br />
                        <WikiNavButton action={() => toggleCard({id: 'yon', add: true, openAtEnd: true})}>About this world.</WikiNavButton>
                        <WikiNavButton action={() => toggleCard({id: 'influences', add: true, openAtEnd: true})}>Inspiration.</WikiNavButton>
                        <WikiNavButton href={'/world'}>Map.</WikiNavButton>
                        <br />
                        <WikiNavButton href={'/'}>Stories.</WikiNavButton>
                        <WikiNavButton href={'/'}>Cultures.</WikiNavButton>
                        <WikiNavButton href={'/'}>Regions.</WikiNavButton>
                        <WikiNavButton href={'/'}>Towns.</WikiNavButton>
                        <br />
                        <WikiNavButton action={openRandomCard}>Random.</WikiNavButton>
                        <WikiNavButton href={'/'}>Index.</WikiNavButton>
                        <br />
                    </nav>
                </GaramondWrapper>}

                {/* entries and contents container */}
                <main ref={mainRef} style={{
                    width: `calc(${textWidth / 2}px + 50vw)`,   // width should half of page plus the half of textwidth that's spilling over
                }}>
                    <AnimatePresence>
                        {openCards.map(id => <Card key={`${id}-card`} id={id} /> )}
                    </AnimatePresence>
                </main>

            </div>
        </WikiContext.Provider>
    </>);
}



/**
 * -- COMPONENTS
 */

function Card({ id }) {

    const {viewport} = useContext(ViewportContext);
    const {entriesData, toggleCard, currentCard, scrollTo, textWidth, navWidth} = useContext(WikiContext);

    const code = useFetchWikiCode(entriesData[id]);
    const Content = useMemo(() => code ? getMDXComponent(code, {Img: Img, ComicSans: ComicSansWrapper}) : <></>, [code]);

    const textSectionRef = useRef();
    const headings = useHeadings(textSectionRef, code);

    const [currentHeading, setCurrentHeading] = useState('');

    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (scroll) => {
        if (currentCard != id || !textSectionRef.current || !headings || headings.length < 2) return;
        let newCurrent = '';
        headings.forEach(h => {
            if (h.id !== '' && textSectionRef.current.querySelector(`#${h.id}`)?.offsetTop - 200 < scroll)
                newCurrent = h.id;
        });

        if (currentHeading != newCurrent) setCurrentHeading(newCurrent);
    })

    return (<motion.div style={{ 
        display: 'flex',
    }} exit={{opacity: 0, height: 0, transition: {duration: 0.15}}}>
        
        {/* card container */}
        <section ref={textSectionRef} id={getSectionID(entriesData[id].id)} aria-label={`Entry for ${entriesData[id].title}`} style={{
            boxShadow: viewport.width > 600 ? `4px 4px 20px ${addOpacity(colors.black)}` : 'none',
            padding: viewport.width > 600 ? '40px 30px' : '0', marginTop: '40px',
            backgroundColor: viewport.width > 600 ? colors.white : 'unset',
            borderRadius: '20px',
            width: viewport.width > 600 ? textWidth : textWidth + 60,
        }}>

            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <Title>{entriesData[id].title}</Title>
                {viewport.width > 600 && <GaramondWrapper div style={{
                    color: colors.slate,
                    minWidth: '120px',
                    textAlign: 'right',
                }}>
                    <motion.button style={{color: colors.slate}} whileHover={{color: colors.rellow}}>fullscreen</motion.button>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <motion.button style={{color: colors.slate}} whileHover={{color: colors.rellow}} onClick={() => {toggleCard({id, add: false})}}>close.</motion.button>
                </GaramondWrapper>}
            </header>
            {code ? (
                <Content components={{h1: Heading1, h2: Heading2, h3: Heading3, h4: Caption, p: Paragraph, ul: UnorderedList, a: UnderLonk}} />
            ) : (
                <Paragraph>Hey! I&apos;m <span style={{color: colors.errorYellow}}>loading</span> this page as fast as I can! Gimme a sec, would ya?!</Paragraph>
            )}
        </section>

        {/* table of contents sticky container */}
        {viewport.width > 1280 && headings.length > 0 && <div>
            <motion.nav role="complementary" aria-label={`Table of Contents for ${entriesData[id].title}`} style={{
                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                padding: '40px 30px', marginTop: '40px',
                backgroundColor: colors.white,
                borderRadius: '20px',
                width: navWidth,
                marginLeft: '40px',
                position: 'sticky',
                top: 40,
                maxHeight: 'calc(100vh - 160px)',
                overflowY: 'scroll',
                fontSize: '16px',
                color: colors.slate,
                userSelect: 'none',
            }} initial={{opacity: 0}} animate={{opacity: 1}}>
                <GaramondWrapper>
                    {/* <LatoWrapper style={{fontSize: 14}}>CONTENTS</LatoWrapper> */}
                    {/* <div style={{lineHeight: '200%'}}> */}
                        {headings.map(h => (
                            <WikiNavButton 
                                key={`${h.id}-headinglink`}
                                color={id == currentCard && h.id == currentHeading ? colors.rellow : colors.slate}
                                hoverColor={colors.rellow}
                                action={() => { scrollTo({
                                    top: document.querySelector(`section#${getSectionID(entriesData[id].id)}${(h.id ? ` #${h.id}` : '')}`)?.offsetTop - h.offset
                                })}}
                            >
                                {/* {h.level > 2 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>} */}
                                {h.title ?? entriesData[id].title}
                                {h.level == 0 && <><br /><br /></>}
                            </WikiNavButton>
                        ))}
                    {/* </div> */}
                </GaramondWrapper>
            </motion.nav>

        </div>}
    </motion.div>)
}

function WikiNavButton({ children, action, href, title, color, hoverColor }) {

    return (
        <GaramondWrapper div >
            <motion.span
                animate={{
                    color: color ?? colors.slate,
                    display: 'block',
                    textAlign: 'left',
                }}
                whileHover={{
                    color: hoverColor ?? colors.rellow,
                }}
            >
                {action ? (
                    <button onClick={action}>{children}</button>
                ) : href ? (
                    <Lonk title={title} href={href}>{children}</Lonk>
                ) : (
                    <span>{children}</span>
                )}
            </motion.span>
            <br />
        </GaramondWrapper>
    );
}