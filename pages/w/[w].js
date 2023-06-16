import Layout from "@/components/Layout";
import { getWorldCard, getWorldCardIDs } from "@/lib/dataParser";
import { getMDXComponent } from "mdx-bundler/client";
import { Caption, Dept, Paragraph, Subtitle, Title, UnderLonk } from "@/components/TextStyles";
import { useMemo } from "react";

export async function getStaticPaths() {
    const paths = await getWorldCardIDs();
    return {
        paths,
        fallback: false
    };
}

export async function getStaticProps( {params} ) {
    const card = await getWorldCard(params.w);
    return {
        props: {
            card
        }
    };
}

export default function World({ card }) {

    return(<Layout title={card.frontmatter.title ?? card.w ?? "World"} pageName='world' color='#DBE76F' menuName='back to map' menuLink='/world'>
        <div style={{marginTop: '80px'}}>
            <Card w={card.w} key={card.w} code={card.code} frontmatter={card.frontmatter} />
        </div>
    </Layout>)
}

function Card({ w, code, frontmatter }) {
    
    const Content = useMemo(() => getMDXComponent(code), [code]);
    if (frontmatter.backlinks && frontmatter.backlinks.constructor !== Array) frontmatter.backlinks = [frontmatter.backlinks];
    
    return (<div id={w} style={{
        backgroundColor: 'none',
        padding: '40px 300px 80px 400px',
        marginBottom: '160px',
    }}>
        {frontmatter.dept && <Dept color={frontmatter.color ?? '#FFBA5E'}>{frontmatter.dept.toUpperCase()}</Dept>}
        <Title>{frontmatter.title}</Title>
        <Content components={{h1: Title, h2: Subtitle, h3: Dept, h4: Caption, p: Paragraph, a: UnderLonk}} />
    </div>);
}