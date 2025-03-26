import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && order?.id) {
            fetchOrderItems(order.id);
        }
    }, [isOpen, order]);

    const fetchOrderItems = async (orderId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/tirashop/orders/${orderId}/shipments`);
            const data = response.data.data?.elementList || [];
            setOrderItems(data);
        } catch (err) {
            console.error("Error fetching order items:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white w-[800px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
                <button className="absolute top-4 right-4 text-gray-600 hover:text-red-600" onClick={onClose}>
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Order Detail - #{order.id}</h2>

                <div className="mb-4">
                    <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                    <p><strong>Total Price:</strong> {order.totalPrice.toLocaleString()} đ</p>
                    <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-700">Items:</h3>

                {loading ? (
                    <p className="text-gray-500">Loading items...</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th className="py-2 text-left text-gray-600">Product Name</th>
                                <th className="py-2 text-left text-gray-600">Category</th>
                                <th className="py-2 text-left text-gray-600">Brand</th>
                                <th className="py-2 text-left text-gray-600">Size</th>
                                <th className="py-2 text-left text-gray-600">Quantity</th>
                                <th className="py-2 text-left text-gray-600">Price</th>
                                <th className="py-2 text-left text-gray-600">Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item, idx) => (
                                <tr key={idx} className="border-t border-gray-200">
                                    <td className="py-2">{item.productName}</td>
                                    <td className="py-2">{item.categoryName}</td>
                                    <td className="py-2">{item.brandName}</td>
                                    <td className="py-2">{item.size}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{item.price.toLocaleString()} đ</td>
                                    <td className="py-2">
                                        <img
                                            src={`http://localhost:8080${item.productImage}`}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderDetailModal;
