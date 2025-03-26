import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import OrderDetailModal from './OrderDetailModal';
import Pagination from '../common/Pagination';

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const pageSize = 5;

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/tirashop/orders`);
            const allOrders = response.data.data.elementList || [];

            setTotalPages(Math.ceil(allOrders.length / pageSize));
            const paginated = allOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            setOrders(paginated);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Failed to load orders.");
        }
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="m-5 p-6 bg-white text-black rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders List</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                <thead>
  <tr>
    <th>Username</th>
    <th>Product</th>
    <th>Brand</th>
    <th>Category</th>
    <th>Size</th>
    <th>Quantity</th>
    <th>Price</th>
    <th>Created At</th>
    <th>Image</th>
  </tr>
</thead>
<tbody>
  {orders.map((item, idx) => (
    <tr key={idx}>
      <td>{item.username}</td>
      <td>{item.productName}</td>
      <td>{item.brandName}</td>
      <td>{item.categoryName}</td>
      <td>{item.size}</td>
      <td>{item.quantity}</td>
      <td>{item.price?.toLocaleString()} đ</td>
      <td>{new Date(item.createdAt).toLocaleString()}</td>
      <td>
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
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

            {isDetailModalOpen && selectedOrder && (
                <OrderDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    order={selectedOrder}
                />
            )}
        </div>
    );
};

export default OrdersTable;
