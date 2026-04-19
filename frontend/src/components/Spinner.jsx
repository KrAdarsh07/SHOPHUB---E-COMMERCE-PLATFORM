const Spinner = ({ text = "Loading..." }) => (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">{text}</p>

    </div>
);

export default Spinner;