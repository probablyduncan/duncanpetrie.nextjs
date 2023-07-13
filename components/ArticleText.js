import { useContext, useRef } from "react";
import { Caption, Dept, LinkHeading3, Paragraph, Subtitle, Title } from "./TextStyles";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { ArticleContext } from "@/pages/a/[a]";
import { ViewportContext } from "@/pages/_app";

export function ArticleTitle({ children, ...props }) {
    return <ArticleSlideIn><Title {...props}>{children}</Title></ArticleSlideIn>
}

export function ArticleSubtitle({ children, ...props }) {
    return <ArticleSlideIn><LinkHeading3 go >{children}</LinkHeading3></ArticleSlideIn>
}

export function ArticleDept({ children, ...props }) {
    return <ArticleSlideIn><Dept {...props}>{children}</Dept></ArticleSlideIn>
}

export function ArticleCaption({ children, ...props }) {
    return <ArticleSlideIn><Caption {...props}>{children}</Caption></ArticleSlideIn>
}

export function ArticleText({ children, ...props }) {
    return <ArticleSlideIn><Paragraph {...props}>{children}</Paragraph></ArticleSlideIn>
}


function ArticleSlideIn({ children }) {
    const { textCentered, textWidth, slideIn } = useContext(ArticleContext);
    const { mobile } = useContext(ViewportContext);
    
    const ref = useRef();

    // if centered: x is 460 when in view, 640 otherwise

    // if not centered: x is always 640

    const inView = useInView(ref, {once: true});
    
    const { scrollY } = useScroll();
    const x = useTransform(
        scrollY,
        [640, 820],
        [640, inView ? 460 : 640]
    )
    const springX = useSpring(x, { stiffness: 200, damping: 40 });

    return <motion.div ref={ref} initial={{
        x: mobile !== false ? 0 : 640,
    }} style={{
        width: mobile ? 'auto' : `${textWidth}px`,
        x: mobile !== false ? 0 : (textCentered ? (slideIn ? springX : x) : 640),
        // opacity: !slideIn || inView ? 1 : 0,
        // transition: 'opacity 0.5s',
    }} >
        {children}
    </motion.div>
}

function HeadingLink({ children, name }) {

    const id = name.replace(' ', '');

    return (<div id={id} style={{padding: '120px 0 0 0',
    margin: '-80px 0 20px 0'}}>
        <motion.a 
            href={`#${id}`}
            title="#"
            whileHover={{
                opacity: 0.8
            }}
        >
            {children}
        </motion.a>
    </div>);
}