'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center">
                <img
                  src={item.image_url || 'https://via.placeholder.com/100'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-grow ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                  <div className="flex items-center mt-2">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-gray-800"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold text-gray-800">Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between mb-6">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-blue-600">${cart.total.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
