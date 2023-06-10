import { Lato, Merriweather, EB_Garamond, Cinzel_Decorative } from "@next/font/google";
import { useContext, useState } from "react";
import { RoughNotation } from "react-rough-notation";
import Lonk from "./Lonk";
import { motion } from "framer-motion";
import { ViewportContext } from "./Viewport";

/**
 * font wrappers
 */
const merriweather = Merriweather({ subsets: ['latin'], variable: true, weight: '700' });
export function MerriweatherWrapper({ children, div, ...props }) {
    return <FontWrapper fontClass={merriweather.className} {...props} div={div}>{children}</FontWrapper>;
}
const garamond = EB_Garamond({subsets: ['latin'], display: 'swap', variable: true, weight: '500'});
export function GaramondWrapper({ children, div, ...props }) {
    return <FontWrapper fontClass={garamond.className} {...props} div={div}>{children}</FontWrapper>;
}
const lato = Lato({ subsets: ['latin'], display: 'swap', weight: '700', variable: true});
export function LatoWrapper({ children, div, ...props }) {
    return <FontWrapper fontClass={lato.className} {...props} div={div}>{children}</FontWrapper>;
}
const cinzel = Cinzel_Decorative({ subsets: ['latin'], display: 'swap', weight: '700' });
export function CinzelWrapper({ children, div, ...props }) {
    return <FontWrapper fontClass={cinzel.className} {...props} div={div}>{children}</FontWrapper>;
}

export function FontWrapper({ children, div, className, fontClass, style }) {
    return div ? (<div className={fontClass + ' ' + className} style={style}>{children}</div>) : (<span className={fontClass + ' ' + className} style={style}>{children}</span>);
}

export function Title({ children, small, ...props }) {
    return (<h1 className={merriweather.className} style={{
        color: '#242626',
        fontSize: small ? '23px' : '36px',
        lineHeight: small ? '32px' : '40px',
        margin: small ? '0 0 6px 0' : '0 4px 25px 4px'
    }} {...props}>{children}</h1>);
}

export function Subtitle({ children, small, ...props }) {
    return (<h1 className={merriweather.className} style={{
        color: '#242626',
        fontSize: small ? '20px' : '30px',
        lineHeight: small ? '37px' : '40px',
        margin: small ? '0 0 6px 0' : '0 4px 25px 4px'
    }} {...props}>{children}</h1>);
}

export function Dept({ children, small, color, margin, ...props }) {
    return (<h3 className={lato.className} style={{
        color: color ?? '#242626',
        fontSize: small ? '13px' : '16px',
        margin: margin ?? (small ? '0' : '25px 4px 0 4px')
    }} {...props} >{children}</h3>);
}

export function Paragraph({ children, small, ...props }) {
    return (<p className={garamond.className} style={{
        color: '#444a4a',
        fontSize: small ? '16px' : '20px',
        lineHeight: small ? '30px' : '48px',
        textAlign: small ? 'justify' : 'left',
        margin: small ? '0 10px 15px 0' : '0 4px 25px 4px',
        hyphens: small ? 'auto' : 'none',
        msHyphens: small ? 'auto' : 'none',
        WebkitHyphens: small ? 'auto' : 'none',
    }} {...props}>{children}</p>);
}

export function Caption({ children, small, textAlign, color, ...props }) {
    return (<h4 className={garamond.className} style={{
        color: color ?? '#737878',
        fontSize: '18px',
        lineHeight: '27px',
        textAlign: textAlign ?? 'right',
        margin: '12px 4px 0 4px',
    }} {...props}>{children}</h4>);
}

export function UnderLonk({ href, action, noUnderline, color, children, ...props }) {

    const {mobile} = useContext(ViewportContext);
    const [hover, setHover] = useState(false);

    const duration = children.length * 15 ?? 100;
    color = color ?? '#6495ed';

    return (
        <Underline show={!noUnderline && (hover)} duration={duration} color={color}>
            {action ? 
                <button onClick={action} {...props} style={{color}}
                    onMouseEnter={() => setHover(true)} 
                    onMouseLeave={() => setHover(false)}
                >
                    {children}
                </button>
            :
                <Lonk href={href} {...props} style={{color}} 
                    onMouseEnter={() => setHover(true)} 
                    onMouseLeave={() => setHover(false)}
                >
                    {children}
                </Lonk>
            }
        </Underline>
    );
}

function Underline({ show, duration, color, children }) {
    return (
        <RoughNotation 
            show={show}
            padding={-1.5}
            strokeWidth={1.5}
            color={color}
            iterations={1}
            animationDuration={duration}
            multiline
        >
            {children}
        </RoughNotation>
    );
}

export function LightboxText({ color, children, noSelect }) {
    return (<h4 className={garamond.className} style={{
        color: color ?? '#737878',
        fontSize: '18px',
        lineHeight: '27px',
        textAlign: 'right',
        margin: '12px 4px 0 4px',
        transition: 'none',
        userSelect: noSelect ? 'none' : 'auto'
    }}>{children}</h4>);
}

export function LightboxButton({ action, hoverColor, children }) {
    return (<motion.button 
        whileHover={{color: hoverColor ?? '#242626'}} 
        initial={{color: '#737878', userSelect: 'inherit'}} 
        onClick={action}
    >
        {children}                              
    </motion.button>);
}