import { useRouter } from "next/router";
import useSpringtideTheme, { ThemeData, SpringtideTheme } from "@/lib/springtide/useSpringtideTheme";
import style from '@/components/springtide/springtide.module.css';
import { FunctionComponent, createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewportContext } from "../_app";
import { useLocalStoredState } from "@/lib/localStorageHooks";
import { useGesture } from "@use-gesture/react";
import Vec2 from "@/lib/vec2";
import { clamp } from "@/lib/mathExtensions";
import { AnimatePresence, motion } from "framer-motion";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import { useKeyPress } from "@/lib/useKeyPress";
import { SpringtideLocation, getSpringtideFrontmatter } from "@/lib/springtide/contentManager";
import useSWR from "swr";
import { getMDXComponent } from "mdx-bundler/client";

enum SidebarState {
    Selected,
    Menu,
}

enum MapCursor {
    Auto = 'auto',
    Pointer = 'pointer',
    Move = 'move',
    Grab = 'grab',
    Grabbing = 'grabbing',
}

// determines scale of container. 
// larger is better so we don't have to use scale > 1 too much.
const MAP_SIZE = Vec2.From(4800, 6000);

// svg viewport, determines coordinates of regions
const SVG_SCALE = Vec2.From(1200, 1500);

const MAP_ZOOM_LEVELS = 8;

interface MapTransform {
    scale: number,
    translate: Vec2,
}

type ZoomDirection = "in" | "out";

interface MapElement {
    title: string;
    id: string;
    types: MapElementType[];
}

enum MapElementType {
    Town,
    Landmark,
    Region,
    Culture,
}

