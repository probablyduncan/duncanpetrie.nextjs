import Vec2 from "@/lib/vec2";
import { a, useResize, useSpring } from "@react-spring/web";
import { MutableRefObject, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { useKeyPress } from "@/lib/useKeyPress";
import { GeistMono } from "geist/font/mono";
import useMapTransform from "@/lib/springtide/useMapTransform";
import style from '@/components/springtide/springtide.module.css';

interface MapTransform {
    scale: number,
    translate: Vec2,
}

export default function Test({ }) {

    const [cursor, setCursor] = useState('pointer');
    const { zoom, mapProps } = useMapTransform({ });

    useKeyPress(["ArrowUp"], 'keydown', () => zoom("in"), [zoom]);
    useKeyPress(["ArrowDown"], 'keydown', () => zoom("out"), [zoom]);

    return (<div className={GeistMono.className + " " + style.page} style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexFlow: 'row-reverse',
        overflow: 'hidden',
    }}>
        {/* sidebar */}
        <div style={{
            width: '400px',
            height: '100%',
            backgroundColor: '#282828',
            zIndex: 30,
            display: 'flex',
            borderLeft: '10px solid #504945',
            boxSizing: 'border-box',
        }}>
            {/* font styling */}
            <span className={GeistMono.className} style={{
                fontSize: '14px',
                color: '#E2D3B2',
                // fontStyle: 'oblique',
            }}>
                <p style={{margin: '10px',}}>Springtide, Daybreak, Tåsk, the center of the world.</p>
            </span>
        </div>

        <SpringtideMapWindow {...mapProps} >
            <div id="map-zoom-controls" style={{
                position: 'absolute', zIndex: 2,
                top: 10, left: 10,
                display: 'flex',
                flexFlow: 'column', gap: '10px'
            }}>
                <MapOverlay onClick={() => zoom('in')} width="30px" height="30px">+</MapOverlay>
                <MapOverlay onClick={() => zoom('out')} width="30px" height="30px">-</MapOverlay>
            </div>
        </SpringtideMapWindow>
    </div>);

}


