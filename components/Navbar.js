import Lonk from './Lonk';
import style from './navbar.module.css';
import React, { useState, useEffect, useContext } from 'react';
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import { Cinzel_Decorative, Lato, EB_Garamond } from '@next/font/google';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ViewportContext } from './Viewport';

const cinzel = Cinzel_Decorative({ subsets: ['latin'], display: 'swap', weight: '700' });
const garamond = EB_Garamond({subsets: ['latin'], display: 'swap', variable: true, weight: '500'});
const lato = Lato({ subsets: ['latin'], display: 'swap', weight: '700', variable: true});

const logo = 'The Daily DunCAn';
const linkSpacer = '/';
const defaultLinks = [
    {text: 'photography', link: '/i/photography'},
    {text: 'writing', link: '/i/writing'},
    {text: 'short films', link: '/i/films'},
    {text: 'websites of yore', link: '/a/sites'},
    {text: 'world', link: '/world'},
    {text: 'about', link: '/a/about'},
    {text: 'instagram', link: 'https://instagram.com/probablyduncan/'}
];

export function NewsNav( {homelink, links} ) {

    // refresh date
    const [date, setDate] = useState(null);
    useEffect(() => {
        var d = new Date();
        setDate(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const [emailHover, setEmailHover] = useState(false);

    links = links ?? defaultLinks;

    return (<>
        <header className={style.logoWrapper}>
            <h1 className={style.logo + " " + cinzel.className}>
                <Lonk href={"/"}>{logo}</Lonk>
            </h1>
        </header>

        <nav className={style.navbar}>

            {/* either date or link back to home */}
            <span className={style.links}>{homelink ? (
                <Lonk className={style.sidelink + " " + garamond.className} href={homelink ?? "/"}>back! to the front page</Lonk>
            ) : (
                <span className={style.sidelink + " " + garamond.className}>{date}</span>
            )}</span>

            {/* list of links */}
            <span className={style.links + " " + lato.className}>
                {links.map((linkdata, i) => {
                    return (
                        <span key={`navlink-${linkdata.text}`}>
                            {i != 0 ? linkSpacer : ""}
                            <Navlink href={linkdata.link} text={linkdata.text} />
                        </span>
                    );
                })}
            </span>
            
            {/* email */}
            <span className={style.links + " right"}>
            <RoughNotationGroup show={emailHover}>
                <RoughNotation
                    type="highlight"
                    strokeWidth={1}
                    padding={10}
                    iterations={1}
                    animationDuration={200}
                    color={'rgb(255, 248, 172)'}
                >
                    <a 
                        className={style.sidelink + " " + garamond.className} 
                        href="mailto:duncanpetrie.com" target="_blank" 
                        rel="noopener noreferrer"
                        onMouseEnter={() => setEmailHover(true)}
                        onMouseLeave={() => setEmailHover(false)}
                    >
                        duncanpetrie1@gmail.com
                    </a>
                </RoughNotation>
            </RoughNotationGroup></span>

        </nav>
    </>);
}

export function Navlink({text, href}) {

    const [hover, toggleHover] = useState(false);

    return (<RoughNotationGroup show={hover}>
        <RoughNotation
            type={"circle"}
            strokeWidth={1.5}
            padding={[4,8]}
            iterations={1}
            animationDuration={text.length * 30}
            color={"#0e0862"}
        >
            <h3 
                className={lato.className + " " + style.link} 
                onMouseEnter={() => toggleHover(true)} 
                onMouseLeave={() => toggleHover(false)}
            >
                <Lonk href={href}>
                    {text.toUpperCase()}
                </Lonk>
            </h3>
        </RoughNotation>
    </RoughNotationGroup>);
}

export function MobileTopNav({ }) {
    return <div className={lato.className + " opacityLink"} style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 24px'
    }}>
        <Link href='mailto:duncanpetrie1@gmail.com' style={{color: '#32ae5d'}}>EMAIL ME</Link>
        <Lonk href='https://instagram.com/probablyduncan' style={{color: '#fad549'}}>INSTAGRAM</Lonk>
    </div>;
}

export function MobileNav( props ) {
    
    const mobileNavMenu = () => {
        
    };

    return <div className={style.mobileNavContainer}>
        <nav className={style.mobileNav + " " + lato.className}>
        <Menurl {...props} menuFunction={mobileNavMenu} spread />
        </nav>
    </div>;
}

export function SimpleNav( props ) {

    const {scrollY} = useScroll();
    const color = useTransform(
        scrollY,
        [350, 450],
        ['#242626', props.galleryColor ?? '#6495ed']
    )

    const galleryName = props.galleryName === true || !props.galleryName ? 'GALLERY' : props.galleryName.toUpperCase();

    return <nav className={style.simpleNav + " " + lato.className}>
        <Menurl {...props} />
        {props.galleryAction && <motion.button style={{color}} whileHover={{rotate: 4}} whileTap={{rotate: 16}} onClick={props.galleryAction}>{galleryName}</motion.button>}
    </nav>;
}

function Menurl({ pageName = "menu", menuName = "menu", color, menuFunction, menuLink, spread }) {

    const {touch} = useContext(ViewportContext);

    const [hover, setHover] = useState(false);

    return (<div style={{
        display: 'flex',
        justifyContent: spread ? 'space-between' : 'flex-start',
    }}>
        <Link href={"/"} >DUNCANPETRIE.COM&nbsp;&nbsp;&nbsp;/</Link>
        {menuLink ? 
            <motion.span
                whileHover={{ x: spread ? -8 : 8 }} 
                whileTap={{x : spread ? -16 : 16 }}
                style={{color : color ?? "#6495ed"}} 
                onHoverStart={() => setHover(true)}
                onHoverEnd={() => setHover(false)}
            >
                <Lonk href={menuLink}>
                    &nbsp;&nbsp;&nbsp;&nbsp;{!touch && hover ? menuName?.toUpperCase() : pageName?.toUpperCase()}
                </Lonk>
            </motion.span>
        :
            <motion.button  
                whileHover={{ x: spread ? -8 : 8 }} 
                whileTap={{x : spread ? -16 : 16 }}
                style={{color : color ?? "#6495ed"}} 
                onClick={menuFunction}
                onHoverStart={() => setHover(true)}
                onHoverEnd={() => setHover(false)}
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{!touch && hover ? menuName?.toUpperCase() : pageName?.toUpperCase()}
            </motion.button>
        }
    </div>)
}