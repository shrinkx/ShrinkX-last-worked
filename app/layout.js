import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "ShrinkX",
	description: "Shortem Urls",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
			</head>
			<SessionWrapper>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<Navbar />
					{children}
				</body>
			</SessionWrapper>
		</html>
	);
}
