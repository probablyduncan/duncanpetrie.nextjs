import { WikiContext } from "@/lib/wikiHooks";
import { ViewportContext } from "@/pages/_app";
import { useContext, useState } from "react";
import { GaramondWrapper, MerriweatherWrapper, UnderLonk } from "./TextStyles";
import { motion } from "framer-motion";
import { colors } from "@/data/colors";
import Lonk from "./Lonk";
import { processWorldLinkHref, sanitizeElementID } from "@/lib/wikihelper";
import Img from "./Img";
import { imgData } from "@/data/images";

export function WikiLink({ children, ...props }) {

    const {viewport} = useContext(ViewportContext);
    const {thisID, entriesData} = useContext(WikiContext);

    // https://emojipedia.org/
    const cursors = [ '⛔', '🚫', '🚷', '🚳', '📵', '☣️', '☢️', '⚠️', '😡', '😬', '😲', ];
    const [cursor, setCursor] = useState('🚫');

    const href = processWorldLinkHref({text: children, href: props.href, thisID});
    const page = href.split('#')[0];

    return href.includes('/') || Object.keys(entriesData).includes(page)  ? (
        // should be displayed in full
        <UnderLonk 
            title={`${page in entriesData ? entriesData[page].title : (page.charAt(0).toUpperCase() + page.slice(1))} ➯`}
            href={href}
        >
            {children}
        </UnderLonk>
    ) : (
        // under construction
        <motion.span 
            title={'I\'m still workin\' on it!'} 
            whileHover={{color: colors.errorRed}}
            onMouseLeave={() => setCursor(cursors[Math.floor(Math.random() * cursors.length)])}
            style={{
                color: colors.errorYellow, 
                // https://www.emojicursor.app/ custom cursor
                cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>${cursor}</text></svg>") 16 16,auto`,
            }}
        >
            {children}
        </motion.span>
    )
}

export function WikiNavButton({ children, action, href, title, color, hoverColor, noPeriod }) {

    const addPeriod = (!noPeriod && typeof children === typeof '');
    if (addPeriod && children.at(-1) == '.') children = children.substring(0, children.length - 1);

    return (
        <GaramondWrapper style={{display: 'block'}} >
            <motion.span
                animate={{
                    color: color ?? colors.slate,
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
            {addPeriod && <>.</>}
            <br /><br />
        </GaramondWrapper>
    );
}

export const WikiHeading1 = ({ children }) => (
    <MerriweatherWrapper>
        <h1
            className={'heading1'}
            alt={children}
            id={sanitizeElementID(children)}
            style={{
                color: colors.black,
                fontSize: '35px',
                fontWeight: 'bold',
                lineHeight: '40px',
                margin: '-30px 0 35px',
                paddingTop: '30px',
            }}
        >
            {children}
        </h1>
    </MerriweatherWrapper>
)

export const WikiHeading2 = ({ children }) => (
    <MerriweatherWrapper>
        <h2
            className={'heading2'}
            alt={children}
            id={sanitizeElementID(children)}
            style={{
                color: colors.black,
                fontSize: '25px',
                fontWeight: 'bold',
                lineHeight: '32px',
                margin: '-30px 0 25px',
                paddingTop: '30px',
            }}
        >
            {children}
        </h2>
    </MerriweatherWrapper>
);

export const WikiHeading3 = ({ children }) => (
    <GaramondWrapper>
        <h3 
            className={'heading3'} 
            alt={children} 
            id={sanitizeElementID(children)}
            style={{
                color: colors.black,
                fontSize: '20px',
                fontWeight: 'bold',
                lineHeight: '48px',
                margin: '-20px 0 25px',
                paddingTop: '20px'
            }} 
        >
            {children}
        </h3>
    </GaramondWrapper>
);

const textStyle = {
    color: colors.slate,
    fontSize: '18px',
    lineHeight: '48px',
    margin: '0 0 25px',
    // textAlign: 'justify',
    // hyphens: 'auto',
    // msHyphens: 'auto',
    // WebkitHyphens: 'auto',
}

export const WikiText = ({ children }) => (
    <GaramondWrapper>
        <p style={textStyle}>
            {children}
        </p>
    </GaramondWrapper>
);

export const WikiList = ({ children }) => (
    <GaramondWrapper>
        <ul style={textStyle}>
            {children}
        </ul>
    </GaramondWrapper>
);

export function WikiImg({ imgKey, src, caption }) {
    
    let img = imgKey in imgData ? imgData[imgKey] : {src, caption}
    
    return (<div style={{
        margin: '40px 0',
    }}>
        <Img img={img} noBorder />
        {img.caption && <GaramondWrapper style={{
            width: '100%',
            textAlign: 'left',
            color: colors.caption,
            fontSize: '16px',
            lineHeight: '200%',
        }}>{img.caption}</GaramondWrapper>}
    </div>);
}