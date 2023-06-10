import Layout from "@/components/Layout";
import { getWorldCards, getWorldCardPaths } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { useRouter } from 'next/router';
import { useMemo } from "react";
import style from "@/components/world.module.css";
import text from "@/components/text.module.css";
import { UnderLonk } from "@/components/TextStyles";

export async function getStaticPaths() {
    const paths = await getWorldCardPaths();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps(context) {
    const data = await getWorldCards(context.params.w);
    return {
        props: {
            data
        }
    };
}

export default function World({data}) {
    
    const router = useRouter();
    const keys = router.query.w;

    return(<Layout title={`${data[0].frontmatter.title ?? data[0].w ?? "World"} - DuncanPetrie.com`} pagename='world' color='#DBE76F'>
        <div className={style.wrapper}>
            {data.map(d => {
                return <Card w={d.w} key={d.w} code={d.code} frontmatter={d.frontmatter} />
            })}
        </div>
    </Layout>)
}

function Card({ w, code, frontmatter }) {
    
    const MDXContent = useMemo(() => getMDXComponent(code, {WorldLink: WorldLink}), [code]);
    if (frontmatter.backlinks && frontmatter.backlinks.constructor !== Array) frontmatter.backlinks = [frontmatter.backlinks];
    
    return (<div id={w} className={style.card + ' ' + text.textContainer} style={{backgroundColor: 'none'}}>
        <h2>
            {frontmatter.backlink && 
                <WorldLink current={w} target={frontmatter.backlink} noUnderline style={{fontStyle: 'normal', textDecoration: 'none', color: frontmatter.color ? frontmatter.color : '#6495ED'}}>
                    {frontmatter.backlink.toUpperCase()}&nbsp;&nbsp;&lt;
                </WorldLink>
            }
        </h2>
        <h1>
            {frontmatter.title}
        </h1>
        <MDXContent />
    </div>);
}

export function WorldLink({ current, target, children, ...props }) {
    
    return (
        <UnderLonk href={`/w/${current}/${target}#${target}`} scroll={false} {...props}>
            {children}
        </UnderLonk>
    );
}