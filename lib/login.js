import { getSession } from "next-auth/react";

export const login = async () => {
	const popup = window.open("/login", "Login", "width=500,height=600");

	const handleMessage = async (event) => {
		if (event.origin !== window.location.origin) return;
		if (event.data.type === "LOGIN_SUCCESS") {
			console.log("User logged in via popup!");
			await getSession();
		}
	};

	window.addEventListener("message", handleMessage);

	const pollPopup = setInterval(() => {
		if (popup?.closed) {
			clearInterval(pollPopup);
			window.removeEventListener("message", handleMessage);
		}
	}, 500);
};
