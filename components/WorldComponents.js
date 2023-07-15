import { colors, gradients } from "@/data/colors";
import Lonk from "./Lonk";
import { Dept, GaramondWrapper, Title, UnderLonk } from "./TextStyles";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { assembleCardGroups } from "@/lib/worldHelper";
import { imgData } from "@/data/images";


export function CardList({ cardData, selected, filter, onHover = () => {}, exitDelay, delayAction, exiting }) {

    return assembleCardGroups(cardData, selected, filter, 'filter').map(([group, cards]) => 
        // map each group
        <div key={group}>
            {group != selected && <><Dept small color={gradients.purpleGreen[0]}>{group?.toUpperCase()}</Dept>
            <br /></>}
            {cards.sort((c1, c2) => c2.id == group ? 1 : c1.id == group ? -1 : 0).map(c => 
                // map each card
                <div key={c.id}>
                    <Title small >
                        {c.id == selected ? (
                            <RoughNotation
                                show={true}
                                type="box"
                                iterations={2}
                                strokeWidth={2}
                                color={imgData.bigmap.color}
                                animationDuration={300}
                                padding={8}
                            >
                                {c.title}
                            </RoughNotation>
                        ) : (
                            <UnderLonk noUnderline={exiting} href={`/w/${c.id}`} delay={exitDelay} delayAction={delayAction} color={colors.black} thick onHover={(on) => onHover(on, c.coords)}>
                                {c.title}
                            </UnderLonk>
                        )}
                    </Title>
                    <br /> 
                </div>
            )}
            <br />
            <br />
        </div>
    );
}





export function WorldMenu({ cardData, left, mapLink }) {

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
            color: colors.slate
        }}>
            <Lonk title={'Back! to the front page.'} href={'/world'}><motion.span {...linkProps} >Back home.</motion.span></Lonk>
            <br />
            <br />
            <motion.button title={'See more categories.'} {...linkProps} onClick={() => openDialog('filter')}>filter</motion.button>.
            <br />
            <motion.button title="Finally, make use of that keyboard of yours." {...linkProps} onClick={() => openDialog('search')}>search</motion.button>.
            <br />
            <motion.button title={'Go to a random entry.'} {...linkProps} onClick={randomEntry}>random</motion.button>.
            
            {mapLink && <><br /><Lonk title={`Back! to the map.`} href={'/world'} ><motion.span {...linkProps} >map.</motion.span></Lonk></>}
            
        </GaramondWrapper>
    );   
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