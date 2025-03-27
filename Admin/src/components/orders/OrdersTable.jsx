import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import OrderDetailModal from './OrderDetailModal';
import Pagination from '../common/Pagination';
import { GiConfirmed } from "react-icons/gi";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const isAdmin = false; // hoặc lấy từ props/context


  const pageSize = 5;

  const statusOptions = ['PENDING', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/tirashop/orders`);
      const allOrders = response.data.data.elementList || [];

      const formattedOrders = allOrders.map((o) => ({
        ...o,
        id: o.order_id 
      }));
      
      setTotalPages(Math.ceil(formattedOrders.length / pageSize));
      const paginated = formattedOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
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
  const handleConfirmShipment = (orderId) => {
    console.log("Xác nhận đơn hàng ID:", orderId);
    toast.success("Shipment confirmed successfully!");
  };


  const handleViewDetail = (order) => {
    console.log(selectedOrder?.id)
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/tirashop/orders/${orderId}/status?status=${newStatus}`);
      toast.success('Status updated successfully!');
      fetchOrders(); // Refresh to show updated status
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="m-5 p-6 bg-white text-black rounded-xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders List</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date and Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Image</th>
              <th className="pl-12 pr-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-1 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {orders.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-4 min-w-[150px]">{item.username}</td>
                <td className="px-4 py-4 min-w-[200px]">{item.productName}</td>
                <td className="px-4 py-4 min-w-[60px]">{item.size}</td>
                <td className="px-4 py-4 min-w-[80px]">{item.quantity}</td>
                <td className="px-4 py-4 min-w-[120px]">${item.price?.toLocaleString()}</td>
                <td className="px-4 py-4 min-w-[180px]">{item.createdAt}</td>
                <td className="px-4 py-4 min-w-[80px]">
                  <img
                    src={`http://localhost:8080${item.productImage}`}
                    alt={item.productName}
                    className="w-20 h-auto object-cover rounded"
                  />
                </td>
                <td className="px-4 py-4 min-w-[160px]">
                  {isAdmin ? (
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={item.orderStatus}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`w-[120px] inline-block text-center px-3 py-1 rounded-full text-white text-xs font-semibold
                        ${item.orderStatus === 'COMPLETED' ? 'bg-green-500' : ''}
                        ${item.orderStatus === 'PENDING' ? 'bg-yellow-500' : ''}
                        ${item.orderStatus === 'CANCELLED' ? 'bg-red-500' : ''}
                    `}
                    >
                      {item.orderStatus}
                    </span>

                  )}
                </td>

                <td className="px-4 py-4 min-w-[80px]">
                  {item.orderStatus === 'COMPLETED' ? (
                    <div className="flex gap-2 items-center">
                      <button
                        className="text-indigo-600 hover:text-indigo-500"
                        onClick={() => {
                          console.log("Clicked item:", item);
                          handleViewDetail(item);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="text-green-600 hover:text-green-500"
                        onClick={() => handleConfirmShipment(item.id)}
                        title="Xác nhận giao hàng"
                      >
                        <GiConfirmed size={18} />
                      </button>
                    </div>
                  ) : (
                    <Eye size={18} className="text-gray-400 cursor-not-allowed" />
                  )}

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderId={selectedOrder?.id}
      />

    </div>
  );
};

export default OrdersTable;
