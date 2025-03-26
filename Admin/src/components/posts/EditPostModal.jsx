import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditPostModal = ({ isOpen, onClose, post, onPostUpdated }) => {
    const [postData, setPostData] = useState({
        name: '',
        topic: '',
        short_description: '',
        content: '',
        image: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (post) {
            setPostData({
                name: post.name,
                topic: post.topic,
                short_description: post.short_description,
                content: post.content,
                image: null,
            });
        }
    }, [post]);

    if (!isOpen || !post) return null;

    const handleChange = (e) => {
        setPostData({ ...postData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPostData({ ...postData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', postData.name);
        formData.append('topic', postData.topic);
        formData.append('shortDescription', postData.short_description);
        formData.append('content', postData.content);
        if (postData.image) {
            formData.append('image', postData.image);
        }

        try {
            const response = await axios.put(`http://localhost:8080/tirashop/posts/${post.id}/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.data) {
                onPostUpdated(response.data.data);
                onClose();
                toast.success('Post updated successfully!', { autoClose: 2000 });
            } else {
                throw new Error(response.data.message || 'Invalid response from server');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update post. Please try again.';
            toast.error(errorMessage);
            console.error('Error:', err);
        }

        setLoading(false);
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-[800px]'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-semibold text-gray-900'>Edit Post</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='mb-1'>
                        <label className='block text-gray-700 text-sm font-medium mb-1'>Post Name</label>
                        <input
                            type='text'
                            name='name'
                            value={postData.name}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div className='mb-1'>
                        <label className='block text-gray-700 text-sm font-medium mb-1'>Topic</label>
                        <input
                            type='text'
                            name='topic'
                            value={postData.topic}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div className='mb-1'>
                        <label className='block text-gray-700 text-sm font-medium mb-1'>Short Description</label>
                        <textarea
                            name='shortDescription'
                            value={postData.short_description}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div className='mb-1'>
                        <label className='block text-gray-700 text-sm font-medium mb-1'>Content</label>
                        <textarea
                            name='content'
                            value={postData.content}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-40'
                            required
                        />
                    </div>

                    <div className='mb-1'>
                        <label className='block text-gray-700 text-sm font-medium mb-1'>Image</label>
                        <input
                            type='file'
                            name='image'
                            onChange={handleFileChange}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            accept='image/*'
                        />
                        {post.imageUrl && !postData.image && (
                            <img
                                src={`http://localhost:8080${post.imageUrl}`}
                                alt='Post Image'
                                className='mt-2 w-20 h-20 object-cover rounded-lg'
                            />
                        )}
                        {postData.image && (
                            <img
                                src={URL.createObjectURL(postData.image)}
                                alt='New Post Image'
                                className='mt-2 w-20 h-20 object-cover rounded-lg'
                            />
                        )}
                    </div>

                    <div className='flex justify-end gap-2 mt-2'>
                        <button type='button' onClick={onClose} className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'>
                            Cancel
                        </button>
                        <button type='submit' disabled={loading} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                            {loading ? 'Updating...' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;