const SpringtideContext = createContext<{theme: ThemeData}>(null);
export default function SpringtideMap({locationData}: {locationData: SpringtideLocation[]}) {

    const {query: {x, y}} = useRouter();
    const parseQueryCoord = (n: string|string[]): number => typeof n === 'string' ? parseFloat(n) : parseFloat(n[0]);
    useEffect(() => {
        if (x && y) {
            setTransform(prev => ({scale: prev.scale, translate: coordsToTranslationPixels(Vec2.From(parseQueryCoord(x), parseQueryCoord(y)))}));
        }
    }, [x, y]);

    const { viewport: {width: vw, height: vh} } = useContext(ViewportContext);
    const useMobileLayout = useMemo(() => vw < 600 && vw <= vh, [vw, vh]);
    
    const { theme, setTheme } = useSpringtideTheme();
    
    const [cursor, setCursor] = useState<MapCursor>(MapCursor.Auto);
    const [selected, setSelected] = useState<MapElement[]>([]);
    const [hoveringOver, setHoveringOver] = useState<string[]>([]);
    const [sidebarState, setSidebarState] = useState<SidebarState>(SidebarState.Selected)
    const [sidebarWidth, setSidebarWidth] = useLocalStoredState<number>('springtide.sidebarwidth', 400);
    const isSidebarOpen = useMemo(() => (sidebarState === SidebarState.Menu || selected?.length > 0), [sidebarState, selected]);

    //#region  map transform stuff

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapWindowRef = useRef<HTMLDivElement>(null);

    // just the width/height of the window holding the map
    const mapWindowSize: Vec2 = useMemo(() => Vec2.From(mapWindowRef.current?.clientWidth, mapWindowRef.current?.clientHeight), [mapWindowRef.current?.clientWidth, mapWindowRef.current?.clientHeight, vw, vh, sidebarState]);
    
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
     * zooms the map in or out by a fixed amount
     * @param direction 'in' or 'out'
     * @param mousePos probably not necessary
     * @param mouseContainerOffset probably not necessary
     */
    const zoomAndTranslateDir = (direction: ZoomDirection, mousePos?: Vec2, mouseContainerOffset?: Vec2): void => zoomAndTranslate(direction == 'in' ? 300 : -300, mousePos, mouseContainerOffset);

    /**
     * Handle zooming in or out, on mouse position if given, otherwise on center of map. Handles translation as well.
     * This is just a wrapper of setTransform().
     * @param scrollAmount from wheelEvent, will be 200-300 ish on mouse wheel and 1-4 ish on trackpad scroll
     * @param mousePos WheelEvent's clientX and clientY of mouse position - i.e. mouse position in viewport
     * @param mouseContainerOffset WheelEvent's offsetX and offsetY of mouse position - i.e. mouse position on map, in map coords
     */
    const zoomAndTranslate = (scrollAmount: number, mousePos?: Vec2, mouseContainerOffset?: Vec2): void => setTransform(prev => {

        // ---
        // calculate new scale
        // ---

        var zoomFactor = 1 - Math.abs(scrollAmount / 1000);
        if (scrollAmount < 0) {
            zoomFactor = 1/zoomFactor;
        }

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

        if (!mousePos || !mouseContainerOffset) {

            // if no mouse position, modify the transform by the clamped zoom factor to go along with the zoom
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

    function getMapElementsAtPoint(viewportCoords: Vec2): MapElement[] {
        const elements: Element[] = document.elementsFromPoint(viewportCoords.x, viewportCoords.y);
        const stopIndex = elements.findIndex(e => e.id === 'map-container');
    
        if (stopIndex === -1) {
            return [];
        }
    
        return elements.slice(0, stopIndex).map(e => createMapElement(e)).filter(e => e.id);
    }
    
    function createMapElement(element: Element): MapElement {
        const mapElement: MapElement = {
            id: element.id,
            title: element.attributes['title']?.value ?? element.attributes['data-title']?.value,
            types: element.attributes['types']?.value.split(',') ?? element.attributes['data-types']?.value.split(','),
        };
    
        return mapElement;
    }

    // prevent default gesture events for map container
    useEffect(() => {
        const handler = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', handler)
        document.addEventListener('gesturechange', handler)
        document.addEventListener('gestureend', handler)
        return () => {
          document.removeEventListener('gesturestart', handler)
          document.removeEventListener('gesturechange', handler)
          document.removeEventListener('gestureend', handler)
        }
      }, [])

    // map container gestures
    useGesture({
        onDrag: ({ pinching, cancel, offset: [x, y] }) => {

            if (pinching) {
                return cancel();
            }

            setCursor(MapCursor.Move);

            setTransform(prev => ({translate: Vec2.From(x, y), scale: prev.scale}));
        },
        onWheel: ({ event, delta: [, dy], direction: [, dir], last, pinching, dragging, ctrlKey }) => {

            // don't think this is necessary?
            // if (last) {
            //     return;
            // }

            if (dir) {
                // ctrlKey is true when mimicking pinch on touchpad. It's pretty slow so inflate it here
                zoomAndTranslate(dy * (ctrlKey ? 4 : 1), Vec2.From(event.clientX, event.clientY), Vec2.From(event.offsetX, event.offsetY));
            }
        },
        onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo, wheeling, dragging, canceled, ctrlKey }) => {

            if (dragging || wheeling || ctrlKey || canceled) {
                return;
            }

            const zoom = clamp(memo[0] * ms, 0.6, 1.5);
            zoomAndTranslate(zoom, Vec2.From(ox, oy), null);

            return memo;
        },
        onClick: ({ event: {clientX, clientY, offsetX, offsetY} }) => {
            setSelected(getMapElementsAtPoint(Vec2.From(clientX, clientY)));
            // setTransform(prev => ({scale: prev.scale, translate: coordsToTranslationPixels(Vec2.From(offsetX, offsetY))}));
        },
        onMouseUp: () => {
            setCursor(MapCursor.Auto);
        },
        onMouseMove: ({event: {clientX, clientY}}) => {
            // setHoveringOver(getMapElementsAtPoint(Vec2.From(clientX, clientY)).map(e => e.title));
        },
        onMouseLeave: () => {
            // setHoveringOver([]);
        }
    }, {
        target: mapContainerRef,
        drag: {
            from: () => [transform.translate.x, transform.translate.y],
            preventScroll: true,
            filterTaps: true,
            bounds: { top: -mapBounds.y, bottom: mapBounds.y, left: -mapBounds.x, right: mapBounds.x, },
        },
        pinch: {
            // scaleBounds: { min: minScale, max: minScale * MAP_ZOOM_LEVELS},
            preventDefault: true,
        },
        wheel: {
            preventDefault: true,
        }
    });

    useKeyPress(["Escape"], "keydown", () => setSelected([]));

    //#endregion

    return (<SpringtideContext.Provider value={{ theme: theme }}>
        
            <div className={style.page + ' ' + GeistMono.className} style={{
            width: '100vw', height: '100vh', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            cursor: cursor,
            fontWeight: 'bold',
        }}>
            {(false && useMobileLayout) ? <>
                mobile!
            </> : <div style={{
                display: 'flex', flexFlow: 'row',
                width: '100%', height: '100%',
            }}>
                {/* map window */}
                <div id="map-window" ref={mapWindowRef} style={{
                    position: 'relative', overflow: 'hidden',
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, flex: 1,
                    backgroundColor: '#dde6f5',
                }}>

                    {/* overlays */}
                    <div id="overlays" style={{
                        position: 'absolute', zIndex: 2,
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        pointerEvents: 'none',
                    }}>
                        <div id="map-zoom-controls" style={{
                            position: 'absolute', zIndex: 2,
                            top: 10, left: 10,
                            display: 'flex',
                            flexFlow: 'column', gap: '10px'
                        }}>
                            <motion.div id="map-zoom-in" style={{
                                width: 30, height: 30,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                color: theme.text, backgroundColor: theme.muted + '99',
                                boxShadow: `0 0 4px ${theme.background}40`,
                                fontSize: '20px', fontWeight: 600, 
                                userSelect: 'none', WebkitUserSelect: 'none',
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                backdropFilter: 'blur(4px)',
                            }} onClick={
                                () => zoomAndTranslateDir('in')
                            } whileHover={{
                                backgroundColor: theme.muted + 'bb'
                            }} transition={{
                                duration: 0.1
                            }}>
                                +
                            </motion.div>
                            <motion.div id="map-zoom-in" style={{
                                width: 30, height: 30,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                color: theme.text, backgroundColor: theme.muted + '99',
                                boxShadow: `0 0 4px ${theme.background}40`,
                                fontSize: '20px', fontWeight: 600, 
                                userSelect: 'none', WebkitUserSelect: 'none',
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                backdropFilter: 'blur(4px)',
                            }} onClick={
                                () => zoomAndTranslateDir('out')
                            } whileHover={{
                                backgroundColor: theme.muted + 'bb'
                            }} transition={{
                                duration: 0.1
                            }}>
                                -
                            </motion.div>
                        </div>

                        <motion.div id="map-bottom-bar" style={{
                            position: 'absolute', zIndex: 2,
                            bottom: 0,
                            width: 'calc(100% - 20px)',
                            padding: '4px 10px 5px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            color: theme.text, backgroundColor: theme.muted + '99',
                            fontSize: '18px', fontWeight: 600, 
                            userSelect: 'none', WebkitUserSelect: 'none',
                            boxShadow: `0 0 4px ${theme.background}40`,
                            backdropFilter: 'blur(4px)',
                            pointerEvents: 'auto',
                        }}>
                            <Link href={'/'}>&lt; Home</Link>
                            <span>{hoveringOver && hoveringOver.length > 0 ? hoveringOver.join(' / ') : 'Springtide'}</span>
                            <button onClick={() => {
                                setSelected([]);
                                setSidebarState(isSidebarOpen ? SidebarState.Selected : SidebarState.Menu);
                            }}>{isSidebarOpen ? "Close" : "Menu"} &gt;</button>
                        </motion.div>
                    </div>
                    {/* end overlays */}

                    {/* map container */}
                    <motion.div id="map-container" ref={mapContainerRef} style={{
                        width: MAP_SIZE.x, height: MAP_SIZE.y,
                        touchAction: 'none',
                    }} initial={{
                        scaleX: transform.scale,
                        scaleY: transform.scale,
                        scaleZ: transform.scale,
                        x: transform.translate.x,
                        y: transform.translate.y,
                    }} animate={{
                        scaleX: transform.scale,
                        scaleY: transform.scale,
                        scaleZ: transform.scale,
                        x: transform.translate.x,
                        y: transform.translate.y,
                    }} transition={{
                        ease: 'easeOut',
                        duration: '0.05',
                        bounce: '100',
                    }}>

                        <img src="/images/bigmapW4.jpg" draggable="false" style={{
                            width: MAP_SIZE.x, height: MAP_SIZE.y,
                            display: 'block',
                            imageRendering: 'pixelated',
                            userSelect: 'none', WebkitUserSelect: 'none',
                            boxShadow: 'none',
                        }} />

                        {/* svg layers */}
                        {/* <svg
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                            width="100%" height="100%"
                            viewBox={`0 0 ${MAP_SIZE.x} ${MAP_SIZE.y}`}
                            style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%', height: '100%',
                            }}
                        > */}

                        <SVGLayers locationData={locationData} />

                        {/* </svg> */}
                        {/* end svg layers */}
                        
                    </motion.div>
                    {/* end map container */}
                </div>
                {/* end map window */}

                {/* sidebar window */}
                <AnimatePresence>
                    {isSidebarOpen && <motion.div key="sidebar" id="sidebar" style={{
                        backgroundColor: theme.background,
                        color: theme.text,
                        overflowY: 'scroll',
                        paddingBottom: vh/2 - 80 + 'px',
                        borderLeft: '10px solid ' + theme.muted,
                        // hyphens: 'auto',
                        // msHyphens: 'auto',
                        // WebkitHyphens: 'auto',
                    }} initial={{
                        width: 0,
                        opacity: 0,
                    }} animate={{
                        width: Math.min(sidebarWidth, vw/2) + 'px',
                        opacity: 1,
                    }} exit={{
                        width: 0,
                        opacity: 0,
                    }} transition={{
                        duration: 0.2,
                    }}>
                        {selected.map(e => <div key={e.id}>
                            <SpringtideHeaderBar>
                                <span>{e.title}</span>
                                <span style={{fontSize: '16px'}}>TOWNS</span>
                            </SpringtideHeaderBar>
                            <MDXWrapper id={e.id} />
                            <div style={{height: '80px'}}/>
                        </div>)}
                    </motion.div>}
                </AnimatePresence>
            </div>}

        </div>
    </SpringtideContext.Provider>);

}

const SVGLayers = memo(function SVGLayers({ locationData }: { locationData: SpringtideLocation[] }) {

    // const getSvgElements = useCallback(() => {
    //     return () => <>{locationData.map((e: SpringtideLocation) => <MapElement key={e.id} id={e.id} title={e.title} d={e.d} cx={e.x} cy={e.y} rx={e.rx} ry={e.ry} r={e.r} />)}</>;
    // }, [locationData]);

    // const SvgElements = useMemo(() => getSvgElements(), [getSvgElements]);

    return <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="100%" height="100%"
        viewBox={`0 0 ${SVG_SCALE.x} ${SVG_SCALE.y}`}
        style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
        }}
    >
        {/* <SvgElements /> */}
        {locationData.map((e: SpringtideLocation) => <MapElement key={e.id} id={e.id} title={e.title} d={e.d} cx={e.x} cy={e.y} rx={e.rx} ry={e.ry} r={e.r} />)}
    </svg>;
});

