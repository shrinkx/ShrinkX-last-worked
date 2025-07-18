import clientPromise from "@/lib/mongodb"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

async function getTitleFromURL(url) {
	try {
		const res = await fetch(url)
		const html = await res.text()
		const match = html.match(/<title>(.*?)<\/title>/i)
		return match ? match[1] : "No Title Found"
	} catch {
		return "No Title Found"
	}
}

export async function POST(request) {
	try {
		const body = await request.json()
		const original = body.original
		const userEmail = body.userEmail
		const alias = body.alias

		if (!original || !original.startsWith("http")) {
			return NextResponse.json({ success: false, msg: "Invalid URL" }, { status: 400 })
		}

		if (!userEmail) {
			return NextResponse.json({ success: false, msg: "User email is required" }, { status: 400 })
		}

		const client = await clientPromise
		const db = client.db('shrinkx')

		const title = await getTitleFromURL(original)
		const createdAt = new Date()
		const code = alias !== '' ? alias : nanoid(6)

		// Check if alias is already used
		if (alias !== '') {
			const existingAlias = await db.collection('urls').findOne({ code: alias })
			if (existingAlias) {
				return NextResponse.json({ success: false, msg: "Alias already exists" }, { status: 400 })
			}
		}

		await db.collection('urls').insertOne({
			code,
			original,
			userEmail,
			title,
			createdAt
		})

		return NextResponse.json({
			success: true,
			shortCode: code,
			fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/r/${code}`,
			title
		})

	} catch (error) {
		return NextResponse.json({
			success: false,
			msg: error.message || "Something went wrong"
		}, { status: 500 })
	}
}
