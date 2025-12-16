'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';
import { formatPrice } from '../../lib/currency';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ shipping_address: shippingAddress })
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        addToast(data.error || 'Error creating order', 'error');
        setLoading(false);
        return;
      }

      const orderData = await orderRes.json();
      const orderId = orderData.order_id;

      // Step 2: Initialize payment with Chapa
      const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: cart.total,
          orderId: orderId,
          shippingAddress: shippingAddress
        })
      });

      if (!paymentRes.ok) {
        const data = await paymentRes.json();
        addToast(data.error || 'Error initializing payment', 'error');
        setLoading(false);
        return;
      }

      const paymentData = await paymentRes.json();

      // Step 3: Redirect to Chapa checkout
      if (paymentData.checkout_url) {
        addToast('Redirecting to payment...', 'success');
        window.location.href = paymentData.checkout_url;
      } else {
        addToast('Payment initialization failed', 'error');
        setLoading(false);
      }
    } catch (error) {
      addToast('Error: ' + error.message, 'error');
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-black">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6 text-black">Shipping Information</h2>
              <form onSubmit={handleCheckout}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    placeholder="Enter your full shipping address including city and phone number"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                    rows="5"
                    required
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-black">Secure Payment with Chapa</p>
                      <p className="text-xs text-gray-600 mt-1">Pay with Telebirr, CBE Birr, or other mobile money services</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 text-black">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-black">{formatPrice(cart.total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout powered by Chapa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
