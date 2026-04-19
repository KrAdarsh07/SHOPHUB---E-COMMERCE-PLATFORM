import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async (categoryId = null) => {
        setLoading(true);
        try {
            const url = categoryId
                ? `/public/products/category/${categoryId}`
                : "/public/products";
            const res = await api.get(url);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories");
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        fetchProducts(categoryId);
    };

    const handleAddToCart = async (productId) => {
        if (!user) { navigate("/login"); return; }
        if (user.role !== "CUSTOMER") {
            showToast("Only customers can add to cart", "error");
            return;
        }
        try {
            await api.post("/cart", { productId, quantity: 1 });
            showToast("Added to cart!");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add to cart", "error");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {/* Hero */}
            <div className="bg-blue-600 text-white py-16 text-center">
                <h1 className="text-4xl font-bold mb-2">Welcome to ShopHub</h1>
                <p className="text-blue-100 mb-6">Discover products from multiple vendors</p>
                {/* Search */}
                <div className="max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-5 py-3 rounded-full text-gray-800 focus:outline-none shadow"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Categories */}
                <div className="flex gap-2 flex-wrap mb-8">
                    <button
                        onClick={() => { setSelectedCategory(null); fetchProducts(); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${!selectedCategory
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${selectedCategory === cat.id
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-400">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-5xl mb-4">🔍</p>
                        <p>No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden group">
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
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 truncate">{product.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">by {product.vendorName}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 10
                                            ? "bg-green-100 text-green-600"
                                            : product.stock > 0
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-500"
                                            }`}>
                                            {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        disabled={product.stock === 0}
                                        className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;