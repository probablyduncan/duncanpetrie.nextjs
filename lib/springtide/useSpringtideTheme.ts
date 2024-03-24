import { useMemo } from "react";
import { useLocalStoredState } from "../localStorageHooks";

/**
 * exposes a theme stored in localstorage and a setter to update it 
 */
export default function useSpringtideTheme() {

    const [themeName, setThemeName] = useLocalStoredState<SpringtideTheme>('springtide.theme', SpringtideTheme.Earth)

    const themeData = useMemo(() => SPRINGTIDE_COLOR_DATA[themeName], [themeName]);

    return {
        theme: themeData,
        setTheme: setThemeName,
    }
}

export enum SpringtideTheme {
    Earth = 'earth',
    Slate = 'slate',
    Fire = 'fire',
    Sands = 'sands',
    Sea = 'sea',
}

export interface ThemeData {
    background: string,
    muted: string,
    text: string,
    menuAccent: string,
    linkAccent: string,
    errorAccent: string,
};

const SPRINGTIDE_COLOR_DATA: Record<SpringtideTheme, ThemeData> = {
    [SpringtideTheme.Earth]: {
        background: '#282828',
        muted: '#504945',
        text: '#E2D3B2',
        menuAccent: '#B8BB26',
        linkAccent: '#7EC9BF',
        errorAccent: '#FABD2F',
    },
    [SpringtideTheme.Slate]: {
        background: '#2D353B',
        muted: '#3D484D',
        text: '#859289',
        menuAccent: '#77B280',
        linkAccent: '#7FBBB3',
        errorAccent: '#E67E6E',
    },
    [SpringtideTheme.Fire]: {
        background: '',
        muted: '',
        text: '',
        menuAccent: '',
        linkAccent: '',
        errorAccent: '',
    },
    [SpringtideTheme.Sands]: {
        background: '',
        muted: '',
        text: '',
        menuAccent: '',
        linkAccent: '',
        errorAccent: '',
    },
    [SpringtideTheme.Sea]: {
        background: '',
        muted: '',
        text: '',
        menuAccent: '',
        linkAccent: '',
        errorAccent: '',
    },
};