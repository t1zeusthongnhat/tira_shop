import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../ToastProvider";
import { X } from "lucide-react";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    categoryId: "",
    brandId: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setProductData({
        name: "",
        description: "",
        price: "",
        inventory: "",
        status: "Available", // Giá trị mặc định
        categoryId: null,
        brandId: null,
        image: null,
      });
      setPreviewImage(null);
    }
  }, [isOpen]);

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
      // Gửi sản phẩm lên trước
      const productData2 = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        originalPrice: parseFloat(productData.originalPrice),
        inventory: parseInt(productData.inventory),
        status: productData.status,
        categoryId: Number(productData.categoryId),
        brandId: Number(productData.brandId),
      };

      const productResponse = await axios.post(
        "http://localhost:8080/tirashop/product/add",
        productData2,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newProductId = productResponse.data.data.id;
      console.log("✅ Product Created:", newProductId);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // 2Kiểm tra nếu có ảnh thì tải lên
      if (productData.image) {
        console.log("📸 Preparing to upload image:", productData.image);

        const formData = new FormData();
        formData.append("file", productData.image); // 👈 Kiểm tra backend yêu cầu "file" hay "image"

        const uploadResponse = await axios.post(
          `http://localhost:8080/tirashop/product/${newProductId}/images/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Image Upload Response:", uploadResponse.data);
      } else {
        console.log("No image selected!");
      }

      showToast("Product added successfully!", "success");
      onProductAdded(productResponse.data.data);
      onClose();
    } catch (err) {
      console.error("Error uploading image:", err.response?.data || err);
      showToast("Failed to add product or upload image.", "error");
    }

    setLoading(false);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Product Name</label>
            <input type="text" name="name" value={productData.name} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Description</label>
            <textarea name="description" value={productData.description} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Price</label>
            <input type="number" name="price" value={productData.price} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Original Price</label>
            <input type="number" name="originalPrice" value={productData.originalPrice} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required />
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Inventory</label>
            <input type="number" name="inventory" value={productData.inventory} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required />
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
            <select name="categoryId" value={productData.categoryId} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required>
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-1">
            <label className="block text-gray-700 text-sm font-medium">Brand</label>
            <select name="brandId" value={productData.brandId} onChange={handleChange} className="w-full px-3 py-1 border rounded-lg" required>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium">Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-1 border rounded-lg" />
            {previewImage && <img src={previewImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-1 bg-gray-500 text-white rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-1 bg-blue-500 text-white rounded-lg">{loading ? "Adding..." : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;