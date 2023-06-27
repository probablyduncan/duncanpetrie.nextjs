import style from './section.module.css';
import Story from "./Story";
import { useEffect, useRef, useState } from "react";
import Magnifier from '@/components/Magnifier';
import Link from 'next/link';
import Img from './Img';
import Head from "next/head";
import { getSrc } from '@/lib/imageHelper';
import { LatoWrapper, MerriweatherWrapper } from './TextStyles';

//#region default

export default function Section( {type, children} ) {

    var sectionClass = " "
    switch(type) {
        case "three":
            sectionClass += style.three;
            break;
        case "four":
            sectionClass += style.four;
            break;
    }

    return (<section className={style.section + sectionClass}>{children}</section>);
}

//#endregion
//#region slideshow

export function SlideshowSection( props ) {

    const [img, setImg] = useState(0);
    const arrowLeft = useRef();
    const arrowRight = useRef();
    
    useEffect(() => {
        const keyDownHandler = (e) => {
            if (e.code === "ArrowLeft") {
                setImg(img > 0 ? img - 1 : props.images.length - 1);
                stylePress(arrowLeft.current);
            }
            if (e.code === "ArrowRight") {
                setImg(img < props.images.length - 1 ? img + 1 : 0);
                stylePress(arrowRight.current);
            }
        };

        // flash hover effect on keypress
        const stylePress = (e) => {
            e.classList.add(style.press);
            setTimeout(() => {
                e.classList.remove(style.press);
            }, 200);
        };

        document.addEventListener("keydown", keyDownHandler);
        return () => document.removeEventListener("keydown", keyDownHandler);
    }, [img, props.images.length]);

    return (<>
        <Head>
            {props.images.map(i => 
                // preload slideshow images
                <link key={`preload-${i.src}`} rel="preload" as="image" href={getSrc(i)} />
            )}
        </Head>
        <section className={style.slideshow + " " + style.section}>
            <div className={style.slideshowStory}>
                <Story { ...props.storyLeft } />
                <LatoWrapper className={style.slideshowArrows} div>
                    <button ref={arrowLeft} onClick={() => setImg(img > 0 ? img - 1 : props.images.length - 1)}>&lt;</button>
                    <span>{img + 1 + "/" + props.images.length}</span>
                    <button ref={arrowRight} onClick={() => setImg(img < props.images.length - 1 ? img + 1 : 0)}>&gt;</button>
                </LatoWrapper>
            </div>
            <div><Img img={props.images[img]} /></div>
            <Story { ...props.storyRight } />
        </section>
    </>);
}

//#endregion
//#region magnifier

export function MagnifierSection( props ) {

    if ( props.magStory.color == null ) props.magStory.color = props.img.color;

    return (<>
        <section className={style.map + " " + style.section}>
            <Magnifier 
                img={props.img}
                magImg={props.magImg}
            />
            <Story { ...props.magStory } />
            <Story { ...props.sideStory } />
        </section>
    </>);
}

//#endregion
//#region feature

export function FeatureSection( props ) {

    if ( props.story.color == null ) props.story.color = props.img.color;

    return (<>
        <section className={style.feature + " " + style.section}>
            <Story { ...props.story } />
            <div><Img img={props.img} /></div>
        </section>
    </>);
}

//#endregion
//#region footer

export function FooterSection({ pagenum }) {

    // maybe click on page number and get a site index? a list of page numbers? maybe the corner turns up and we can turn the page or whatever?

    return (<footer className={style.footer}>
        <div className={style.cmykWrapper}>
            <span className={style.cmyk + " " + style.c}></span>
            <span className={style.cmyk + " " + style.m}></span>
            <span className={style.cmyk + " " + style.y}></span>
            <span className={style.cmyk + " " + style.k}></span>
        </div>
        <LatoWrapper><button className={style.pagenum}><Link title='index' href="/i/all">{pagenum ?? "A1"}</Link></button></LatoWrapper>
    </footer>)
}

//#endregion
//#region mobile hero

export function MobileHero({ img }) {
    return (<MerriweatherWrapper div style={{padding: "0 20px"}}>
        {img && <Img img={img} />}
        <div style={{border: "none", margin: "40px 4px 120px 4px", fontSize: "30px"}}>
            <h2 style={{marginBottom: "20px"}} className={style.title}>Hello! I&apos;m<br/><Link className="opacityLink" href="/a/about" style={{textDecoration: "underline", color: "#F47665"}}>Duncan Petrie</Link>.</h2>
            <h2 className={style.title}>This is my<br/>website.</h2>
        </div>
    </MerriweatherWrapper>);
}

//#endregion