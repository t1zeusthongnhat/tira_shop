import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../ToastProvider";
import { X } from "lucide-react";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [productData, setProductData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    inventory: "",
    status: "",
    categoryId: "",
    brandId: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isOpen && product) {
      setProductData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        inventory: product.inventory,
        status: product.status,
        categoryId: product.categoryId,
        brandId: product.brandId,
        image: null,
      });
      setPreviewImage(product.image || null);
    }
  }, [isOpen, product]);

  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          axios.get("http://localhost:8080/tirashop/category"),
          axios.get("http://localhost:8080/tirashop/brand"),
        ]);
        setCategories(
          Array.isArray(categoriesResponse.data.data.elementList) ? categoriesResponse.data.data.elementList : []
        );
        setBrands(
          Array.isArray(brandsResponse.data.data.elementList) ? brandsResponse.data.data.elementList : []
        );
      } catch (err) {
        console.error("Error fetching categories or brands:", err);
        showToast("Failed to load categories or brands.", "error");
      }
    };

    if (isOpen) fetchCategoriesAndBrands();
  }, [isOpen]);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData({ ...productData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProductData = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        originalPrice: parseFloat(productData.originalPrice),
        inventory: parseInt(productData.inventory),
        status: productData.status,
        categoryId: Number(productData.categoryId),
        brandId: Number(productData.brandId),
      };

      const productResponse = await axios.put(
        `http://localhost:8080/tirashop/product/update/${productData.id}`,
        updatedProductData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // If there's an image, upload it
      if (productData.image) {
        const formData = new FormData();
        formData.append("file", productData.image);

        await axios.post(
          `http://localhost:8080/tirashop/product/${productData.id}/images/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      showToast("Product updated successfully!", "success");
      onProductUpdated(productResponse.data.data);
      onClose();
    } catch (err) {
      console.error("Error updating product or uploading image:", err.response?.data || err);
      showToast("Failed to update product or upload image.", "error");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Product Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
            />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Price</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Original Price</label>
            <input
              type="number"
              name="originalPrice"
              value={productData.originalPrice}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Inventory</label>
            <input
              type="number"
              name="inventory"
              value={productData.inventory}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Status</label>
            <select
              name="status"
              value={productData.status}
              onChange={(e) => setProductData({ ...productData, status: e.target.value })}
              className="w-full px-3 py-1 border rounded-lg"
            >
              <option value="Available">Available</option>
              <option value="Disavailable">Disavailable</option>
            </select>
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Category</label>
            <select
              name="categoryId"
              value={productData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Brand</label>
            <select
              name="brandId"
              value={productData.brandId}
              onChange={handleChange}
              className="w-full px-3 py-1 border rounded-lg"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-1 border rounded-lg"
            />
            {previewImage && (
              <img src={previewImage} alt="Preview" className="mt-2 w-[60px] h-auto object-cover rounded-lg" />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 bg-blue-500 text-white rounded-lg"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
