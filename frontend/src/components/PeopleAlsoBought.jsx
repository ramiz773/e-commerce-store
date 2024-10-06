import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
  const [recommendation, setRecommendation] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const res = await axios.get("/products/recommendations");
        setRecommendation(res.data);
      } catch (error) {
        toast.error(error.response.data.message || "An error occured while fetching recommendataions");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mt-8 ">
      <h3 className="text-2xl font-semibold text-emerald-400">People also bought</h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-coal-2 lg:grid-cols-3">
        {recommendation.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
