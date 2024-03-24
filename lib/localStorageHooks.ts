import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useStateBackupInLocalStorage(key: string, stateValue: any) {
    useEffect(() => {
        if (localStorage) {
            localStorage.setItem(key, stateValue);
        }
    }, [stateValue])
}

export function useLocalStoredState<T>(key: string, defaultValue: T = null): [T, Dispatch<SetStateAction<T>>]  {
    
    // store in-app state
    const [stateValue, setStateValue] = useState<T>(defaultValue);

    // prevent overwriting stored state before it can be fetched
    const [hasFetched, setHasFetched] = useState(false);

    // when page loads, try to grab previous state value from storage
    useEffect(() => {
        if (localStorage) {
            const fromStorage = localStorage.getItem(key);
            if (fromStorage !== null) {
                setStateValue(JSON.parse(fromStorage));
            }
            setHasFetched(true);
        }
    }, []);

    // when state value changes, update in localstorage
    useEffect(() => {
        if (hasFetched && localStorage) {
            localStorage.setItem(key, JSON.stringify(stateValue));
        }
    }, [stateValue, key, hasFetched]);

    // return state accessors to mimic useState
    return [stateValue, setStateValue];
}