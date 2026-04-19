import { useEffect, useState } from "react";
import api from "../../api/axios";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
    DELIVERED: "bg-green-100 text-green-700",
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/orders/my");
                setOrders(res.data);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">Loading Orders...</div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-lg">No orders yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-xl shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-gray-800">Order #{order.orderId}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric", month: "long", day: "numeric"
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">📍 {order.shippingAddress}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm text-gray-600">
                                            <span>{item.productName} × {item.quantity}</span>
                                            <span>₹{item.totalAmount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
