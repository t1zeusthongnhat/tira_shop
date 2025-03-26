    import React, { useState } from 'react';
    import axios from 'axios';
    import { X } from 'lucide-react';
    import { toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';

    const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
        const [userData, setUserData] = useState({
            username: '',
            password: '',
            birthday: '',
            firstname: '',
            lastname: '',
            email: '',
            address: '',
            avatar: null,
            status: 'Active',
        });
        const [loading, setLoading] = useState(false);

        if (!isOpen) return null;

        const handleChange = (e) => {
            setUserData({ ...userData, [e.target.name]: e.target.value });
        };

        const handleFileChange = (e) => {
            setUserData({ ...userData, avatar: e.target.files[0] });
        };
        const formatDateToDDMMYYYY = (isoDate) => {
            if (!isoDate) return "";
            const [year, month, day] = isoDate.split("-");
            return `${day}-${month}-${year}`; // Chuyển thành "dd-MM-yyyy"
        };
        

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
        
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('password', userData.password);
            formData.append('birthday', formatDateToDDMMYYYY(userData.birthday)); // Chuyển đổi format
            formData.append('firstname', userData.firstname);
            formData.append('lastname', userData.lastname);
            formData.append('email', userData.email);
            formData.append('address', userData.address);
            formData.append('status', userData.status);
            if (userData.avatar) {
                formData.append('avatar', userData.avatar);
            }
        
            try {
                const response = await axios.post('http://localhost:8080/tirashop/user/create-new-user', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
        
                if (response.data && response.data.data) {
                    onUserAdded(response.data.data);
        
                    setUserData({
                        username: '',
                        password: '',
                        birthday: '',
                        firstname: '',
                        lastname: '',
                        email: '',
                        address: '',
                        avatar: null,
                        status: 'Active',
                    });
        
                    onClose();
                    toast.success('User added successfully!', { autoClose: 2000 });
                } else {
                    throw new Error(response.data.message || 'Invalid response from server');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to add user. Please try again.';
                toast.error(errorMessage);
                console.error('Error:', err);
            }
        
            setLoading(false);
        };
        
        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                <div className='bg-white p-5 rounded-lg shadow-lg w-96'>
                    <div className='flex justify-between items-center mb-2'>
                        <h2 className='text-lg font-semibold text-gray-900'>Add New User</h2>
                        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium'>Username</label>
                            <input
                                type='text'
                                name='username'
                                value={userData.username}
                                onChange={handleChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                required
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium'>Password</label>
                            <input
                                type='password'
                                name='password'
                                value={userData.password}
                                onChange={handleChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                required
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium '>Birthday</label>
                            <input
                                type='date'
                                name='birthday'
                                value={userData.birthday}
                                onChange={handleChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                required
                            />
                        </div>

                        <div className='mb-3 flex gap-2'>
                            <div className='w-1/2'>
                                <label className='block text-gray-700 text-sm font-medium'>First Name</label>
                                <input
                                    type='text'
                                    name='firstname'
                                    value={userData.firstname}
                                    onChange={handleChange}
                                    className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                            <div className='w-1/2'>
                                <label className='block text-gray-700 text-sm font-medium'>Last Name</label>
                                <input
                                    type='text'
                                    name='lastname'
                                    value={userData.lastname}
                                    onChange={handleChange}
                                    className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium'>Email</label>
                            <input
                                type='email'
                                name='email'
                                value={userData.email}
                                onChange={handleChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                required
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium '>Address</label>
                            <input
                                type='text'
                                name='address'
                                value={userData.address}
                                onChange={handleChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium'>Avatar</label>
                            <input
                                type='file'
                                name='avatar'
                                onChange={handleFileChange}
                                className='w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500'
                                accept='image/*'
                            />
                            {userData.avatar && (
                                <img
                                    src={URL.createObjectURL(userData.avatar)}
                                    alt='Avatar Preview'
                                    className='mt-2 w-20 h-20 object-cover rounded-lg'
                                />
                            )}
                        </div>

                        <div className='mb-3'>
                            <label className='block text-gray-700 text-sm font-medium mb-1'>Status</label>
                            <select
                                name='status'
                                value={userData.status}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            >
                                <option value="Active">Active</option>
                                <option value="Deactive">Deactive</option>
                            </select>
                        </div>

                        <div className='flex justify-end gap-2 mt-4'>
                            <button type='button' onClick={onClose} className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'>
                                Cancel
                            </button>
                            <button type='submit' disabled={loading} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                                {loading ? 'Adding...' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default AddUserModal;
