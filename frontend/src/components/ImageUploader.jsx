import { useState } from "react";

const ImageUploader = ({ value, onChange }) => {
    const [mode, setMode] = useState("url"); 
    const [preview, setPreview] = useState(value || null);

    const handleUrlChange = (e) => {
        onChange(e.target.value);
        setPreview(e.target.value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        
        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be under 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            onChange(base64);
            setPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Product Image
            </label>

            {/* Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => { setMode("url"); onChange(""); setPreview(null); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${mode === "url"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                        }`}
                >
                    🔗 URL
                </button>
                <button
                    type="button"
                    onClick={() => { setMode("upload"); onChange(""); setPreview(null); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${mode === "upload"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                        }`}
                >
                    📁 Upload
                </button>
            </div>

            {/* URL Input */}
            {mode === "url" && (
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={value?.startsWith("data:") ? "" : value}
                    onChange={handleUrlChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            )}

            {/* File Upload */}
            {mode === "upload" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <p className="text-3xl mb-1">🖼️</p>
                        <p className="text-sm text-gray-500">Click to select image</p>
                        <p className="text-xs text-gray-400 mt-1">Max 2MB — JPG, PNG, WEBP</p>
                    </label>
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Preview:</p>
                    <img
                        src={preview}
                        alt="preview"
                        className="h-32 w-32 object-contain rounded-lg border border-gray-200 bg-gray-50"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUploader;