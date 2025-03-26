import {  BarChart2, ShoppingBag, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import BasicInforChart from "../components/overview/BasicInforChart";

import { useState, useEffect } from "react";
import axios from "axios";
import ReviewRatingChart from "../components/overview/ReviewRatingChart";
import { MdOutlineBrandingWatermark } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import ReviewTrendChart from "../components/overview/ReviewTrendChart";

const OverviewPage = () => {

	const [totalUsers, setTotalUsers] = useState(0);
	const [totalProducts, setTotalProducts] = useState(0);
	const [totalBrands, setTotalBrands] = useState(0);
	const [totalCategories, setTotalCategories] = useState(0);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const userRes = await axios.get("http://localhost:8080/tirashop/user/list");
			const productRes = await axios.get("http://localhost:8080/tirashop/product");
			const brandRes = await axios.get("http://localhost:8080/tirashop/brand");
			const categoryRes = await axios.get("http://localhost:8080/tirashop/category");

			setTotalUsers(userRes.data.data.length);
			setTotalProducts(productRes.data.data.elementList.length);
			setTotalBrands(brandRes.data.data.elementList.length);
			setTotalCategories(categoryRes.data.data.elementList.length);
		} catch (err) {
			console.error("Error fetching stats:", err);
		}
	};


	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Overview' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<Link to="/users">
						<StatCard name='Total Users' icon={Users} value={totalUsers} color='#6366F1' />
					</Link>
					<Link to="/products">
						<StatCard name='Total Products' icon={ShoppingBag} value={totalProducts} color='#8B5CF6' />
					</Link>
					<Link to="/brands">
						<StatCard name='Total Brands' icon={MdOutlineBrandingWatermark} value={totalBrands} color='#EC4899' />
					</Link>
					<Link to="/categories">
						<StatCard name='Total Categories' icon={BiCategory} value={totalCategories} color='#10B981' />
					</Link>
				</motion.div>

				{/* CHARTS */}

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* <SalesOverviewChart /> */}
					<ReviewTrendChart/>
					{/* <CategoryDistributionChart /> */}
					<ReviewRatingChart/>
					<BasicInforChart />

				</div>
			</main>
		</div>
	);
};
export default OverviewPage;
