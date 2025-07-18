import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

// Helper to get <title> from any webpage
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

export async function PUT(request) {
	try {
		const body = await request.json()
		const { id, alias, url, userEmail } = body

		if (!id || !url || !userEmail) {
			return NextResponse.json({ success: false, msg: "Missing required fields" }, { status: 400 })
		}

		const client = await clientPromise
		const db = client.db("shrinkx")

		const urlDoc = await db.collection("urls").findOne({ _id: new ObjectId(id), userEmail })

		if (!urlDoc) {
			return NextResponse.json(
				{ success: false, msg: "URL not found or not owned by the user" },
				{ status: 404 }
			)
		}

		// Check for alias conflict
		if (alias !== urlDoc.code) {
			const existingAlias = await db.collection("urls").findOne({ code: alias })
			if (existingAlias) {
				return NextResponse.json({ success: false, msg: "Alias already exists" }, { status: 400 })
			}
		}

		// Fetch updated title if URL changed
		const newTitle = url !== urlDoc.original ? await getTitleFromURL(url) : urlDoc.title

		await db.collection("urls").updateOne(
			{ _id: new ObjectId(id), userEmail },
			{ $set: { code: alias, original: url, title: newTitle, updatedAt: new Date() } }
		)

		return NextResponse.json({
			success: true,
			shortCode: alias,
			fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/r/${alias}`,
			title: newTitle
		})

	} catch (error) {
		console.error("Edit error:", error)
		return NextResponse.json({
			success: false,
			msg: error.message || "Something went wrong"
		}, { status: 500 })
	}
}
