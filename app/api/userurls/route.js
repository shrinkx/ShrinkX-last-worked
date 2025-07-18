import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function POST(request) {
	try {

		const body = await request.json()
		const userEmail = body.userEmail

		const client = await clientPromise
		const db = client.db('shrinkx')

		const links = await db.collection("urls")
			.find({ userEmail: userEmail })
			.sort({ createdAt: -1 }) // newest first
			.toArray()

		return NextResponse.json({
			success: true,
			urls: links
		})

	} catch (error) {
		return Response.json({
			success: false,
			msg: error,
		})
	}
}