function MapElement(props) {

    const additionalProps = {
        style: {
            fillOpacity: 0.2,
            cursor: MapCursor.Pointer,
        },
    };

    if (props['d'] !== undefined) {
        return <path {...props} {...additionalProps} />
    }

    if (props['r'] !== undefined) {
        return <circle {...props} {...additionalProps} />
    }

    if (props['rx'] !== undefined) {
        return <ellipse {...props} {...additionalProps} />
    }
}

export async function getStaticProps({ params }): Promise<{ props: {
    locationData: SpringtideLocation[],
}}> {
    return {props: {
        locationData: await getSpringtideFrontmatter(),
    }}
}

function MDXWrapper({ id }) {

    const code = useFetchSpringtideLocation({id: id});

    return <>{code && <MDX code={code} />}</>;
}

function MDX({ code }) {
    const MDXCode = useMemo(() => getMDXComponent(code), [code]);
    return <MDXCode components={{p: SpringtideP, h2: SpringtideH2, h3: SpringtideH3, a: SpringtideLink, em: SpringtideEm}} />
}


const fetcher = (args) => fetch(args).then(res => res.json());
function useFetchSpringtideLocation(data) {
    
    // initially set to true to avoid fetching immediately
    const [code, setCode] = useState(data.code ?? true);
    
    const { data: codeFromFetch, error, isLoading } = useSWR(() => code ? null : `/api/springtide?id=${data.id}`, fetcher);

    useEffect(() => {
        
        // this will only run once
        if (code === true) {

            setCode(data.code ?? false);


        } else if (!isLoading && !error && codeFromFetch) {

            // if we've successfully fetched code, use it and cache it
            setCode(codeFromFetch);

            // now it's done loading, scroll to it
        }

    }, [codeFromFetch, data.code, data.id, error, isLoading]);

    if (code && code !== true) {
        return code;
    }
}

