
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const shipmentStatusOptions = ['FAILED', 'DELIVERED', 'PENDING'];

// const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
//   const [shipment, setShipment] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen && orderId) {
//       fetchShipment(orderId);
//     }
//   }, [isOpen, orderId]);
  

//   const fetchShipment = async (orderId) => {
//     console.log("Fetching shipment for orderId:", orderId);
//     try {
//       setLoading(true);
//       const res = await axios.get(`http://localhost:8080/tirashop/orders/${orderId}/shipments`);
//       setShipment(res.data.data);
//     } catch (err) {
//       toast.error('Không thể tải thông tin giao hàng');
//       setShipment(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (e) => {
//     const newStatus = e.target.value;
//     try {
//       await axios.put(
//         `http://localhost:8080/tirashop/orders/shipments/${shipment.id}/status?status=${newStatus}`
//       );
//       toast.success('Cập nhật trạng thái thành công!');
//       setShipment({ ...shipment, status: newStatus });
//     } catch (err) {
//       toast.error('Không thể cập nhật trạng thái');
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl">
//         <h2 className="text-xl font-bold mb-4">Chi tiết giao hàng</h2>

//         {loading ? (
//           <p>Đang tải...</p>
//         ) : shipment ? (
//           <>
//             <p><strong>Mã vận đơn:</strong> {shipment.trackingNumber}</p>
//             <p><strong>Phương thức giao:</strong> {shipment.shippingMethod}</p>
//             <p><strong>Ngày tạo:</strong> {shipment.createdAt}</p>

//             <div className="mt-4">
//               <label className="block mb-1 font-medium">Trạng thái:</label>
//               <select
//                 className="w-full border px-3 py-2 rounded"
//                 value={shipment.status}
//                 onChange={handleStatusChange}
//               >
//                 {shipmentStatusOptions.map((status) => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>
//           </>
//         ) : (
//           <p>Không có thông tin giao hàng.</p>
//         )}

//         <div className="mt-6 text-right">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailModal;


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderDetailModal = ({ isOpen, onClose }) => {
  const shipment = {
    id: 'ship123',
    trackingNumber: 'GRB789456VN',
    shippingMethod: 'GHTK',
    createdAt: '2025-04-02 10:00:00',
    status: 'DELIVERED'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              Order Shipment Details
            </h2>

            <div className="space-y-3 text-gray-700">
              <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
              <p><strong>Shipping Method:</strong> {shipment.shippingMethod}</p>
              <p><strong>Created At:</strong> {shipment.createdAt}</p>
              <p>
                <strong>Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-sm font-medium
                    ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      shipment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}
                >
                  {shipment.status}
                </span>
              </p>
            </div>

            <div className="mt-8 text-right">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors font-medium text-gray-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailModal;
