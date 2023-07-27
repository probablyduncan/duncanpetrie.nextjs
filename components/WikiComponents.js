import { WikiContext } from "@/lib/wikiHooks";
import { ViewportContext } from "@/pages/_app";
import { useContext, useRef, useState } from "react";
import { GaramondWrapper, LatoWrapper, MerriweatherWrapper, UnderLonk } from "./TextStyles";
import { AnimatePresence, color, motion } from "framer-motion";
import { addOpacity, colors, getGradientTextCSS, gradients } from "@/data/colors";
import Lonk from "./Lonk";
import { goToRandom, processWorldLinkHref, sanitizeElementID } from "@/lib/wikihelper";
import Img from "./Img";
import { imgData } from "@/data/images";
import { getSrc } from "@/lib/imageHelper";
import { RoughNotation } from "react-rough-notation";
import { useRand } from "@/lib/rand";



//#region page links

export function WikiLink({ children, ...props }) {

    const {viewport} = useContext(ViewportContext);
    const {thisID, entriesData, togglePreview} = useContext(WikiContext);

    const linkRef = useRef();

    // https://emojipedia.org/
    const cursors = [ '⛔', '🚫', '🚷', '🚳', '📵', '☣️', '☢️', '⚠️', '😡', '😬', '😲', ];
    const [cursor, setCursor] = useState('🚫');

    const [hoverPos, setHoverPos] = useState(false)

    const href = processWorldLinkHref({text: children, href: props.href, thisID});
    const page = href.split('#')[0];

    return href.includes('/') || Object.keys(entriesData).includes(page)  ? (<>
        <Lonk
            // title={`${page in entriesData ? entriesData[page].title : (page.charAt(0).toUpperCase() + page.slice(1))} ➯`}
            href={href}
            onMouseEnter={() => setHoverPos({x: linkRef.current.offsetLeft, y: linkRef.current.offsetTop})}
            onMouseLeave={() => setHoverPos(false)}
        >
            <RoughNotation 
                show={hoverPos}
                padding={-1.5}
                strokeWidth={1.5}
                color={colors.cornflowerBlue}
                iterations={1}
                animationDuration={120}
                multiline
            >
                <span ref={linkRef} style={{
                    color: colors.cornflowerBlue
                }}>{children}</span>
            </RoughNotation>
        </Lonk>
        <AnimatePresence>
            {(entriesData[page] && viewport.width >= 600 && hoverPos) && <Preview key={'preview'} entryData={entriesData[page]} pos={{x: linkRef.current.offsetLeft, y: linkRef.current.offsetTop}} delay={.2} />}
        </AnimatePresence>
    </>) : (viewport.width >= 600 ? (
        // under construction
        <motion.span 
            title={'I\'m still workin\' on it!'} 
            whileHover={{color: colors.errorRed}}
            onMouseLeave={() => setCursor(cursors[Math.floor(Math.random() * cursors.length)])}
            animate={{
                color: colors.errorYellow,
                // https://www.emojicursor.app/ custom cursor
                cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>${cursor}</text></svg>") 16 16,auto`,
            }}
        >
            {children}
        </motion.span>
    ) : (<>{children}</>))
}

