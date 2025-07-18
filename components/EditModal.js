"use client"

import { useEffect } from "react";

export default function EditModal({ handleEdit, link, setCurrentlyEditing, register, reset, loading }) {
	
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, []);
	
	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
			{loading ? (
				<div className="flex justify-center items-center py-20">
					<div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			) : (
				<div className="glass-morphism p-8 rounded-2xl w-full max-w-md">
					<h1 className="text-2xl font-bold text-white text-center mb-6">Edit URL</h1>
					<form onSubmit={handleEdit} className="flex flex-col gap-4">
						<input
							{...register("url", {
								required: "URL is required",
								pattern: {
									value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
									message: "Enter a valid URL"
								}
							})}
							className="w-full px-4 py-3 rounded-md border border-white/20 bg-black/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							type="text"
							defaultValue={link.original}
							placeholder="Enter your long URL"
						/>

						<input
							{...register("alias", {
								pattern: {
									value: /^[a-z0-9_-]{1,20}$/i,
									message: "Enter a valid Alias"
								}
							})}
							className="w-full px-4 py-3 rounded-md border border-white/20 bg-black/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							type="text"
							defaultValue={link.code}
							placeholder="Alias (optional)"
						/>

						<div className="flex gap-3 justify-center items-center pt-2">
							<button
								type="submit"
								className="px-5 py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
							>
								Submit
							</button>
							<button
								type="button"
								onClick={() => {
									reset();
									setCurrentlyEditing(null);
								}}
								className="px-5 py-2 rounded-md border border-red-500 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white transition-all"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
