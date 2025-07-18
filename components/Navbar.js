"use client"

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";
import { login } from "@/lib/login";
import { Link2, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {

	const { data: session, status } = useSession()

	return (
		<nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10" >
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
							<Link2 className="w-6 h-6 text-white" />
						</div>
						<span className="text-2xl font-bold gradient-text">ShrinkX</span>
					</div>
					<div className="flex items-center space-x-6">
						{!session ? (
							<button onClick={() => login()} className="glass-morphism px-6 py-2 rounded-lg hover:glow-effect transition-all duration-300 flex items-center space-x-2">
								<LogIn className="w-4 h-4" />
								<span>Sign In</span>
							</button>
						) : (
							<button onClick={() => signOut()} className="glass-morphism px-6 py-2 rounded-lg hover:glow-effect transition-all duration-300 flex items-center space-x-2">
								<LogOut className="w-4 h-4" />
								<span>Sign Out</span>
							</button>
						)}
					</div>
				</div>
			</div>
		</nav >
	)
}
