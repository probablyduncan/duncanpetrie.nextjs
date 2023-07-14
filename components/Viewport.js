import { useEffect, useState, useRef } from "react";
import { GaramondWrapper } from "./TextStyles";
import { motion } from "framer-motion";
import { colors, getGradientBackgroundCSS, gradients } from "@/data/colors";
import { ViewportContext } from "@/pages/_app";

// modeled after https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
// ViewportContext lives in _app.js so I can fest-refresh here

export function ViewportProvider({ children }) {

    // (my definition of mobile is < 1360px)
    const [mobile, setMobile] = useState();

    useEffect(() => {

        // if query matches, then we are on mobile
        const mobileQuery = window.matchMedia(`(max-width: 1360px)`);
    
        // function to update mobile state
        const updateMobile = () => setMobile(mobileQuery.matches);
    
        // update once at start
        updateMobile();
    
        // when the query updates, update state as well
        mobileQuery.addEventListener('change', updateMobile);
        return () => {
            mobileQuery.removeEventListener('change', updateMobile);
        }
    }, []);

    const [viewport, setViewportSize] = useState({width: 1920, height: 1080});
    // const [width, setWidth] = useState(1920);
    // const [height, setHeight] = useState(1080);
    useEffect(() => {

        const updateViewportSize = (e) => { 
            
            // if (width != window.innerWidth) setWidth(window.innerWidth);
            // if (height != window.innerHeight) setHeight(window.innerHeight);
            setViewportSize({width: window.innerWidth, height: window.innerHeight}); 
        }
        
        updateViewportSize();
        
        window.addEventListener('resize', updateViewportSize);
        return () => { window.removeEventListener('resize', updateViewportSize); }

    }, [])


    const dialogRef = useRef();

    const showModal = () => {
        
        if (!dialogRef.current) return;

        document.body.style.backgroundColor = colors.offWhite;
        dialogRef.current.showModal();
    }
    const closeModal = () => {
        
        if (!dialogRef.current) return;

        document.body.style.backgroundColor = colors.white;
        dialogRef.current.close();
    }

    useEffect(() => {

        const dialogKeyHandler = (e) => {
            if (e.code === 'Escape') closeModal();
            else if (e.code === 'Backquote') showModal();
            // else if (e.code === "ArrowLeft") previousImage();
            // else if (e.code === "ArrowRight") nextImage();
            
        }
        
        window.addEventListener('keydown', dialogKeyHandler);
        window.addEventListener('wheel', closeModal);

        return () => { 
            window.removeEventListener('keydown', dialogKeyHandler);
            window.removeEventListener('wheel', closeModal);
        };

    }, []);

    // return the context provider with mobile bool
    return (
        <ViewportContext.Provider value={{mobile, viewport}}>
            <Loading loadOnDefined={mobile}/>
            <motion.dialog id="lightbox" ref={dialogRef} style={{
                zIndex: 1000, 
                color: colors.black, 
                padding: '8px 12px',
                border: `2px solid ${colors.black}`, 
                borderRadius: '20px',
                boxShadow: `inset 0 0 8px ${colors.black}55`,
                ...getGradientBackgroundCSS(...gradients.purpleGreen),
            }}>
                <GaramondWrapper style={{fontWeight: 'semi-bold'}}><button onClick={closeModal}>Close.</button></GaramondWrapper>
            </motion.dialog>
            {children}
        </ViewportContext.Provider>
    );
}

function Loading({ loadOnDefined }) {
    return (<div style={{
        zIndex: '100',
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw', height: '100vh',

        backgroundColor: colors.white,
        transition: 'opacity 1s',
        opacity: loadOnDefined == undefined ? '1' : '0',

        pointerEvents: 'none'
    }}>
        
    </div>);
}