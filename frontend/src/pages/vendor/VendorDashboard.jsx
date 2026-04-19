import { useEffect, useState } from "react";
import api from "../../api/axios";
import ImageUploader from "../../components/ImageUploader";

const VendorDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("products");
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({
        name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        const res = await api.get("/vendor/products");
        setProducts(res.data);
    };

    const fetchCategories = async () => {
        const res = await api.get("/public/categories");
        setCategories(res.data);
    };

    const fetchOrders = async () => {
        const res = await api.get("/orders/vendor");
        setOrders(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/vendor/products/${editingProduct.id}`, form);
            }
            else {
                await api.post("/vendor/products", form);
            }
            fetchProducts();
            resetForm();
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to save Product");
        }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl || "",
            categoryId: categories.find(c => c.name === product.categoryName)?.id || ""
        });
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (productId) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.delete(`/vendor/products/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
        }
        catch (err) {
            alert("Failed to delete product.");
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status?status=${status}`);
            fetchOrders();
        }
        catch (err) {
            alert("Failed to update order status");
        }
    };

    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-purple-100 text-purple-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    const getNextActions = (status) => {
        switch (status) {
            case "PENDING":
                return [
                    {
                        status: "CONFIRMED",
                        label: "✅ Confirm",
                        style: "bg-blue-500 text-white hover:bg-blue-600",
                    },
                    {
                        status: "CANCELLED",
                        label: "❌ Cancel",
                        style: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                ];
            case "CONFIRMED":
                return [
                    {
                        status: "SHIPPED",
                        label: "🚚 Ship",
                        style: "bg-purple-500 text-white hover:bg-purple-600",
                    },
                    {
                        status: "CANCELLED",
                        label: "❌ Cancel",
                        style: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                ];
            case "SHIPPED":
                return [
                    {
                        status: "DELIVERED",
                        label: "📦 Mark Delivered",
                        style: "bg-green-500 text-white hover:bg-green-600",
                    },
                ];
            case "DELIVERED":
            case "CANCELLED":
                return [];
            default:
                return [];
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">🏪 Vendor Dashboard</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {["products", "orders"].map((tab) => (
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

                {/* Products Tab */}
                {activeTab === "products" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-500">{products.length} product(s)</p>
                            <button
                                onClick={() => { resetForm(); setShowForm(!showForm); }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                            >
                                {showForm ? "Cancel" : "+ Add Product"}
                            </button>
                        </div>

                        {/* Product Form */}
                        {showForm && (
                            <div className="bg-white rounded-xl shadow p-6 mb-6">
                                <h2 className="font-bold text-gray-800 mb-4">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </h2>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input name="name" value={form.name} onChange={handleChange} required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder="Product name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                            <option value="">Select category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input name="stock" type="number" value={form.stock} onChange={handleChange} required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder="0" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea name="description" value={form.description} onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={3} placeholder="Product description" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <ImageUploader
                                            value={form.imageUrl}
                                            onChange={(val) => setForm({ ...form, imageUrl: val })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex gap-3">
                                        <button type="submit"
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                                            {editingProduct ? "Update Product" : "Add Product"}
                                        </button>
                                        <button type="button" onClick={resetForm}
                                            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Products List */}
                        {products.length === 0 ? (
                            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                                <p className="text-5xl mb-4">📦</p>
                                <p>No products yet. Add your first product!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-xl shadow p-4">
                                        <div className="w-full h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/400x400?text=No+Image";
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-5xl">📦</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-400">{product.categoryName}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-blue-600 font-bold">₹{product.price}</span>
                                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => handleEdit(product)}
                                                className="flex-1 border border-blue-400 text-blue-600 py-1.5 rounded-lg text-sm hover:bg-blue-50 transition">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(product.id)}
                                                className="flex-1 border border-red-400 text-red-500 py-1.5 rounded-lg text-sm hover:bg-red-50 transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                                <p className="text-5xl mb-4">📭</p>
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.orderId} className="bg-white rounded-xl shadow p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-800">Order #{order.orderId}</p>
                                            <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                                            <p className="text-sm text-gray-400">📍 {order.shippingAddress}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="border-t pt-3 space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm text-gray-600">
                                                <span>{item.productName} × {item.quantity}</span>
                                                <span>₹{item.totalAmount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t mt-3 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-gray-800">
                                            Total: ₹{order.totalAmount.toFixed(2)}
                                        </span>


                                        <div className="flex gap-2">
                                            {getNextActions(order.status).map((action) => (
                                                <button
                                                    key={action.status}
                                                    onClick={() => handleStatusUpdate(order.orderId, action.status)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${action.style}`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                            {getNextActions(order.status).length === 0 && (
                                                <span className="text-xs text-gray-400 italic">No further actions</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;