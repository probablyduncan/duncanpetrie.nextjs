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


    const dialogRef = useRef();

    const showDialog = () => {
        
        if (!dialogRef.current) return;

        document.body.style.backgroundColor = colors.offWhite;
        dialogRef.current.showModal();
    }
    const hideDialog = () => {
        
        if (!dialogRef.current) return;

        document.body.style.backgroundColor = colors.white;
        dialogRef.current.close();
    }

    useEffect(() => {

        showDialog();

        const dialogKeyHandler = (e) => {
            // if (e.code === "ArrowLeft") previousImage();
            // if (e.code === "ArrowRight") nextImage();
            if (e.code === "Escape") {
                hideDialog();
            } else if (e.code === "Backquote") {
                showDialog();
            }
        }
        
        window.addEventListener('keydown', dialogKeyHandler);
        window.addEventListener('scroll', hideDialog);
        return () => { 
            window.removeEventListener("keydown", dialogKeyHandler) 
            window.addEventListener('scroll', hideDialog);

        };

    }, []);

    // return the context provider with mobile bool
    return (
        <ViewportContext.Provider value={{mobile}}>
            <motion.dialog ref={dialogRef} style={{
                zIndex: 1000, 
                color: colors.black, 
                padding: '8px 12px',
                border: `2px solid ${colors.black}`, 
                borderRadius: '20px',
                boxShadow: `inset 0 0 8px ${colors.black}55`,
                ...getGradientBackgroundCSS(...gradients.purpleGreen),
            }}>
                <GaramondWrapper style={{fontWeight: 'semi-bold'}}>Hello.</GaramondWrapper>
            </motion.dialog>
            {children}
        </ViewportContext.Provider>
    );
}