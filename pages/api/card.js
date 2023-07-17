import { getWorldCard } from "@/lib/dataParser";
import { getMDXComponent, getMDXExport } from "mdx-bundler/client";

// https://nextjs.org/docs/pages/building-your-application/routing/api-routes
export default async function handler(req, res) {

    const card = await getWorldCard(req.query.id);

    if (card) res.status(200).json({ data: card});
}