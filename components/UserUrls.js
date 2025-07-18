import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify";
import { Clipboard, Pencil, Trash } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import EditModal from "@/components/EditModal";

export default function UserData({ userEmail, linksCount, refreshLinksCount }) {
	const [links, setLinks] = useState([])
	const [currentlyEditing, setCurrentlyEditing] = useState(null)
	const [loading, setLoading] = useState(false);

	// useForm hook
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm()

	useEffect(() => {
		if (linksCount < 0) return

		const fetchLinks = async () => {
			const res = await fetch("/api/userurls", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userEmail })
			})
			const result = await res.json()

			setLinks(result.urls || [])
		}

		fetchLinks()
	}, [userEmail, linksCount])

	const truncate = (str, maxLength) => {
		if (!str) return ""; // or return "Untitled" or some fallback text
		return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
	}

	const handleCopy = async (code) => {
		try {
			await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/r/${code}`)
			toast.success('Link copied to clipboard!');
		} catch (err) {
			console.error(err)
			toast.error('Failed to copy link')
		}
	}

	const handleDelete = async (code) => {
		try {

			const res = await fetch("/api/deleteurl", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code, userEmail })
			})

			const data = await res.json()
			if (data.success) {
				console.log("Deleted successfully")
				toast.success('Url deleted successfully!')
				if (refreshLinksCount) refreshLinksCount()
			} else {
				console.error("Failed to delete:", data.msg)
			}

		} catch (err) {
			console.error(err)
			toast.error('Failed to delete link')
		}
	}

	const handleEdit = async (data) => {
		try {

			setLoading(true);

			const res = await fetch("/api/editurl", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: currentlyEditing._id,
					alias: data.alias || null,
					url: data.url,
					userEmail,
				}),
			})

			const result = await res.json()
			console.log(result)

			if (result.success) {
				toast.success("URL updated successfully!")
				setCurrentlyEditing(null)
				reset()
				setLinks((prevLinks) =>
					prevLinks.map((link) =>
						link._id === currentlyEditing._id
							? {
								...link,
								original: data.url,
								code: data.alias || link.code,
								title: result.title || link.title // ⬅ update title too
							}
							: link
					)
				)
				if (refreshLinksCount) refreshLinksCount()
			} else {
				toast.error(result.msg || "Failed to update")
			}

		} catch (err) {
			console.error(err)
			alert('Failed to edit link')
		} finally {
			setLoading(false)
		}
	}

	const openModal = async (link) => {
		setCurrentlyEditing(link);
	}

	return (
		<div className="w-full max-w-6xl mx-auto px-4 py-8">
			<ToastContainer
				position="top-right"
				theme="dark"
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick
				pauseOnHover
				draggable
				toastClassName="glass-morphism"
			/>
			
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{links.length > 0 &&
					links.map((link) => (
						<div key={link._id} className="glass-morphism p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 border border-white/5 hover:border-white/10">
							<div className="mb-4">
								<h4 className="text-white font-semibold text-lg mb-3 leading-tight break-words">
									{truncate(link.title || link.original, 40)}
								</h4>
								
								<div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
									<div className="flex items-center justify-between">
										<p className="text-blue-400 font-medium text-sm break-all flex-1 mr-3">
											{`${process.env.NEXT_PUBLIC_BASE_URL}/r/${link.code}`}
										</p>
										<div className="flex items-center space-x-2">
											<button 
												onClick={() => handleCopy(link.code)} 
												className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
												title="Copy link"
											>
												<Clipboard className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
											</button>
											<button 
												onClick={() => openModal(link)} 
												className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
												title="Edit link"
											>
												<Pencil className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
											</button>
											<button 
												onClick={() => handleDelete(link.code)} 
												className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
												title="Delete link"
											>
												<Trash className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
											</button>
										</div>
									</div>
								</div>
								
								<div className="pt-3 border-t border-white/10">
									<p className="text-gray-400 text-sm break-all">
										{truncate(link.original, 60)}
									</p>
								</div>
							</div>
						</div>
					))
				}
				
				{links.length === 0 && (
					<div className="col-span-full flex items-center justify-center py-16">
						<div className="glass-morphism p-8 rounded-2xl text-center">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
								<Clipboard className="w-8 h-8 text-purple-400" />
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">No Links Yet</h3>
							<p className="text-gray-400 text-sm">
								Your shortened links will appear here once created.
							</p>
						</div>
					</div>
				)}
			</div>
			
			{currentlyEditing && (
				<EditModal
					handleEdit={handleSubmit(handleEdit)}
					link={currentlyEditing}
					setCurrentlyEditing={setCurrentlyEditing}
					register={register}
					reset={reset}
					loading={loading}
				/>
			)}
		</div>
	)
}
