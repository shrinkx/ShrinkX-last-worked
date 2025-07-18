import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

// DELETE route
export async function DELETE(request) {
	try {
		const body = await request.json()
		const { code, userEmail } = body

		const client = await clientPromise
		const db = client.db("shrinkx")

		const result = await db.collection("urls").deleteOne({ code, userEmail: userEmail })

		if (result.deletedCount === 0) {
			return NextResponse.json({ success: false, msg: "No link found to delete" }, { status: 404 })
		}

		return NextResponse.json({ success: true, msg: "Link deleted successfully" })

	} catch (error) {
		return NextResponse.json({ success: false, msg: error.message }, { status: 500 })
	}
}
