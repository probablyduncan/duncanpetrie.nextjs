import { useContext, useRef } from "react";
import { Caption, Dept, Paragraph, Subtitle, Title } from "./TextStyles";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArticleContext } from "@/pages/a/[a]";
import { ViewportContext } from "./Viewport";

export function ArticleTitle({ children, ...props }) {
    return <ArticleSlideIn><Title {...props}>{children}</Title></ArticleSlideIn>
}

export function ArticleSubtitle({ children, ...props }) {
    return <ArticleSlideIn><Subtitle {...props}>{children}</Subtitle></ArticleSlideIn>
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

    const inView = useInView(ref, {once: true});
    
    const { scrollY } = useScroll();
    const x = useTransform(
        scrollY,
        [640, 820],
        [640, textCentered ? 460 : 640]
    )

    return <motion.div ref={ref} style={{
        width: mobile ? 'auto' : `${textWidth}px`,
        x: mobile ? 0 : (!slideIn || inView ? x : 820),
        opacity: inView ? 1 : 0,
        transition: 'transform 0.5s, opacity 0.5s',
    }}>
        {children}
    </motion.div>
}