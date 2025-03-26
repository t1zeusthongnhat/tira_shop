import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981"];

const BasicInforChart = () => {
    const [data, setData] = useState([
        { name: "Users", value: 0 },
        { name: "Products", value: 0 },
        { name: "Brands", value: 0 },
        { name: "Categories", value: 0 },
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userRes = await axios.get("http://localhost:8080/tirashop/user/list");
            const productRes = await axios.get("http://localhost:8080/tirashop/product");
            const brandRes = await axios.get("http://localhost:8080/tirashop/brand");
            const categoryRes = await axios.get("http://localhost:8080/tirashop/category");

            setData([
                { name: "Users", value: userRes.data.data.length },
                { name: "Products", value: productRes.data.data.elementList.length },
                { name: "Brands", value: brandRes.data.data.elementList.length },
                { name: "Categories", value: categoryRes.data.data.elementList.length },
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <motion.div
            className='bg-white shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-300'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-900'>Overview Basic Information</h2>

            <div className='h-80'>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#D1D5DB' />
                        <XAxis dataKey='name' stroke='#374151' />
                        <YAxis stroke='#374151' domain={[0, 40]} />  {/* Trục Y tối đa 50 */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderColor: "#D1D5DB",
                            }}
                            itemStyle={{ color: "#111827" }}
                        />
                        <Legend />
                        <Bar dataKey={'value'} fill='#8884d8'>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default BasicInforChart;
