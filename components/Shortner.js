"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Clipboard } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Shortner({ onLinkCreated, linksCount }) {

	const [shortUrl, setShortUrl] = useState('');
	const [generated, setGenerated] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data: session } = useSession();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm();

	useEffect(() => {
		if (errors.url) {
			toast.error(errors.url.message);
		}
	}, [errors]);

	const onSubmit = async (data) => {
		try {
			if (linksCount >= 20) {
				toast.error('You Have Reached the Limit');
				return;
			}

			setIsSubmitting(true);

			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ original: data.url, userEmail: session.user.email, alias: data.alias })
			});

			const result = await res.json();

			if (result.success) {
				setShortUrl(`${result.fullUrl}`);
				setGenerated(true);
				onLinkCreated();
				toast.success('Shortlink Created');
			} else {
				if (result.msg === "Alias already exists") {
					toast.error("Alias already exists");
					return;
				}
				toast.error("Failed to shorten URL");
				setIsSubmitting(false);
			}
		} catch (err) {
			console.log(err);
		} finally {
			reset();
			setIsSubmitting(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(shortUrl);
		toast.success("Copied to clipboard!");
	};

	return (
		<div className="w-full max-w-xl mx-auto p-6 glass-morphism rounded-2xl text-white">
			<h1 className="text-3xl font-bold text-center mb-6">Shorten Links</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<input
					{...register("url", {
						required: "URL is required",
						pattern: {
							value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
							message: "Enter a valid URL"
						}
					})}
					type="text"
					placeholder="Enter your long URL"
					className="w-full px-4 py-3 rounded-md border border-white/20 bg-black/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<input
					{...register("alias", {
						pattern: {
							value: /^[a-z0-9_-]{1,20}$/i,
							message: "Enter a valid Alias"
						}
					})}
					type="text"
					placeholder="Alias (optional)"
					className="w-full px-4 py-3 rounded-md border border-white/20 bg-black/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					className="w-full py-3 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 font-semibold text-white text-lg hover:from-purple-600 hover:to-blue-600 transition-all"
					disabled={isSubmitting}
					type="submit"
				>
					Shorten
				</button>
			</form>

			{generated && (
				<div className="mt-6 bg-white/10 border border-white/20 rounded-md px-4 py-3 flex items-center justify-between">
					<p className="text-white text-sm truncate">{shortUrl}</p>
					<button onClick={handleCopy} className="hover:scale-110 transition-transform">
						<Clipboard color="white" size={20} />
					</button>
				</div>
			)}
		</div>
	);
}
