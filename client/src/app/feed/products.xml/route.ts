import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export async function GET() {
    try {
        const res = await fetch(`${BASE_URL}/feed/products.xml`, { cache: "no-store" });
        const xml = await res.text();

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=300, s-maxage=300",
            },
        });
    } catch (error) {
        console.error("[feed/products.xml] Failed to fetch feed:", error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><catalog><error>Feed temporarily unavailable</error></catalog>`,
            {
                status: 500,
                headers: { "Content-Type": "application/xml; charset=utf-8" },
            }
        );
    }
}
