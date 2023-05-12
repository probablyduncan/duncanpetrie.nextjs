import { useEffect, useMemo, useState } from "react";

export function useRand() {
    const [randState, setRandState] = useState(0.5);
    useEffect(() => setRandState(Math.random()), []);
    return useMemo(() => randState, [randState]);
}