function SpringtideMapWindow({ children, mapWindowRef, mapContainerRef, transform, mapSize }: {
    children: ReactNode, 
    mapWindowRef: MutableRefObject<HTMLDivElement>, 
    mapContainerRef:  MutableRefObject<HTMLDivElement>, 
    transform: MapTransform, 
    mapSize: Vec2,
}) {

    return (
        <div id="map-window" ref={mapWindowRef} style={{
            position: 'relative', overflow: 'hidden',
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1, flex: 1,
            backgroundColor: '#dde6f5',
            }}>

            {/* debug crosshairs */}
            {/* <svg style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, userSelect: 'none', pointerEvents: 'none'}} width="100%" height="100%" viewBox={`0 0 100 100`} version="1.1" xmlns="http://www.w3.org/2000/svg">
                <rect id='topleft 450' x={0} y={0} width={50} height={50} fillOpacity={0.1} />
                <rect id='topleft 450' x={50} y={50} width={50} height={50} fillOpacity={0.1} />
            </svg> */}

            <div id="overlays" style={{
                position: 'absolute', zIndex: 2,
                top: 0, left: 0,
            }}>
                {children}
            </div>

            <div id="labels" style={{
                position: 'absolute', zIndex: 2,
                top: 0, left: 0,
            }}>
                {/* <MapLabel id="midwicktown" title="Midwick Town" type={MapElementType.Town} />
                <MapLabel id="midwicktown" title="Midwick Town" type={MapElementType.Town} /> */}
            </div>

            <motion.div id="map-container" ref={mapContainerRef} style={{
                width: mapSize.x, height: mapSize.y,
                touchAction: 'manipulation',
                cursor: 'grab',
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

                {/* labels layer? */}
                {/* <div className={GeistMono.className} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}>
                    <motion.span id="task" title="Tåsk" style={{
                        display: 'inline-block',
                        textAlign: 'center',
                        transformOrigin: '0 0',
                        fontSize: '16px',
                        x: 806.6,
                        y: 592.2,
                    }} initial={{
                        scale: Math.min(1/transform.scale, 0.555)
                    }} animate={{
                        scale: Math.min(1/transform.scale, 0.555)
                    }} transition={{
                        ease: 'easeOut',
                        duration: '0.05',
                        bounce: '100',
                    }}>Tåsk</motion.span>
                </div> */}

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    width="100%" height="100%"
                    viewBox={`0 0 ${mapSize.x} ${mapSize.y}`}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                    }}
                >
                    
                    {/* regions */}
                    <MapElement id="wildermoor" title="The Wildermoor" cx={694.2} cy={539.7} rx={99.3} ry={56.3} scale={transform.scale} />
                    <MapElement id="ingle" title="The Ingle" d="m 867.90209,661.2662 -11.76162,10.75348 -9.07325,10.41744 2.35232,11.76162 14.78604,6.38488 7.39301,14.11394 v 13.1058 l -4.3686,12.76976 -14.78603,9.4093 -20.83487,3.69651 -13.7779,5.37674 -6.72092,11.08952 4.3686,17.13836 11.76162,12.09767 100.14178,3.69651 3.69651,-19.49069 -9.07325,-31.92439 -2.01627,-38.30928 -14.78604,-23.52323 z" scale={transform.scale} />
                    <MapElement id="cauldron" title="The Cauldron" d="m 819.17538,641.10343 -72.586,20.16277 -27.21974,24.19533 -6.38488,16.46627 -4.03256,35.62091 25.20347,38.98136 20.83487,2.01628 78.63483,4.03256 47.04647,-12.76976 20.49883,-29.57207 -2.01628,-33.26858 -46.71043,-45.7023 z" scale={transform.scale} />
                    <MapElement id="sanguinesea" title="The Sanguine Sea" d="m 845.21645,580.03187 -7.12862,-5.58409 -16.63344,-0.23762 -6.89099,5.70289 -9.74245,0.83168 -4.6336,1.06929 -7.96029,-9.50482 -16.98988,-3.08907 h -10.57411 l -1.54453,13.782 -8.55435,3.44549 -2.49501,-2.3762 -3.56431,6.65337 -13.54437,-8.91077 -14.61367,0.95048 -6.17813,7.48505 -5.34647,10.93055 -0.71287,17.70273 -11.6434,3.4455 1.42572,8.55434 -5.22765,10.93055 7.12862,6.65338 15.20772,-6.17814 10.33649,-7.36624 22.30228,-2.33244 6.09338,-2.65759 11.28698,5.94052 9.38602,6.53457 27.56399,-0.11882 4.87121,-15.44534 4.87123,-13.06913 14.25723,-0.47524 8.19791,-2.25739 15.08822,4.16164 5.46597,0.23433 -0.23763,-31.00948 z" scale={transform.scale} />

                    {/* smaller regions */}
                    <MapElement id="nor" title="Nor" cx={509} cy={344} r={15} scale={transform.scale} />
                    <MapElement id="islesofwick" title="The Isles of Wick" d="m 794.6848,696.46077 -9.50482,2.01977 -3.68312,3.32669 -4.27717,8.19791 -9.86126,22.57396 2.01978,5.70289 11.99984,1.54454 12.7127,15.56415 22.53072,5.80255 6.93423,-6.51542 -23.57118,-12.76912 -5.53734,-15.03248 -6.29695,-7.24743 z" scale={transform.scale} />
                    <MapElement id="midwick" title="Midwick" d="m 784.82355,716.30209 -4.99004,1.42572 0.23762,18.4156 7.72267,9.74244 10.69293,-3.56431 -4.15836,-15.68296 z" scale={transform.scale} />
                    <MapElement id="skerriesofingle" title="The Skerries of Ingle" d="m 917.07026,760.80875 -6.72093,6.72093 -10.41743,7.22499 -6.21686,3.02442 1.34419,9.74534 9.07325,5.04069 18.81859,2.01628 9.24127,-2.68837 1.51221,-8.90523 -7.05697,-22.68312 z" scale={transform.scale} />
                    <MapElement id="bigearly" title="Big Early" d="m 928.63019,782.82153 0.042,6.32187 -5.20871,1.82726 -10.22841,-1.4492 0.33604,-6.02783 7.79208,-1.74324 z" scale={transform.scale} />

                    {/* landmarks */}
                    <MapElement id="weewick" title="Weewick" d="m 804.42972,744.54212 -5.7623,0.23762 0.71286,6.17814 14.61367,9.38601 5.8217,-2.13858 3.50491,-3.56431 z" scale={transform.scale} />
                    <MapElement id="yorwick" title="Yorwick" d="m 770.97415,727.96023 -1.17616,10.2074 7.68705,1.17616 2.98242,-6.76293 -0.46207,-5.41874 z" scale={transform.scale} />
                    <MapElement id="bigwick" title="Bigwick" d="m 790.38082,699.77435 -2.9404,3.86453 -2.77239,4.3686 -3.52848,1.89026 -0.33605,5.50276 4.83067,1.34418 3.73851,-1.51221 5.25072,-18.69257 z" scale={transform.scale} />
                    <MapElement id="crookwick" title="Crookwick" d="m 785.92821,700.61446 -3.52849,2.81439 -1.05014,4.3686 3.23444,0.21003 4.49462,-6.5109 z" scale={transform.scale} />
                    <MapElement id="shipbreakbay" title="Shipbreak Bay" d="m 764.26936,569.69018 -2.3762,8.0791 1.1881,4.75241 -5.94051,2.13859 -4.03955,3.08907 1.90096,6.65337 4.27717,4.5148 18.29679,-0.71287 14.97009,-3.32668 10.93055,-7.60386 -4.75241,-7.60386 -6.65338,-7.36624 -10.69292,-2.13859 -12.35627,-1.42572 z" scale={transform.scale} />

                    {/* towns */}
                    {/* <MapTown id="midwicktown" title="Midwick Town" x={793.21} y={737.5} />
                    <MapTown id="coyo" title="Redbud-on-the-Coyo" x={787.55} y={733.688} />
                    <MapTown id="weewicktown" title="Weewick Town" x={812.22} y={752.41} />
                    <MapTown id="task" title="Tåsk" x={806.6} y={592.2} /> */}
                    <MapElement id="midwicktown" title="Midwick Town" cx={793.21} cy={737.5} r={2.5} scale={transform.scale} />
                    <MapElement id="coyo" title="Redbud-on-the-Coyo" cx={787.55} cy={733.688} r={2.5} scale={transform.scale} />
                    <MapElement id="weewicktown" title="Weewick Town" cx={812.22} cy={752.41} r={2.5} scale={transform.scale} />
                    <MapElement id="task" title="Tåsk" cx={806.6} cy={592.2} r={2.5} scale={transform.scale} />

                </svg>

                <img src="/images/bigmapW4.jpg" draggable="false" style={{
                    width: mapSize.x, height: mapSize.y,
                    display: 'block',
                    imageRendering: 'pixelated',
                    userSelect: 'none',
                    boxShadow: 'none',
                }} />
            </motion.div>
        </div>
    );
}

