import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";

const stripePromise = loadStripe("pk_test_51PwdW2GoC2KtLVEElLfib1oJy8etEBaGJp1xbM8M0CSdQCjbWXuNwtUtF13pSKUeCfo596ANfQaONbN7HZMwF30Q00a17BKUjf");

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSaving = savings.toFixed(2);

  const handlePayment = async () => {
    const stripe = await stripePromise;
    const res = await axios.post("/payments/create-checkout-session", { products: cart, couponCode: coupon ? coupon.code : null });

    const session = res.data;
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
      console.error(result.error);
    }
  };
  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-emerald-500">Order Summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">Original Price</dt>
            <dd className="text-base font-bold text-white">&#8377; {formattedSubtotal}</dd>
          </dl>
          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-bold text-emerald-400">-&#8377;{formattedSaving}</dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Coupon {coupon.code}</dt>
              <dd className="text-base font-bold text-emerald-400">-{coupon.discountPercentage}%</dd>
            </dl>
          )}

          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-gray-300">Total</dt>
            <dd className="text-base font-bold text-emerald-400">&#8377; {formattedTotal}</dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-500  px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none 
        focus:ring-4 focus:ring-emerald-300 "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link to={"/"} className="text-sm font-medium text-emerald-400">
            Continue to Shop
          </Link>
          <MoveRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
