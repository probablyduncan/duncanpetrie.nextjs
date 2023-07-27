import { addOpacity, colors, darkGradients, getGradientBackgroundCSS, getGradientTextCSS, gradients, lightGradients } from "@/data/colors";
import Lonk from "./Lonk";
import { Dept, GaramondWrapper, Heading2, Heading3, LatoWrapper, LinkHeadingTemplate, Paragraph, Title, UnderLonk } from "./TextStyles";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { assembleCardGroups } from "@/lib/worldHelper";
import { imgData } from "@/data/images";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRand } from "@/lib/rand";
import { useRouter } from "next/router";


export function CardList({ cardData, selected, filter, onHover = () => {}, delayAction, exiting }) {

    const router = useRouter();

    return (<>
        {assembleCardGroups(cardData, router.query.filter, '{f}').map(([groupName, cards], i) => (<CardGroup key={groupName} i={i} groupName={groupName} cards={cards} selectedCard={selected} onHover={onHover} delayAction={delayAction} exiting={exiting} />))}
        {router.query.filter && <Lonk href={`/w/${router.query.w}`}><Dept small><motion.span style={{color: colors.black}} whileHover={{color: colors.mapGreen}}>CLEAR</motion.span></Dept></Lonk>}
    </>);

}

export function CardGroup({ groupName, cards, selectedCard, onHover, delayAction, exiting, i }) {

    //const gradientCSS = useMemo(() => getGradientTextCSS(...darkGradients[Math.floor(darkGradients.length * Math.random())]), []);

    const rand = useRand();

    return (<>
        <Dept small><span style={{color: darkGradients[Math.floor(darkGradients.length * rand)][Math.floor(rand * 2)]}} >{groupName.toUpperCase()}</span></Dept>
        <br />
        {cards.sort((c1, c2) => c2.id == groupName ? 1 : c1.id == groupName ? -1 : 0).map(c => 
            // map each card
            <div key={c.id}>
                <Title small >
                    <UnderLonk noUnderline={exiting} href={`/world/${c.id}`} delayAction={delayAction} color={colors.black} thick onHover={(on) => onHover(on, c.coords)}>
                        {c.title}
                    </UnderLonk>
                </Title>
                <br /> 
            </div>
        )}
        <br />
        <br />
    </>);

}




export function WorldMenu({ cardData, left, mapPage }) {

    const linkProps = {
        initial: {color: colors.slate},
        whileHover: {color: colors.rellow},
    }
    
    const openDialog = (id) => {
        const dialog = document.getElementById(id);
        if (dialog) dialog.showModal();
    }

    const randomEntry = () => {
        window.location.href = `/w/${cardData.map(w => w.id)[Math.floor(cardData.length * Math.random())]}`
    }

    

    return (
        <GaramondWrapper div style={{
            fontSize: '16px',
            lineHeight: '32px',
            textAlign: left ? 'left' : 'right',
            userSelect: 'none',
            letterSpacing: 0.1,
            color: colors.slate,
            marginTop: '40px',
            padding: '0 40px'
        }}>
            <Lonk title={'Back! to the front page.'} href={'/'}><motion.span {...linkProps} >Back home</motion.span></Lonk>.
            <br />
            <br />
            <Lonk title={'Huh? What is this place?'} href={'/w/yon'}><motion.span {...linkProps} >Start here</motion.span></Lonk>.
            <br />
            <Lonk title={'Where\'d this all come from?'} href={'/w/influences'}><motion.span {...linkProps} >Influences</motion.span></Lonk>.
            {/* <br />
            <motion.button title={'Filter by categories.'} {...linkProps} onClick={() => openDialog('filter')}>Categories</motion.button>. */}
            <br />
            <motion.button title={'Go to a random entry.'} {...linkProps} onClick={randomEntry}>Random</motion.button>.
            {!mapPage && <><br /><Lonk title={`Back! to the map page.`} href={'/world'} ><motion.span {...linkProps} >Map</motion.span></Lonk>.</>}
            
            {!mapPage && <><br /><br /><br /><br /><TableOfContents /></>}
            
        </GaramondWrapper>
    );   
}

export function TableOfContents({ }) {

    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        const headingsQuery = Array.from(document.querySelectorAll('article .heading1, article .heading2, article .heading3'));
        
        if (headingsQuery.length > 0) {
            
            const tempHeadings = headingsQuery.map(h => ({
                title: h.getAttribute('alt'), 
                id: h.children[0].children[0].id, 
                level: parseInt(h.classList[0].at(-1))
            }));
            
            tempHeadings.unshift({
                title: 'Top',
                id: '',
                level: 0
            });

            setHeadings(tempHeadings);
        }
    }, []);

    return headings && headings.length > 0 && (<>
        <LatoWrapper style={{fontSize: 15}}>ON THIS PAGE</LatoWrapper>
        <br />
        <br />
        {headings.map(h => (<div key={h.id}>
            <motion.button 
                title={`Go to ${h.title}`} 
                onClick={() => {window.location.href = `#${h.id}`}}
                initial={{color: colors.slate}}
                whileHover={{color: colors.rellow}}
                style={{fontStyle: h.level == 3 ? 'italic' : 'inherit'}}
            >
                {h.title}{h.title.at(-1) == '.' ? '' : '.'}
            </motion.button>
            <br />
        </div>))}
    </>);
}



export function WorldDialogs({ cardData }) {

    return (<>
        <dialog id="filter">
            filter filter filter
        </dialog>
        <dialog id="search">
            <input />
        </dialog>
    </>);

}