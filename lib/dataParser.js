import fs from 'fs';
import path from 'path';
import { bundleMDX } from 'mdx-bundler';
import matter from 'gray-matter';

const articleDir = path.join(process.cwd(), 'data', 'articles');

// returns article id, frontmatter, and jsx
export async function getArticle(a) {
    const fullPath = path.join(articleDir, `${a}.mdx`);
    const contents = fs.readFileSync(fullPath, 'utf8');

    const { code, frontmatter } = await bundleMDX({
        source: contents,
        globals: {'ArticleImage': 'ArticleImage', 'LightboxLink': 'LightboxLink'}
    });
    
    return { a, frontmatter, code };

}

// returns paths for all articles
export async function getArticleIDs() {
    const filenames = fs.readdirSync(articleDir);
    return filenames.map((fileName) => {
        return {
            params: { 
                a: fileName.replace(/\.mdx$/, '')
            }
        };
    });
}

// returns frontmatter for all articles
export async function getArticleData() {
    const filenames = fs.readdirSync(articleDir);
    const data = filenames.map((fileName) => {
        const fileContents = fs.readFileSync(path.join(articleDir, fileName), 'utf8');
        const matterResult = matter(fileContents);

        const id = fileName.replace(/\.mdx$/,'');
        return {
            id,
            ...matterResult.data,
        };
    });

    return data;
}

const worldDir = path.join(process.cwd(), 'data', 'world');

// get single world card data
export async function getWorldCard(w) {
    const contents = fs.readFileSync(path.join(worldDir, `${w}.mdx`), 'utf8');
    const { code, frontmatter } = await bundleMDX({
        source: contents,
        globals: {}
    });

    return { w, frontmatter, code };
}

// array of data of all cards in params
export async function getWorldCards(w) {

    let data = [];

    for(let i = 0; i < w.length; i++) {
        const contents = fs.readFileSync(path.join(worldDir, `${w[i]}.mdx`), 'utf8');
        const { code, frontmatter } = await bundleMDX({
            source: contents,
            globals: {'WorldLink': 'WorldLink'}
        });

        data.push({ w: w[i], code, frontmatter});
    };

    return data;
}

// generate all single routes as well as all potential pairs of routes
export async function getWorldCardPaths() {

    const filenames = fs.readdirSync(worldDir).map(f => f.replace(/\.mdx$/,''));
    let paths = [];

    for (let i = 0; i < filenames.length; i++) {
        paths.push({ params: { w: [filenames[i]] } });
        for (let j = 0; j < filenames.length; j ++) {
            if (i != j) {
                paths.push({ params: { w: [filenames[i], filenames[j]] } });
            }
        }
    }

    return paths;
}