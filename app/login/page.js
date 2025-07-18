"use client";

export const dynamic = 'force-dynamic';

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignInPage() {
	const { data: session, status } = useSession();

	// Auto-redirect if not logged in
	useEffect(() => {
		if (status === "unauthenticated") {
			signIn();
		}
	}, [status]);

	// Handle postMessage and window close after successful submission
	useEffect(() => {
		if (status === "authenticated") {
			if (window.opener) {
				window.opener.postMessage({ type: "LOGIN_SUCCESS" }, window.location.origin);
				window.close();
			}
		}
	}, [status]);

	return (
		<div className="w-full min-h-[100dvh] flex justify-center items-center bg-black py-16 px-8">
			<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
				<div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
			</div>
		</div>
	);
}
