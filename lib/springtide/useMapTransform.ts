import { MutableRefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Vec2 from "../vec2";
import { clamp } from "../mathExtensions";
import { useGesture } from "@use-gesture/react";
import { ViewportContext } from "@/pages/_app";

const MAP_SIZE = Vec2.From(1200, 1500);
const MAP_ZOOM_FACTOR = 1.5;
const MAP_ZOOM_LEVELS = 8;

interface MapTransform {
    scale: number,
    translate: Vec2,
}

export type ZoomDirection = "in" | "out";

export default function useMapTransform({ onClickMapCoords, onClickViewportCoords } : { 
    onClickMapCoords?: (coords: Vec2) => void,
    onClickViewportCoords?: (coords: Vec2) => void,
}): {
    zoom: (direction: ZoomDirection) => void,
    goToCoords: (coords: Vec2) => void,
    getCurrentCenterCoords: () => Vec2,
    mapProps: {
        mapSize: Vec2,
        mapWindowRef: MutableRefObject<HTMLDivElement>,
        mapContainerRef: MutableRefObject<HTMLDivElement>,
        transform: MapTransform,
    }
} {

    const {viewport} = useContext(ViewportContext);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapWindowRef = useRef<HTMLDivElement>(null);

    // just the width/height of the window holding the map
    const mapWindowSize: Vec2 = useMemo(() => Vec2.From(mapWindowRef.current?.clientWidth, mapWindowRef.current?.clientHeight), [mapWindowRef.current?.clientWidth, mapWindowRef.current?.clientHeight, viewport]);
    
    // how far out can we zoom while always covering the full map window?
    const minScale: number = useMemo(() => {
        const widthConstraint = mapWindowSize.x / MAP_SIZE.x;
        const heightConstraint = mapWindowSize.y / MAP_SIZE.y;
        return Math.max(widthConstraint, heightConstraint);
    }, [mapWindowSize]);

    // this is important
    const [transform, setTransform] = useState<MapTransform>({
        scale: minScale,
        translate: Vec2.Zero,
    });

    // this is scalar value of the maximum map translation. Any more than mapBounds or any less than -mapBounds and there is a gap in the window
    const mapBounds: Vec2 = useMemo(() => MAP_SIZE.multiply(transform.scale).subtract(mapWindowSize).divide(2).abs(), [mapWindowSize, transform.scale]);

    // this is the distance from the center of the window to the edge of the window in map units
    const centerBounds: Vec2 = useMemo(() => mapWindowSize.divide(transform.scale * 2), [mapWindowSize, transform.scale]);

    // used to ensure scale is never too extreme and translation is never out of bounds
    const clampScale = (scale: number) => clamp(scale, minScale, minScale * MAP_ZOOM_LEVELS);
    const clampTranslate = (prev: Vec2, bounds?: Vec2) => prev.clamp((bounds ?? mapBounds).negate(), bounds ?? mapBounds);

    // ensure the map never reveals the background when changing window size
    useEffect(() => {
        setTransform(prev => ({
            scale: clampScale(prev.scale),
            translate: clampTranslate(prev.translate)
        }));
    }, [mapWindowSize]);

    /**
     * Handle zooming in or out, on mouse position if given, otherwise on center of map. Handles translation as well.
     * This is just a wrapper of setTransform().
     * @param direction "in" or "out"
     * @param mousePos WheelEvent's clientX and clientY of mouse position - i.e. mouse position in viewport
     * @param mouseContainerOffset WheelEvent's offsetX and offsetY of mouse position - i.e. mouse position on map, in map coords
     */
    const zoomAndTranslate = (direction: ZoomDirection, mousePos?: Vec2, mouseContainerOffset?: Vec2) => setTransform(prev => {

        // ---
        // calculate new scale
        // ---

        var zoomFactor = direction === 'in' ? MAP_ZOOM_FACTOR : 1/MAP_ZOOM_FACTOR;

        const newScale = prev.scale * zoomFactor;
        const clampedNewScale = clampScale(newScale);

        // if no change, no need to continue
        if (clampedNewScale === prev.scale) {
            return prev;
        }

        // ---
        // now calculate transform
        // ---

        // calculate translate bounds for new scale, so we can clamp translate
        const newBounds = MAP_SIZE.multiply(clampedNewScale).subtract(mapWindowSize).divide(2);

        // if no mouse position, modify the transform by the clamped zoom factor to go along with the zoom
        if (!mousePos || !mouseContainerOffset) {

            return {
                scale: clampedNewScale,
                translate: clampTranslate(prev.translate.multiply(clampedNewScale / prev.scale), newBounds),
            };
        }
        else {

            // get lerp factor for mouse position in map window
            const mouseWindowLerp = mousePos
                .subtract(Vec2.From(mapWindowRef.current.offsetLeft, mapWindowRef.current.offsetTop))
                .unlerp(Vec2.Zero, mapWindowSize);
    
            // get lerp factor for mouse position in map container
            const mouseContainerLerp = mouseContainerOffset.unlerp(Vec2.Zero, MAP_SIZE);
    
            // get distance between mouse pos and center of map window
            const mouseToWindowCenter = mouseWindowLerp.subtract(0.5).negate().multiply(mapWindowSize);
    
            // get width of map container using new scale
            const newContainerWidth = MAP_SIZE.multiply(clampedNewScale);
    
            // get distance between mouse and edge of the new map container
            const distanceToNewLeftContainerEdge = newContainerWidth.multiply(mouseContainerLerp);
    
            // get distance between mouse and the center of the new map container
            const mouseToNewContainerCenter = newContainerWidth.divide(2).subtract(distanceToNewLeftContainerEdge);
    
            // get translate amount
            const newTranslate = mouseToNewContainerCenter.subtract(mouseToWindowCenter);
    
            // get translate clamped by new bounds
            const clampedTranslate = clampTranslate(newTranslate, newBounds);

            return {
                scale: clampedNewScale,
                translate: clampedTranslate,
            }
        }
    });

    const coordsToTranslationPixels = (coords: Vec2): Vec2 => {

        // get coord position on map, from 0,0 in northwest to 1,1 in southeast
        const coordAmount = coords.unlerp(centerBounds, MAP_SIZE.subtract(centerBounds), true);

        // lerp coord amount between map bounds to get transform
        return coordAmount.lerp(mapBounds, mapBounds.negate(), true);
    }
    
    const translationPixelsToCoords = (pixels: Vec2): Vec2 => {

        // first, get transform amount from 0,0 in northwest to 1,1 in southeast
        const translateAmount = pixels.unlerp(mapBounds, mapBounds.negate(), true);

        // then, use that to lerp between centerbounds
        return translateAmount.lerp(centerBounds, MAP_SIZE.subtract(centerBounds), true);
    }

    useGesture({
        onDrag: ({ pinching, cancel, offset: [x, y], delta: [dx, dy], ...rest }) => {
            if (pinching) {
                return cancel();
            }

            setTransform(prev => ({translate: Vec2.From(x, y), scale: prev.scale}));
        },
        onWheel: ({event, offset: [, scroll], delta: [, dy], direction: [, dir], last, ...rest}) => {
            if (last) {
                return;
            }

            if (dir) {
                zoomAndTranslate(dir > 0 ? 'out' : 'in', Vec2.From(event.clientX, event.clientY), Vec2.From(event.offsetX, event.offsetY));
            }
        },
        onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo }) => {
            if (first) {
                const { width, height, x, y } = mapContainerRef.current!.getBoundingClientRect()
                const initX = ox - (x + width / 2)
                const initY = oy - (y + height / 2)
                memo = [x, y, initX, initY]
            }
    
            const x = memo[0] - (ms - 1) * memo[2]
            const y = memo[1] - (ms - 1) * memo[3]
            setTransform(prev => ({scale: s, translate: Vec2.From(x, y)}));
            return memo
        },
        onClick: ({event: {offsetX, offsetY, clientX, clientY}}) => {
            if (onClickMapCoords) {
                onClickMapCoords(Vec2.From(offsetX, offsetY));
            }
            if (onClickViewportCoords) {
                onClickViewportCoords(Vec2.From(clientX, clientY));
            }
        },
    }, {
        target: mapContainerRef,
        drag: {
            from: () => [transform.translate.x, transform.translate.y],
            preventScroll: true,
            filterTaps: true,
            bounds: { top: -mapBounds.y, bottom: mapBounds.y, left: -mapBounds.x, right: mapBounds.x, },
        },
    });

    const getCurrentCenterCoords = useCallback((): Vec2 => {
        return translationPixelsToCoords(transform.translate);
    }, [mapBounds, centerBounds, transform.translate]);

    const goToCoords = useCallback((coords: Vec2 = MAP_SIZE.divide(2)) => {
        setTransform(prev => ({translate: coordsToTranslationPixels(coords), scale: prev.scale}));
    }, [mapBounds, centerBounds, setTransform]);

    const zoom = useCallback((direction: ZoomDirection) => {
        zoomAndTranslate(direction);
    }, [setTransform, mapWindowSize, mapContainerRef.current, minScale, mapWindowSize, transform, mapBounds]);

    return {
        goToCoords,
        getCurrentCenterCoords,
        zoom,
        mapProps: {mapWindowRef, mapContainerRef, transform, mapSize: MAP_SIZE}
    };
}

