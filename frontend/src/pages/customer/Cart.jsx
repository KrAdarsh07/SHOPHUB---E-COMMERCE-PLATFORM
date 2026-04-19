import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState("");
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await api.get("/cart");
            setCartItems(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleRemove = async (cartItemId) => {
        try {
            await api.delete(`/cart/${cartItemId}`);
            setCartItems(cartItems.filter((i) => i.cartItemId !== cartItemId));
        }
        catch (err) {
            alert("Failed to remove the item.");
        }
    };

    const handleQuantityChange = async (cartItemId, quantity) => {
        if (quantity < 1){
            handleRemove(cartItemId);
            return;
        }
        try {
            const res = await api.put(`/cart/${cartItemId}?quantity=${quantity}`);
            setCartItems(cartItems.map((i) => i.cartItemId === cartItemId ? res.data : i));
        }
        catch (err) {
            alert("Failed to update quantity.");
        }
    };

    const handlePlaceOrder = async () => {
        if (!address.trim()) { alert("Please enter shipping address."); return; }
        setOrdering(true);
        try {
            await api.post("/orders", { shippingAddress: address });
            alert("Order placed successfully..🎊");
            navigate("/orders")
        }
        catch (err) {
            alert(err.response?.data?.message || "Failed to place order");
        }
        finally {
            setOrdering(false);
        }
    };

    const total = cartItems.reduce((sum, i) => sum + i.totalAmount, 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">Loading Cart...</div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 My Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                        <p className="text-5xl mb-4">🛍️</p>
                        <p className="text-lg">Your cart is empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.cartItemId} className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
                                    <div className="bg-gray-100 rounded-lg w-20 h-20 flex items-center justify-center flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-3xl">📦</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                                        <p className="text-blue-600 font-medium">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right min-w-[60px]">
                                        <p className="font-bold text-gray-800">₹{item.totalAmount.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleRemove(item.cartItemId)}
                                            className="text-red-400 text-xs hover:text-red-600 mt-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl shadow p-6 h-fit space-y-4">
                            <h2 className="font-bold text-gray-800 text-lg">Order Summary</h2>
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-500">Free</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-gray-800">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Shipping address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={handlePlaceOrder}
                                disabled={ordering}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                {ordering ? "Placing Order..." : "Place Order"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;