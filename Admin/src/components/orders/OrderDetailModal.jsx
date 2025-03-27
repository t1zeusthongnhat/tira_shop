// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const OrderDetailModal = ({ isOpen, onClose, order }) => {
//   const [shipmentStatus, setShipmentStatus] = useState(order?.shipmentStatus || '');
//   const shipmentId = order?.shipmentId;

//   const statusOptions = ['PENDING', 'DELIVERED', 'FAILED'];
  
//   const handleUpdateStatus = async (newStatus) => {
//     const token = localStorage.getItem('token'); // hoặc key khác nếu bạn đặt tên khác
  
//     if (!token) {
//       toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
//       return;
//     }
  
//     try {
//       const response = await axios.put(
//         `http://localhost:8080/tirashop/orders/shipments/${shipmentId}/status?status=${newStatus}`,
//         null,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log("✅ API Response:", response.data);
  
//       setShipmentStatus(newStatus);
//       toast.success("Cập nhật trạng thái vận chuyển thành công!");
//     } catch (err) {
//       console.error("❌ API Error:", err);
//       toast.error("Cập nhật trạng thái thất bại!");
//     }
//   };
  

//   if (!isOpen || !order) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
//         <button onClick={onClose} className="absolute top-2 right-3 text-xl">×</button>
//         <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>

//         <p><strong>Người đặt:</strong> {order.username}</p>
//         <p><strong>Sản phẩm:</strong> {order.productName}</p>
//         <p><strong>Kích cỡ:</strong> {order.size}</p>
//         <p><strong>Số lượng:</strong> {order.quantity}</p>
//         <p><strong>Giá:</strong> ${order.price?.toLocaleString()}</p>
//         <p><strong>Trạng thái đơn hàng:</strong> {order.orderStatus}</p>

//         <div className="mt-4">
//           <label className="block font-medium mb-1">Trạng thái vận chuyển:</label>
//           <select
//             value={shipmentStatus}
//             onChange={(e) => handleUpdateStatus(e.target.value)}
//             className="border rounded px-3 py-1"
//           >
//             {statusOptions.map((status) => (
//               <option key={status} value={status}>{status}</option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailModal;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const shipmentStatusOptions = ['FAILED', 'DELIVERED', 'PENDING'];

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchShipment(orderId);
    }
  }, [isOpen, orderId]);
  

  const fetchShipment = async (orderId) => {
    console.log("Fetching shipment for orderId:", orderId);
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/tirashop/orders/${orderId}/shipments`);
      setShipment(res.data.data);
    } catch (err) {
      toast.error('Không thể tải thông tin giao hàng');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.put(
        `http://localhost:8080/tirashop/orders/shipments/${shipment.id}/status?status=${newStatus}`
      );
      toast.success('Cập nhật trạng thái thành công!');
      setShipment({ ...shipment, status: newStatus });
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl">
        <h2 className="text-xl font-bold mb-4">Chi tiết giao hàng</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : shipment ? (
          <>
            <p><strong>Mã vận đơn:</strong> {shipment.trackingNumber}</p>
            <p><strong>Phương thức giao:</strong> {shipment.shippingMethod}</p>
            <p><strong>Ngày tạo:</strong> {shipment.createdAt}</p>

            <div className="mt-4">
              <label className="block mb-1 font-medium">Trạng thái:</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={shipment.status}
                onChange={handleStatusChange}
              >
                {shipmentStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <p>Không có thông tin giao hàng.</p>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
