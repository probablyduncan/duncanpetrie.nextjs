import fs from 'fs';
import path from 'path';
import { bundleMDX } from 'mdx-bundler';
import matter from 'gray-matter';

const dir = path.join(process.cwd(), 'data', 'springtide');

export async function getSpringtideMDX(id: string): Promise<{
    frontmatter: any,
    code: string,
}> {
    const fullPath = path.join(dir, `${id}.mdx`);
    const contents = fs.readFileSync(fullPath, 'utf8');

    const { code, frontmatter } = await bundleMDX({
        source: contents,
        globals: {},    // add custom component names to bundle here
    });
    
    return { frontmatter, code };
}

export interface SpringtideLocation {
    id: string,
    title: string,
    priority: number,
    related?: string[],
    d?: string,
    x?: number,
    y?: number,
    r?: number,
    rx?: number,
    ry?: number,
}

export async function getSpringtideFrontmatter(): Promise<SpringtideLocation[]> {
    const filenames = fs.readdirSync(dir);
    const data = filenames.map((fileName) => {
        const fileContents = fs.readFileSync(path.join(dir, fileName), 'utf8');
        const matterResult = matter(fileContents);

        const id = fileName.replace(/\.mdx$/,'');
        return {
            id,
            ...matterResult.data,
        } as SpringtideLocation;
    });

    data.sort((a, b) => b.priority - a.priority);

    return data;
}