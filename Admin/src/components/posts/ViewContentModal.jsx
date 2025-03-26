import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ViewContentModal = ({ post, onClose }) => {
    if (!post) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4'>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className='bg-white p-8 rounded-3xl shadow-xl w-[600px] max-h-[85vh] overflow-y-auto relative'
            >
                <div className='bg-white p-4 flex justify-between items-center border-b pb-4 mb-4 rounded-t-3xl'>
                    <h1 className='text-2xl font-bold text-gray-900'>View Full Content of {post.name}</h1>
                    <button className='text-gray-500 hover:text-gray-700' onClick={onClose}>
                        <X size={28} />
                    </button>
                </div>
                <p className='mt-4 text-gray-800 text-base leading-relaxed'>{post.content}</p>
            </motion.div>
        </div>
    );
};

export default ViewContentModal;