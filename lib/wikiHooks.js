import { createContext, useEffect, useState } from "react";
import useSWR from 'swr';
import { addToLocalStorage, getWikiAPIKey } from "./wikihelper";

export const WikiContext = createContext();

export function useHeadings(sectionRef) {

    const [headings, setHeadings] = useState([]);

    useEffect(() => {

        const headingsQuery = Array.from(sectionRef.current.querySelectorAll(`.heading1, .heading2, .heading3`));

        if (headingsQuery.length > 0) {
            
            const tempHeadings = headingsQuery.map(h => ({
                title: h.getAttribute('alt'), 
                id: h.id, 
                level: parseInt(h.classList[0].at(-1)),
                offset: 20,
            }));
            
            tempHeadings.unshift({
                title: 'Top',
                id: '',
                level: 0,
                offset: 40,
            });

            setHeadings(tempHeadings);
        }

    }, [sectionRef.current])

    return headings;
}

const fetcher = (...args) => fetch(...args).then(res => res.json());
export function useFetchWikiCode(data) {
    
    const id = data.id;

    // initially set to true to avoid fetching immediately
    const [code, setCode] = useState(data.code ?? true);
    
    const { data: codeFromFetch, error, isLoading } = useSWR(() => code ? null : getWikiAPIKey(id), fetcher);

    useEffect(() => {
        
        if (code === true) setCode(data.code ?? false);
        
        else if (!isLoading && !error && codeFromFetch) {
            setCode(codeFromFetch);
            addToLocalStorage(id, codeFromFetch);
        }

    }, [codeFromFetch, data.code, error, id, isLoading]);

    if (code && code !== true) return code;
}