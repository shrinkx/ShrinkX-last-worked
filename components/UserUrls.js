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
		<div className="flex flex-col gap-8 items-center justify-center my-8 mb-12 w-full">
			<ToastContainer
				position="top-right"
				theme="light"
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick
				pauseOnHover
				draggable
			/>
			{links.length > 0 &&
				links.map((link) => (
					<div key={link._id} className="url-container">
						<h4>{truncate(link.title || link.original, 40)}</h4>
						<div className="result">
							<p className='short'>{`${process.env.NEXT_PUBLIC_BASE_URL}/r/${link.code}`}</p>
							<div className="btns">
								<button onClick={() => handleCopy(link.code)} className="copyBtn"><Clipboard color="black" size={20} /></button>
								<button onClick={() => openModal(link)} className="editBtn"><Pencil color="black" size={20} /></button>
								<button onClick={() => handleDelete(link.code)} className="deleteBtn"><Trash color="black" size={20} /></button>
							</div>
						</div>
					</div>
				))
			}
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
