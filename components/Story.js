import Lonk from "./Lonk";
import style from "./section.module.css"
import { useContext, useState } from "react";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import { ViewportContext } from "@/pages/_app";
import { Paragraph, Title, Dept } from "@/components/TextStyles";
import Img from "./Img";
import { colors } from "@/data/colors";

export default function Story({ img, dept, title, text, link, route, color, children, background, annotateMap }) {

    const {mobile} = useContext(ViewportContext)
    const [hover, toggleHover] = useState(false);

    const className = mobile ? style.mobileStory + " " + style.story : style.story;
    color = color ?? (img != null ? img.color : colors.yellow);
    title = title ? (title.constructor === Array ? title.flatMap(x => [x, <br key={x}/>]) : title) : false;
    text = text ? (text.constructor === Array ? text : [text]) : false;
    
    const mapCircles = [
        [-235, -330, -235, -40],    // othlethin
        [-315, -270, -165, -100],   // south shoals
        [-115, -195, -355, -150],   // watermaw
        [-155, -70, -340, -320],    // wregedlek
        [-170, -345, -300, -20],    // glanestrion
        [-85, -280, -385, -80],     // dragons ?
        [-235, -240, -250, -130],   // nymris
        [-210, -215, -255, -140],   // eleafe
        [-420, -185, -70, -195],    // balmbight
        [-245, -80, -230, -280],    // cauldron
        [-239, -168, -270, -230],   // dunhole
        [-450, -285, -40, -95],     // haey
        [-310, -140, -175, -230]    // verventongue
    ];


    return (<div className={className} style={{backgroundColor: background ?? 'unset'}}>

        {/* image */}
        {img &&
            <RoughNotationGroup show={annotateMap && hover} >
                <Lonk href={route}>
                    <RoughNotation
                        type="box"
                        iterations={1}
                        strokeWidth={2}
                        color={colors.black}
                        animationDuration={200}
                        padding={mapCircles[Math.floor(Math.random() * mapCircles.length)]}
                    >
                        <Img 
                            img={img}
                            onMouseEnter={() => toggleHover(true)}
                            onMouseLeave={() => toggleHover(false)}
                        />
                    </RoughNotation>
                </Lonk>
            </RoughNotationGroup>
        }

        <div>

        {/* category */}
        {dept && 
            <Dept small={!mobile} color={color}>
                {dept.toUpperCase()}
            </Dept>
        }

        {/* title */}
        {title && 
            <Title small={!mobile}>
                <Lonk 
                    href={route}
                    onMouseEnter={() => toggleHover(true)}
                    onMouseLeave={() => toggleHover(false)}
                >
                    {title}
                </Lonk>
            </Title>
        }
        
        {/* build paragraph rows */}
        <RoughNotationGroup show={!mobile && route && hover} >
        {text && text.map((p, i) => {
            return (
                <Paragraph small={!mobile} key={`story-${i}`}>
                    <RoughNotation
                        type="highlight"
                        order={i}
                        iterations={1}
                        strokeWidth={1}
                        animationDuration={p.length * 2.5}
                        animationDelay={1000 + i * 100}
                        color={colors.highlight}
                        multiline={true}
                    >
                        {p}
                    </RoughNotation>
                </Paragraph>
            );
        })}
        </RoughNotationGroup>

        {/* bottom page link */}
        {route && link && 
            <Dept small={!mobile} margin={text ? '40px 0 20px 0' : null} color={mobile || hover ? color : "inherit"}
            >
                <RoughNotationGroup show={hover}>
                    <RoughNotation
                        type="circle"
                        color={color}
                        strokeWidth={1.5}
                        padding={[5, 8]}
                        iterations={1}
                        animationDuration={300}
                        onMouseEnter={() => toggleHover(true)}
                        onMouseLeave={() => toggleHover(false)}
                    >
                        <Lonk href={route} style={{
                            marginTop: text ? "40px" : "inherit"}}
                        >
                            {link.toUpperCase()}
                            <span 
                                style={{
                                    paddingLeft: hover ? '8px' : '2px' , 
                                    paddingRight: hover ? '4px' : '10px',
                                    transition: 'padding-left 0.2s, padding-right 0.2s'
                                }}
                            >&nbsp;&gt;</span>
                        </Lonk>
                    </RoughNotation>
                </RoughNotationGroup>
            </Dept>
        }

         </div>

         {children}

    </div>);
}