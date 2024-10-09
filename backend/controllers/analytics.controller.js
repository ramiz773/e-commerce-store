import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // it groups all document same together
        totalSale: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  //   salesData return array
  const { totalSale, totalRevenue } = salesData[0] || { totalSale: 0, totalRevenue: 0 };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSale,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    //    example of daily data
    const dateArray = getDatesInRange(startDate, endDate);
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);
      console.log(foundData);
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const date = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    date.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return date;
}
