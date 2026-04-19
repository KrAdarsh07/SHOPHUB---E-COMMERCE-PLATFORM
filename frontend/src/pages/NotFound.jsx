import { Link } from "react-router-dom";

const NotFound = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <p className="text-8xl mb-4">🛒</p>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Oops! This page doesn't exist.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
            Back to Home
        </Link>
    </div>
);

export default NotFound;