function MapOverlay({ children, onClick, width = 'auto', height = 'auto' }) {
    return (
        <motion.div id="map-zoom-in" style={{
            width, height,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#FBF1C7', backgroundColor: '#50494566',
            boxShadow: '0 0 4px #28282840',
            fontSize: '20px', fontWeight: 600, userSelect: 'none',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
        }} onClick={onClick} whileHover={onClick ? {
            backgroundColor: '#504945bb',
        } : {}} transition={{
            duration: 0.1
        }}>
            {children}
        </motion.div>
    );
}

function MapElement(props) {

    const additionalProps = {
        style: {
            fillOpacity: 0.2,
        },
    };

    const TextComponent = () => false && props['cx'] && (
        <foreignObject x={props['cx'] - 60} y={props['cy'] - 30} width="120" height="60">
            <motion.div style={{
                width: 120 + 'px',
                height: 60 + 'px',
                userSelect: 'none',
                pointerEvents: 'none',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
                {/* for font related stuff */}
                <motion.span style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }} initial={{
                    fontSize: 24/props.scale + 'px',
                }} animate={{
                    fontSize: 24/props.scale + 'px',
                }}>
                    {props.title}
                </motion.span>
            </motion.div>
        </foreignObject>
    );

    if (props['d'] !== undefined) {
        return <><TextComponent/><path {...props} {...additionalProps} /></>
    }

    if (props['r'] !== undefined) {
        return <><TextComponent/><circle {...props} {...additionalProps} /></>
    }

    if (props['rx'] !== undefined) {
        return <><TextComponent/><ellipse {...props} {...additionalProps} /></>
    }
}

function MapTown({ id, title, x, y}: {
    id: string,
    title: string,
    x: number,
    y: number,
}) {
    return (<>
        <text id={id} x={x} y={y}><tspan>{title}</tspan></text>
    </>);
}