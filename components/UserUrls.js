import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { Clipboard, Pencil, Trash, ExternalLink, Clock, Globe } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import EditModal from "@/components/EditModal";

export default function UserData({ userEmail, linksCount, refreshLinksCount }) {
    const [links, setLinks] = useState([]);
    const [currentlyEditing, setCurrentlyEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (linksCount < 0) return;

        const fetchLinks = async () => {
            try {
                const res = await fetch("/api/userurls", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userEmail }),
                });
                const result = await res.json();
                setLinks(result.urls || []);
            } catch (err) {
                console.error("Failed to fetch links", err);
            }
        };

        fetchLinks();
    }, [userEmail, linksCount]);

    const truncate = (str, maxLength) => {
        if (!str) return "";
        return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
    };

    const handleCopy = async (code, linkId) => {
        try {
            await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/r/${code}`);
            setCopiedId(linkId);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy link");
        }
    };

    const handleDelete = async (code) => {
        try {
            const res = await fetch("/api/deleteurl", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, userEmail }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("URL deleted successfully!");
                if (refreshLinksCount) refreshLinksCount();
            } else {
                console.error("Delete failed:", data.msg);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete link");
        }
    };

    const handleEdit = async (data) => {
        try {
            setLoading(true);

            const res = await fetch("/api/editurl", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentlyEditing._id,
                    alias: data.alias || null,
                    url: data.url,
                    userEmail,
                }),
            });

            const result = await res.json();

            if (result.success) {
                toast.success("URL updated successfully!");
                reset();
                setCurrentlyEditing(null);
                setLinks((prevLinks) =>
                    prevLinks.map((link) =>
                        link._id === currentlyEditing._id
                            ? {
                                    ...link,
                                    original: data.url,
                                    code: data.alias || link.code,
                                    title: result.title || link.title,
                              }
                            : link
                    )
                );
                if (refreshLinksCount) refreshLinksCount();
            } else {
                toast.error(result.msg || "Failed to update");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to edit link");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (link) => {
        setCurrentlyEditing(link);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const EmptyState = () => (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-6">
            <div className="glass-morphism p-8 rounded-3xl text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No Links Yet</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Create your first shortened link to get started. Your links will appear here once created.
                </p>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="glass-morphism p-6 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold gradient-text mb-2">Your Links</h2>
                            <p className="text-gray-400">
                                {links.length} {links.length === 1 ? 'link' : 'links'} created
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {links?.length === 0 ? (
                    <EmptyState />
                ) : (
                    links.map((link) => (
                        <div
                            key={link._id}
                            className="group glass-morphism p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 border border-white/5 hover:border-white/10"
                        >
                            {/* Link Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
                                        {truncate(link.title || link.original, 45)}
                                    </h3>
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(link.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleCopy(link.code, link._id)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 relative"
                                        title="Copy link"
                                    >
                                        <Clipboard 
                                            className={`w-4 h-4 transition-colors duration-200 ${
                                                copiedId === link._id ? 'text-green-400' : 'text-gray-400 hover:text-white'
                                            }`} 
                                        />
                                    </button>
                                    <button
                                        onClick={() => openModal(link)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                        title="Edit link"
                                    >
                                        <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link.code)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                        title="Delete link"
                                    >
                                        <Trash className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors duration-200" />
                                    </button>
                                </div>
                            </div>

                            {/* Short Link Display */}
                            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span className="text-blue-400 font-medium text-sm break-all">
                                        {process.env.NEXT_PUBLIC_BASE_URL}/r/{link.code}
                                    </span>
                                </div>
                            </div>

                            {/* Original URL */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-400 text-xs font-medium">Original URL</span>
                                </div>
                                <p className="text-gray-300 text-sm break-all leading-relaxed">
                                    {truncate(link.original, 60)}
                                </p>
                            </div>

                            {/* Stats Footer */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Clicks: {link.clicks || 0}</span>
                                    <span className="flex items-center space-x-1">
                                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                        <span>Active</span>
                                    </span>
                                </div>
                            </div>

                            {/* Copy Success Indicator */}
                            {copiedId === link._id && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                    Copied!
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
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
    );
}
