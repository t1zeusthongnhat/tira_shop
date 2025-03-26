import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../ToastProvider';

const EditImagesModal = ({ isOpen, onClose, productId }) => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (isOpen && productId) {
            fetchImages();
        }
    }, [isOpen, productId]);

    const fetchImages = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/tirashop/product/${productId}/images`);
            const imageData = res.data.data || [];
            const mapped = imageData.map(img => ({
                ...img,
                newFile: null,
                preview: img.url ? `http://localhost:8080${img.url}` : null,
                newPreview: null
            }));
            setImages(mapped);
        } catch (err) {
            showToast("Failed to load images.", "error");
        }
    };

    const handleFileChange = (index, file) => {
        const updated = [...images];
        updated[index].newFile = file;
        updated[index].newPreview = URL.createObjectURL(file);
        setImages(updated);
    };

    const handleSaveAll = async () => {
        for (const img of images) {
            if (img.newFile) {
                const formData = new FormData();
                formData.append('file', img.newFile);

                try {
                    await axios.put(`http://localhost:8080/tirashop/product/${productId}/images/${img.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                } catch (err) {
                    console.error("Error updating image", err);
                    showToast(`Failed to update image ID ${img.id}`, "error");
                }
            }
        }

        showToast("Images updated successfully!", "success");
        onClose();
        setImages([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🖼️ Edit Product Images</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {images.map((img, index) => (
                        <div key={img.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Image ID: {img.id}</p>
                            <div className="flex flex-col gap-4 items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1 text-center">Current Image</p>
                                    <img
                                        src={img.preview}
                                        alt="Current"
                                        className="w-32 aspect-square object-cover rounded-lg border mx-auto"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1 text-center">New Image</p>
                                    {img.newPreview ? (
                                        <img
                                            src={img.newPreview}
                                            alt="New Preview"
                                            className="w-32 aspect-square object-cover rounded-lg border mx-auto"
                                        />
                                    ) : (
                                        <div className="w-32 aspect-square flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400 text-sm mx-auto">
                                            No file
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="mt-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setImages([]);
                            onClose();
                        }}
                        className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-semibold"
                    >
                        Save All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditImagesModal;
