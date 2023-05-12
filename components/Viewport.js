import { useEffect, useState, createContext } from "react";

// modeled after https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/

export const ViewportContext = createContext();

export function ViewportProvider({ children }) {

    // (my definition of mobile is < 1360px)
    const [mobile, setMobile] = useState();
    const [touch, setTouch] = useState();

    useEffect(() => {
        // set whether user can hover, this won't change so don't worry about updating
        setTouch(matchMedia(`(hover: none)`).matches);

        // if query matches, then we are on mobile
        const mobileQuery = matchMedia(`(max-width: 1360px)`);
    
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

    // return the context provider with mobile bool
    return <ViewportContext.Provider value={{mobile, setMobile, touch}}>{children}</ViewportContext.Provider>;
}