import Head from "next/head";
import { useContext } from "react";
import { ViewportContext } from "./Viewport";
import {NewsNav, MobileNav, SimpleNav} from "./Navbar";

export default function Layout({ title, children, newsNav, color, pageName, menuName, menuLink, galleryAction, galleryName, galleryColor }) {

    const {mobile, setMobile} = useContext(ViewportContext);

    return (<>
        <Head>
            <title>{title ?? "DuncanPetrie.com"}</title>
            <meta name="author" content="Duncan Petrie" />
            <meta name="description" content="Abstract/Impressionist Photography | On the hunt for plants and birds and rocks and things" />
            <meta name="keywords" content="Duncan, Petrie, Photography, Abstract, Impressionist, Impressionism, Wildlife, Wisconsin, Milwaukee, Falmouth, Lake Michigan, water, blur, icm, intentional, camera, movement, probablyduncan" />

            <link rel="icon" href="/favicon-32.png" sizes="32x32" />
            <link rel="icon" href="/favicon-128.png" sizes="128x128" />
            <link rel="icon" href="/favicon-180.png" sizes="180x180" />
            <link rel="icon" href="/favicon-192.png" sizes="192x192" />
            
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Loading loadOnDefined={mobile} />
        {!mobile && newsNav && <NewsNav />}
        {!mobile && !newsNav && <SimpleNav color={color} pageName={pageName} menuName={menuName} menuLink={menuLink} galleryAction={galleryAction} galleryName={galleryName} galleryColor={galleryColor} />}
        <main className={!mobile ? 'content ' : 'mobileContent '} style={{
            paddingTop: !newsNav || mobile ? 'inherit' : '20px', 
            backgroundColor: newsNav ? '#fff' : 'unset',
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

function Loading({ loadOnDefined }) {
    return (<div style={{
        zIndex: '100',
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw', height: '100vh',

        backgroundColor: 'white',
        transition: 'opacity 1s',
        opacity: loadOnDefined == undefined ? '1' : '0',

        pointerEvents: 'none'
    }}>
        
    </div>);
}