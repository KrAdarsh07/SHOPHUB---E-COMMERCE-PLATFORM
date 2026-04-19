import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <Link to="/" className="text-2xl font-bold">🛒 ShopHub</Link>

        <div className="flex items-center gap-4">
            {!user ? (
                <>
                    <Link to="/login" className="hover:underline">Login</Link>
                    <Link to="/register" className="hover:underline">Register</Link>
                </>
            ) : (
                <>
                    <span className="text-sm opacity-80">
                        👋🏻 {user.name} ({user.role})
                    </span>

                    {user.role === "CUSTOMER" && (
                        <>
                            <Link to="/cart" className="hover:underline">Cart</Link>
                            <Link to="/orders" className="hover:underline">Orders</Link>
                        </>
                    )}

                    {user.role === "ADMIN" && (
                        <Link to="/admin" className="hover:underline">Admin</Link>
                    )}

                    {user.role === "VENDOR" && (
                        <Link to="/vendor" className="hover:underline">Dashboard</Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium"
                    >
                        Logut
                    </button>
                </>
            )}
        </div>
    </nav>
    );
};

export default Navbar;