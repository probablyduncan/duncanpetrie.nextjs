import { createContext, useEffect, useState } from "react";
import useSWR from 'swr';
import { addToLocalStorage, getDateNumber, getSectionSelector, getWikiAPIKey } from "./wikihelper";
import { useMotionValueEvent, useScroll } from "framer-motion";

export const WikiContext = createContext();

export function useHeadings(textRef, updateOn) {

    const [headings, setHeadings] = useState([]);
    const [current, setCurrent] = useState('');

    useEffect(() => {

        const headingsQuery = Array.from(textRef.current.querySelectorAll(`.heading1, .heading2, .heading3`));

        if (headingsQuery.length > 0) {
            
            const tempHeadings = headingsQuery.map(h => ({
                title: h.getAttribute('alt'), 
                id: h.id, 
                level: parseInt(h.classList[0].at(-1)),
                offset: 20,

            }));
            
            tempHeadings.unshift({
                id: '',
                level: 0,
                offset: 40,
            });

            setHeadings(tempHeadings);
        }
        else {
            setHeadings([])
        }

    }, [textRef, updateOn]);

    const {scrollY} = useScroll();
    useMotionValueEvent(scrollY, 'change', (scroll) => {
        
        if (!textRef.current || !headings || headings.length < 2) return;
        let newCurrent = '';

        headings.forEach(h => {
            if (h.id !== '' && textRef.current.querySelector(`#${h.id}`)?.offsetTop + textRef.current.offsetTop - 120 < scroll)
                newCurrent = h.id;
        });

        if (current != newCurrent) {
            setCurrent(newCurrent);
        }
    })

    return {headings, currentHeading: current};
}

const fetcher = (...args) => fetch(...args).then(res => res.json());
export function useFetchWikiCode(data, checkCache = true) {
    
    // initially set to true to avoid fetching immediately
    const [code, setCode] = useState(data.code ?? true);
    
    const { data: codeFromFetch, error, isLoading } = useSWR(() => code ? null : getWikiAPIKey(data.id), fetcher);

    useEffect(() => {
        
        // this will only run once
        if (code === true) {

            // first, try get from localstorage
            const inCache = checkCache && localStorage.getItem(getWikiAPIKey(data.id));
            if (inCache) {

                const cacheJSON = JSON.parse(inCache);
                if ('code' in cacheJSON && 'expiration' in cacheJSON && cacheJSON.expiration > getDateNumber() ) {

                    // if unexpired code in cache, use it
                    setCode(cacheJSON.code);
                    return;
                }
            }

            // if not in cache, set to false
            setCode(data.code ?? false);


        } else if (!isLoading && !error && codeFromFetch) {

            // if we've successfully fetched code, use it and cache it
            setCode(codeFromFetch);
            addToLocalStorage(data.id, codeFromFetch);

            // now it's done loading, scroll to it
        }

    }, [codeFromFetch, data.code, data.id, error, isLoading, checkCache]);

    if (code && code !== true) return code;
}