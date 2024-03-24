import { getSpringtideMDX } from "@/lib/springtide/contentManager";

export default async function handler(req, res) {

    const mdx = await getSpringtideMDX(req.query.id);
    
    if (mdx && mdx.code) {
        res.status(200).json(mdx.code)
    };
}