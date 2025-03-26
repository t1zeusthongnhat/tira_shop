import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
    const [formData, setFormData] = useState({
        newUsername: '',
        firstname: '',
        lastname: '',
        phone: '',
        address: '',
        email: '',
        birthday: '',
        gender: '',
        avatar: null,
    });
    const [loading, setLoading] = useState(false);

    const formatDateToYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };
    const convertToDDMMYYYY = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}-${month}-${year}`;
    };



    useEffect(() => {
        if (profile) {
            setFormData({
                newUsername: profile.username || '',
                firstname: profile.firstname || '',
                lastname: profile.lastname || '',
                phone: profile.phone || '',
                address: profile.address || '',
                email: profile.email || '',
                birthday: formatDateToYYYYMMDD(profile.birthday) || '',
                gender: profile.gender || '',
                avatar: null,
            });
        }
    }, [profile]);

    if (!isOpen || !profile) return null;
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, avatar: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');

        const form = new FormData();
        form.append('newUsername', formData.newUsername);
        form.append('firstname', formData.firstname);
        form.append('lastname', formData.lastname);
        form.append('phone', formData.phone);
        form.append('address', formData.address);
        form.append('email', formData.email);
        form.append('birthday', convertToDDMMYYYY(formData.birthday));
        form.append('gender', formData.gender);

        if (formData.avatar) {
            form.append('avatar', formData.avatar);
        }

        try {
            const response = await axios.put('http://localhost:8080/tirashop/user/update-profile', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.data) {
                onProfileUpdated(response.data.data);
                onClose();
                toast.success('Profile updated successfully!', { autoClose: 2000 });
            } else {
                throw new Error(response.data.message || 'Invalid response from server');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
            toast.error(errorMessage);
            console.error('Error:', err);
        }

        setLoading(false);
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-semibold text-gray-900'>Edit Profile</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='newUsername'>Username</label>
                            <input
                                id='newUsername'
                                name='newUsername'
                                value={formData.newUsername}
                                onChange={handleChange}
                                placeholder='Username'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='phone'>Phone</label>
                            <input
                                id='phone'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder='Phone'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='firstname'>First Name</label>
                            <input
                                id='firstname'
                                name='firstname'
                                value={formData.firstname}
                                onChange={handleChange}
                                placeholder='First Name'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='lastname'>Last Name</label>
                            <input
                                id='lastname'
                                name='lastname'
                                value={formData.lastname}
                                onChange={handleChange}
                                placeholder='Last Name'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>



                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='address'>Address</label>
                            <input
                                id='address'
                                name='address'
                                value={formData.address}
                                onChange={handleChange}
                                placeholder='Address'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='email'>Email</label>
                            <input
                                id='email'
                                name='email'
                                type='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Email'
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>


                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='birthday'>Birthday</label>
                            <input
                                id='birthday'
                                name='birthday'
                                type='date'
                                value={formData.birthday}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='gender'>Gender</label>
                            <select
                                id='gender'
                                name='gender'
                                value={formData.gender}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                    </div>

                    <div className='mt-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='avatar'>Avatar</label>
                        <input
                            id='avatar'
                            type='file'
                            name='avatar'
                            onChange={handleFileChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black'
                            accept='image/*'
                        />
                        {profile.avatar && !formData.avatar && (
                            <img
                                src={`http://localhost:8080${profile.avatar}`}
                                alt='Current Avatar'
                                className='mt-2 w-20 h-20 object-cover rounded-lg'
                            />
                            
                        )}
                        {formData.avatar && (
                            <img
                                src={URL.createObjectURL(formData.avatar)}
                                alt='New Avatar Preview'
                                className='mt-2 w-20 h-20 object-cover rounded-lg'
                            />
                            
                        )}
                    </div>

                    <div className='flex justify-end gap-2 mt-6'>
                        <button type='button' onClick={onClose} className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'>
                            Cancel
                        </button>
                        <button type='submit' disabled={loading} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditProfileModal;