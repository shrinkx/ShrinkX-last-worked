"use client"

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import { BarChart3, Shield, Target, LogIn } from 'lucide-react';
import { login } from '@/lib/login';
import { Spotlight } from "@/components/ui/spotlight-new";

export default function Home() {

	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.push('/dashboard');
		}
	}, [status, router]);

	return (
		<div className="min-h-screen bg-primary overflow-hidden">

			{/* Hero Section */}
			<section className="container mx-auto w-[90%] relative min-h-[100dvh]">
				<Spotlight />
				<div className="max-w-4xl min-h-[100dvh] flex flex-col items-center justify-center mx-auto text-center">
					<h1 className="text-5xl md:text-7xl font-bold mb-6">
						Shorten URLs
						<span className="gradient-text"> Smartly</span>
					</h1>
					<p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
						Create custom short links with advanced analytics. Track every click,
						manage your URLs, and boost your marketing campaigns.
					</p>
					<button onClick={() => login()} className="glass-morphism px-6 py-2 rounded-lg hover:glow-effect transition-all duration-300 flex items-center space-x-2">
						<LogIn className="w-4 h-4" />
						<span>Get Started</span>
					</button>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 px-6">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-white mb-4">
							Everything You Need
						</h2>
						<p className="text-xl text-gray-300">
							Simple, secure, and powerful URL shortening
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: Shield,
								title: 'Secure Authentication',
								description: 'Login required to create links. Each user gets 20 URLs to manage securely.'
							},
							{
								icon: Target,
								title: 'Custom Aliases',
								description: 'Create memorable short links with custom aliases. Edit them anytime you want.'
							},
							{
								icon: BarChart3,
								title: 'Click Analytics',
								description: 'Track clicks, user agents, IP addresses, and timestamps for every link.'
							}
						].map((feature, index) => (
							<div key={index} className="glass-morphism p-8 hover:glow-effect transition-all duration-300">
								<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
									<feature.icon className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
								<p className="text-gray-300">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<div className="glass-morphism p-12">
						<h2 className="text-4xl font-bold text-white mb-4">
							Ready to Start Shortening?
						</h2>
						<p className="text-xl text-gray-300 mb-8">
							Join thousands of users who trust ShrinkX for their URL management needs.
						</p>
						<button onClick={() => login()} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 glow-effect">
							Get Started Free
						</button>
					</div>
				</div>
			</section>
		</div>
	)
}
