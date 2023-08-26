import Head from "next/head";
import { useContext } from "react";
import { ViewportContext } from "@/pages/_app";
import {NewsNav, MobileNav, SimpleNav} from "./Navbar";
import { colors } from "@/data/colors";
import { useRouter } from "next/router";
import { getSrc } from "@/lib/imageHelper";
import { imgData } from "@/data/images";

export default function Layout({ title, children, newsNav, color, pageName, menuName, menuLink, galleryAction, galleryName, galleryColor }) {

    const {mobile} = useContext(ViewportContext);

    title = title ? title + ' - ' : '';

    return (<>
        <HeadData title={title}/>
        {!mobile && newsNav && <NewsNav />}
        {!mobile && !newsNav && <SimpleNav color={color} pageName={pageName} menuName={menuName} menuLink={menuLink} galleryAction={galleryAction} galleryName={galleryName} galleryColor={galleryColor} />}
        <main className={!mobile ? 'content ' : 'mobileContent '} style={{
            paddingTop: !newsNav || mobile ? 'inherit' : '20px', 
            backgroundColor: newsNav ? colors.white : 'unset',
        }}>
            {children}
            {mobile && <MobileNav color={color} pageName={pageName} menuName={menuName} menuLink={menuLink} />}
        </main>
    </>);
}

function Menu({ bottom, show }) {

    const {mobile} = useContext(ViewportContext);

    return (<div style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0', left: '0',
        backgroundColor: 'green',
        opacity: '0.2',
        zIndex: '100'
    }}>
        
    </div>);
}

export function HeadData({ title }) {

    const router = useRouter();
    
    return (<Head>
        <title>{`${title}DuncanPetrie.com`}</title>
        <meta name="author" content="Duncan Petrie" />
        <meta name="description" content="Photographer, Writer, Developer | On the hunt for plants and birds and rocks and things." />
        <meta name="keywords" content="Duncan, Petrie, Photography, Writing, Abstract, Impressionist, Street, Lingermyth, Yearn, Yearning, Wildlife, Wisconsin, Milwaukee, Falmouth, Lake Michigan, water, blur, icm, intentional, camera, movement, probablyduncan, ProbablyDuncan, Worldbuilding, Map Making, Software, Development, Origami, Design, Web" />

        {/* open graph stuff - https://ogp.me/ */}
        <meta property="og:title" content={`${title}DuncanPetrie.com`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://duncanpetrie.com${router.asPath}`} />
        <meta property="og:description" content="Photographer, Writer, Developer | On the hunt for plants and birds and rocks and things." />
        <meta property="og:image" content="https://duncanpetrie.com/images/29.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1000" />
        <meta property="og:image:height" content="667" />

        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-128.png" sizes="128x128" />
        <link rel="icon" href="/favicon-180.png" sizes="180x180" />
        <link rel="icon" href="/favicon-192.png" sizes="192x192" />
        
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Head>)
}