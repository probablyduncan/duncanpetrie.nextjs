import { useEffect } from "react";

type KeyEventType = 'keydown' | 'keyup';

/**
 * @param key reference https://www.w3.org/TR/uievents-key/#named-key-attribute-values
 * @param onKeyDown called when onKeyDown is triggered for key 
 */
export function useKeyPress(keys: string[], event: KeyEventType, callback: () => void, dependencies = []): void {

    const eventHandler = (e: KeyboardEvent) => {
        if (keys.includes(e.key)) {
            callback();
        }
    }

    useEffect(() => {

        if (!document) {
            return;
        }

        document.addEventListener(event, eventHandler);
        return () => document.removeEventListener(event, eventHandler);

    }, dependencies);
}