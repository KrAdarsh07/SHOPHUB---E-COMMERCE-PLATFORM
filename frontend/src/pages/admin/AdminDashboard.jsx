import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState("vendors");
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        fetchVendors();
        fetchCategories();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get("/admin/vendors");
            setVendors(res.data);
        } catch (err) {
            console.error("Failed to fetch vendors", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories");
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const handleApprove = async (id) => {
        try {
            setActionError("");
            await api.put(`/admin/vendors/${id}/approve`);
            fetchVendors();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to approve vendor");
        }
    };

    const handleReject = async (id) => {
        try {
            setActionError("");
            await api.put(`/admin/vendors/${id}/reject`);
            fetchVendors();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to reject vendor");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/categories", categoryForm);
            setCategoryForm({ name: "", description: "" });
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add category");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete category");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const pendingVendors = vendors.filter(v => !v.approved);
    const approvedVendors = vendors.filter(v => v.approved);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Admin Dashboard</h1>

                {actionError && (
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                        {actionError}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{vendors.length}</p>
                        <p className="text-gray-500 text-sm mt-1">Total Vendors</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-yellow-500">{pendingVendors.length}</p>
                        <p className="text-gray-500 text-sm mt-1">Pending Approval</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-green-500">{categories.length}</p>
                        <p className="text-gray-500 text-sm mt-1">Categories</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {["vendors", "categories"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg font-medium capitalize transition ${activeTab === tab
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Vendors Tab */}
                {activeTab === "vendors" && (
                    <div className="space-y-6">
                        {pendingVendors.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-gray-700 mb-3">
                                    ⏳ Pending Approval ({pendingVendors.length})
                                </h2>
                                <div className="space-y-3">
                                    {pendingVendors.map((vendor) => (
                                        <div key={vendor.id}
                                            className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">{vendor.name}</p>
                                                <p className="text-sm text-gray-400">{vendor.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(vendor.id)}
                                                    className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 transition">
                                                    Approve
                                                </button>
                                                <button onClick={() => handleReject(vendor.id)}
                                                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition">
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="font-semibold text-gray-700 mb-3">
                                ✅ Approved Vendors ({approvedVendors.length})
                            </h2>
                            {approvedVendors.length === 0 ? (
                                <p className="text-gray-400 text-sm">No approved vendors yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {approvedVendors.map((vendor) => (
                                        <div key={vendor.id}
                                            className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">{vendor.name}</p>
                                                <p className="text-sm text-gray-400">{vendor.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                                                    Active
                                                </span>
                                                <button onClick={() => handleReject(vendor.id)}
                                                    className="border border-red-400 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition">
                                                    Suspend
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Add New Category</h2>
                            <form onSubmit={handleAddCategory} className="flex gap-3 flex-wrap">
                                <input
                                    type="text"
                                    placeholder="Category name"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    required
                                    className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button type="submit"
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                                    Add
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.length === 0 ? (
                                <p className="text-gray-400 text-sm col-span-3 text-center py-8">
                                    No categories yet. Add one above!
                                </p>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id}
                                        className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800">{cat.name}</p>
                                            <p className="text-sm text-gray-400">{cat.description || "No description"}</p>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)}
                                            className="text-red-400 hover:text-red-600 text-sm ml-4 flex-shrink-0">
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;