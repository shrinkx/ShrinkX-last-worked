import { redirect } from 'next/navigation'
import clientPromise from '@/lib/mongodb'
import { headers } from 'next/headers'
import { getDeviceType } from '@/lib/getDeviceType'

export default async function RedirectPage({ params }) {

	const { code } = params

	const client = await clientPromise
	const db = client.db('shrinkx')

	const result = await db.collection('urls').findOne({ code })

	if (result && result.original) {
		const now = new Date()
		const headerList = headers()

		const userAgent = getDeviceType();
		const ip =
			headerList.get('x-forwarded-for')?.split(',')[0] ||
			headerList.get('x-real-ip') ||
			'Unknown'

		await db.collection('urls').updateOne(
			{ code },
			{
				$inc: { totalClicks: 1 },
				$push: {
					clicks: {
						timestamp: now,
						date: now.toISOString().split('T')[0],
						userAgent,
						ip,
					},
				},
			}
		)

		redirect(result.original)

	}

	return (
		<div className="h-screen w-full flex items-center justify-center bg-gray-100">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-red-500">404 - Link Not Found</h1>
				<p className="mt-2 text-gray-600">The short link you followed does not exist.</p>
			</div>
		</div>
	)
	
}
