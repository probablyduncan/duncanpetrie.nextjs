import { getWikiCardCode } from "@/lib/dataParser";

// https://nextjs.org/docs/pages/building-your-application/routing/api-routes
// returns mdx code for rendering mdx
export default async function handler(req, res) {

    const code = await getWikiCardCode(req.query.id);
    if (code) res.status(200).json(code);
}