export function Preview({ entryData, path, noText, pos = {}, delay }) {

    const text = entryData.intro;
    const coords = entryData.coords ?? [0.5, 0.5, 160];
    const img = entryData.coords ? imgData.bigmapnames : imgData.bigmap;

    const x = coords.length > 2 ? coords[2] : 1200;
    const y = x * 5/4;

    return (
        <motion.span style={{
            position: 'absolute',
            left: pos.x, top: pos.y,
            zIndex: 100,

            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'flex-end',
            
            x: -20,
        }} initial={{
            y: 80, 
            opacity: 0
        }} animate={{
            y: 40, 
            opacity: 1, 
            transition: {delay: delay * 2}
        }}>
            {/* preview container */}
            <motion.span style={{
                width: text ? '360px' : '160px',
                height: '200px',
                borderRadius: '20px',
                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                backgroundColor: colors.white,

                display: 'grid',
                gridTemplateColumns: text ? '1fr 1.25fr' : '1fr',
                overflow: 'hidden',
            }}>

                {/* map container */}
                {<motion.span style={{
                    display: 'block',
                    backgroundImage: `url(${getSrc(img)})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',                
                }} initial={{
                    backgroundSize: `160px 200px`,
                    backgroundPosition: `${0}px ${0}px`,
                }} animate={{
                    backgroundSize: `${x}px ${y}px`,
                    backgroundPosition: `${-1 * x * coords[1] + 80}px ${-1 * y * coords[0] + 100}px`,
                    transition: {delay: delay * 4, duration: delay * 2}
                }}></motion.span>}


                {/* text container */}
                {text && <span style={{
                    display: 'block',
                    height: '186px',
                    overflow: 'hidden',

                    padding: '7px 12px',

                    fontSize: '16px',
                    lineHeight: '160%',
                    textAlign: 'left',
                    fontStyle: 'normal',

                    ...getGradientTextCSS(),
                    background: `linear-gradient(180deg, ${colors.slate} 0%, ${colors.slate} 65%, ${colors.white} 95%)`,
                }}>
                    {text.split('//').map(str => <span key={str.substring(0, 5)} style={{display: 'inline-block', paddingBottom: '8px'}}>
                        {str.substring(0, str.indexOf('['))}
                        <b><i>{str.substring(str.indexOf('[') + 1, str.indexOf(']'))}</i></b>
                        {str.substring(str.indexOf(']') + 1)}
                    </span>)}
                </span>}

            </motion.span>

            {/* url container */}
            {path && <motion.span style={{
                display: 'block',
                marginTop: '14px',
                // width: text ? '336px' : '136px',
                borderRadius: '20px',
                boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
                backgroundColor: colors.white,
                padding: '10px 12px 8px 16px',

            }} initial={{opacity: 0, y: 40}} animate={{opacity: 1, y: 0, transition: {delay: delay * (coords[2] == 160 ? 4 : 6)}}}>
                <span style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    whiteSpace: 'nowrap',
                    hyphens: 'none',
                    fontSize: '15px',
                    lineHeight: '100%',
                    height: '20px',
                    color: colors.cornflowerBlue,
                }}>
                    <i>duncanpetrie.com/wiki/{typeof path == typeof String ? path : entryData.id}&nbsp;&nbsp;</i>
                </span>
            </motion.span>}
            
        </motion.span>
    );
}

//#endregion

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

//#region other mdx components

export const WikiHeading1 = ({ children, noClass }) => (
    <MerriweatherWrapper>
        <h1
            className={noClass ? '' : 'heading1'}
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

export const WikiHeading2 = ({ children, noClass }) => (
    <MerriweatherWrapper>
        <h2
            className={noClass ? '' : 'heading2'}
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

export const WikiHeading3 = ({ children, noClass }) => (
    <GaramondWrapper>
        <h3 
            className={noClass ? '' : 'heading3'} 
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
    fontSize: '20px',
    textAlign: 'left',
    hyphens: 'auto',
    msHyphens: 'auto',
    WebkitHyphens: 'auto',
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

//#endregion



//#region layout components

export function WikiMenu({ }) {

    const {entriesData, thisID} = useContext(WikiContext);

    return (
        <nav style={{
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
        </nav>
    );
}

export function WikiMobileNav({ mobileBreakpoint: mobile }) {

    const {entriesData, thisID} = useContext(WikiContext);
    const [menu, toggleMenu] = useState(false);
    
    const MobileMenuLink = ({ href, action, children, color }) => {

        const rand = useRand();

        const colorOptions = [
            ...gradients.pinkPurple,
            ...gradients.purpleRed,
            colors.mapLightGreen,
        ]

        const style = {
            color: colors.slate,
            display: 'inline-block',
            fontSize: '28px',
            lineHeight: '120%',
            marginBottom: '18px',
        };

        return (
            <RoughNotation
                show={true}
                iterations={1}
                strokeWidth={3}
                color={color ?? colorOptions[Math.floor(rand * colorOptions.length)]}
                animationDelay={400}
            >
                {href ? 
                    (<Lonk href={href} style={style}>{children}</Lonk>) 
                : 
                    (<button onClick={action} style={style}>{children}</button>)}
            </RoughNotation>
        )
    }
    
    return (<>
        <motion.nav style={{
            position: 'fixed',
            zIndex: 3,
            bottom: mobile ? 0 : 40,
            left: 0,
            marginLeft: mobile ? 0 : 40,
            padding: mobile ? '20px' : '20px 40px',
            backgroundColor: colors.white,
            width: mobile ? 'calc(100vw - 40px)' :'calc(100vw - 160px)',
            borderRadius: mobile ? '20px 20px 0 0' : '20px',
            boxShadow: `4px 4px 20px ${addOpacity(colors.black)}`,
            display: 'flex',
            justifyContent: 'space-between',
        }}>
            <Lonk href={'/'}><LatoWrapper style={{
                color: colors.black,
            }}>DUNCANPETRIE.COM</LatoWrapper></Lonk>
            <button onClick={() => toggleMenu(!menu)}><LatoWrapper style={{
                color: colors.rellow,
            }}>{menu ? 'CLOSE' : 'MENU'}</LatoWrapper></button>
        </motion.nav>
        
        <AnimatePresence>
            {menu && <motion.nav key={'menu'} style={{
                position: 'fixed',
                top: 0, left: 0,
                zIndex: 2,
                width: `calc(100vw - 160px)`,
                height: `calc(100vh - 160px)`, overflowX: 'scroll',
                padding: `80px`,
                backgroundColor: colors.offWhite,
                transition: {stiffness: 400},
            }} initial={{
                x: '100vw',
            }} animate={{
                x: '0vw',
                transition: {stiffness: 400},
            }} exit={{
                x: '100vw',
                transition: {stiffness: 400},
            }}>
                <MerriweatherWrapper div>
                    <MobileMenuLink color={colors.rellow} href={'/'}>Back to home.</MobileMenuLink>
                    <br />
                    <br />
                    <br />
                    <MobileMenuLink href={'yon'}>About this world.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'influences'}>Inspiration.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'/world'}>Map.</MobileMenuLink>
                    <br />
                    <br />
                    <br />
                    <MobileMenuLink href={'/world'}>Stories.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'/world'}>Cultures.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'/world'}>Regions.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'/world'}>Towns.</MobileMenuLink>
                    <br />
                    <br />
                    <br />
                    <MobileMenuLink action={() => goToRandom(thisID, entriesData)}>Random.</MobileMenuLink>
                    <br />
                    <MobileMenuLink href={'/world'}>Index.</MobileMenuLink>
                    <br />
                </MerriweatherWrapper>
            </motion.nav>}
        </AnimatePresence>
    </>);
}