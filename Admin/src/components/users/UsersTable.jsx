import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Edit, Trash, Mail, Plus } from 'lucide-react';
import Pagination from '../common/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider, { showToast } from "../ToastProvider";
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import SendEmailModal from './SendEmailModal'; 

const UsersTable = () => {
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	//send email
	const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
	const pageSize = 5;

	useEffect(() => {
		fetchUsers();
	}, [currentPage, searchTerm]);


	//edit modal

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const handleEditClick = (user) => {
		setSelectedUser(user);
		setIsEditModalOpen(true);
	};

	const handleUserUpdated = (updatedUser) => {
		setUsers((prevUsers) =>
			prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
		);
		setIsEditModalOpen(false);
		setSelectedUser(null);
	};
	
	//send email
	const handleOpenSendEmailModal = (email) => {
        setSelectedUserEmail(email);
        setIsSendEmailModalOpen(true);
    };

	//add modal
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const handleUserAdded = (newUser) => {
		setUsers((prevUsers) => [...prevUsers, newUser]);
		setIsAddModalOpen(false);
	};

	const fetchUsers = async () => {
		try {
			const response = await axios.get(`http://localhost:8080/tirashop/user/list`);
			let fetchedUsers = response.data.data || [];

			if (searchTerm) {
				fetchedUsers = fetchedUsers.filter(user =>
					user.username.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}

			setTotalPages(Math.ceil(fetchedUsers.length / pageSize));
			const paginatedUsers = fetchedUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
			setUsers(paginatedUsers);
		} catch (err) {
			console.error('Error fetching users:', err);
			toast.error("Failed to load user data.");
		}
	};

	const handleStatusChange = async (userId, newStatus) => {
		try {
			await axios.put(`http://localhost:8080/tirashop/user/update/${userId}`, { status: newStatus });
			toast.success("User status updated successfully!");
			fetchUsers();
		} catch (err) {
			console.error("Error updating user status:", err);
			toast.error("Failed to update status.");
		}
	};
	return (
		<div className='my-5 p-6 bg-white text-black rounded-xl shadow-lg'>
			<ToastProvider />
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-900'>User List</h2>
				<div className='flex items-center space-x-3'>
					<div className='relative'>
						<input
							type='text'
							placeholder='Search by username...'
							className='bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							onChange={(e) => setSearchTerm(e.target.value)}
							value={searchTerm}
						/>
						<Search className='absolute left-3 top-2.5 text-gray-500' size={18} />
					</div>
					<button onClick={() => setIsAddModalOpen(true)} className='bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
						<Plus size={18} /> Add New Product
					</button>
				</div>

			</div>
			{/* Thêm thanh scroll ngang */}
			<div className='overflow-x-auto w-full'>
				<table className='min-w-max w-full divide-y divide-gray-300'>
					<thead>
						<tr>
							<th className='w-20 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>User ID</th>
							<th className='w-40 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Username</th>
							<th className='w-32 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase'>Avatar</th>
							{/* <th className='w-48 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase'>Password</th> */}
							<th className='w-36 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Birthday</th>
							<th className='w-36 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>First Name</th>
							<th className='w-36 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Last Name</th>
							<th className='w-36 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Email</th>
							<th className='w-48 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Address</th>
							<th className='w-28 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Status</th>
							<th className='w-40 py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase '>Actions</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-300'>
						{users.map((user) => (
							<motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.id}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.username}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>
									<img src={`http://localhost:8080${user.avatar}`} alt="Avatar" className='w-[65px] h-[65px] rounded-full' />
								</td>
								{/* <td className='py-3 px-4 text-sm text-gray-700'>{user.password}</td> */}
								<td className='py-3 px-4 text-sm text-gray-700'>{user.birthday}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.firstname}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.lastname}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.email}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.address}</td>
								<td className='py-3 px-4 text-sm text-gray-700'>{user.status}
									
								</td>
								<td className='pt-9 px-4 text-sm text-gray-700 flex space-x-4'>
									{/* <button className='text-blue-600 hover:text-blue-500' onClick={() => handleEditClick(user)}>
										<Edit size={18} />
									</button> */}

									
									<button className='text-green-600 hover:text-green-500'  onClick={() => handleOpenSendEmailModal(user.email)}>
										<Mail size={18} />
									</button>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>

			<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
			<AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onUserAdded={handleUserAdded} />
			<EditUserModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				user={selectedUser}
				onUserUpdated={handleUserUpdated}
			/>
			 <SendEmailModal 
                isOpen={isSendEmailModalOpen} 
                onClose={() => setIsSendEmailModalOpen(false)}
                recipientEmail={selectedUserEmail}
            />
			<ToastContainer />
		</div>
	);
};

export default UsersTable;
