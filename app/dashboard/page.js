"use client"

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Shortner from "@/components/Shortner";
import UserUrls from "@/components/UserUrls";

export default function Dashboard() {
	const [linksCount, setLinksCount] = useState(null);
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push('/');
		}
	}, [status, router]);

	const refreshLinksCount = async () => {
		if (session?.user?.email) {
			const res = await fetch("/api/userlimit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userEmail: session.user.email }),
			});
			const result = await res.json();
			setLinksCount(result.linksCount);
		}
	};

	useEffect(() => {
		if (status === "authenticated") {
			refreshLinksCount();
		}
	}, [session, status]);

	if (status === "loading" || !session) {
		return null;
	}

	return (
		<div className="min-h-screen w-full bg-primary text-white px-4 md:px-0 pt-[14dvh] md:pt-[20dvh]">
			<div className="max-w-5xl mx-auto space-y-12">
				<Shortner onLinkCreated={refreshLinksCount} linksCount={linksCount} />
				<UserUrls userEmail={session.user.email} linksCount={linksCount} refreshLinksCount={refreshLinksCount} />
			</div>
		</div>
	);
}
