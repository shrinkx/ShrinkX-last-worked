import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import { use } from "react"

export async function POST(request) {
	try {

		const body = await request.json()
		const userEmail = body.userEmail

		if (!userEmail) {
			return NextResponse.json({ success: false, msg: "User email is required" }, { status: 400 })	
		}

		const client = await clientPromise
		const db = client.db('shrinkx')

		const linksCount = await db.collection('urls').countDocuments({ userEmail : userEmail })

		return NextResponse.json({
			success: true,
			linksCount: linksCount			
		})

	} catch(error){
		return Response.json({
			success: false,
			msg : error
		})
	}
}