function SpringtideHeaderBar({ children }) {
    
    const { theme } = useContext(SpringtideContext);

    return <div style={{
        width: 'calc(100% - 60px)',
        color: theme.background, backgroundColor: theme.text,
        fontSize: '20px', fontWeight: '800',
        userSelect: 'none', WebkitUserSelect: 'none',
        padding: '6px 30px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0,
    }}>
        {children}
    </div>
}

function SpringtideH2({ children }) {

    const { theme } = useContext(SpringtideContext);

    return <h2 id={children.replace(' ', '-').toLowerCase()} style={{
        color: theme.menuAccent,
        margin: '30px 30px 30px',
        fontSize: '20px',
    }}>
        # {children}
    </h2>
}

function SpringtideH3({ children }) {
    const { theme } = useContext(SpringtideContext);
    return <h2 id={children.replace(' ', '-').toLowerCase()} style={{
        color: theme.menuAccent,
        margin: '20px 30px 0',
    }}>
        {children}
    </h2>
}

function SpringtideP({ children }) {
    return <p style={{
        margin: '20px 30px 0',
        lineHeight: '24px',
    }}>{children}</p>
}

function SpringtideLink({ children, href }) {
    const { theme } = useContext(SpringtideContext);

    var click: () => void;
    var valid = false;
    if (href === '#') {
        // this is a link to somewhere further down the page
        const id = children.replace(' ', '-').toLowerCase();
        if (document.getElementById(id)) {
            valid = true;
            click = () => {
                console.log(id)
                document.getElementById('sidebar').scrollTo({top: document.getElementById(id).offsetTop - 55, behavior: 'smooth'})};
        }
        
    }

    return (
        <a onClick={click} style={{
            color: valid ? theme.linkAccent : theme.errorAccent,
            whiteSpace: 'nowrap',   // prevent trailing commas from starting on next line
        }}>
            {children}
        </a>
    );
}

function SpringtideEm({ children }) {
    return <em style={{fontWeight: '700'}}>
        {children}
    </em>
}

function SpringtideString({ children }) {
    return <strong style={{fontWeight: '900'}}>
        {children}
    </strong>
}