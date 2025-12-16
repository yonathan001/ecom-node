'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  let txRef = searchParams.get('tx_ref');
  
  // Fallback: Parse tx_ref manually if it's not found (Chapa might HTML-encode the URL)
  if (!txRef && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search.replace(/&amp;/g, '&'));
    txRef = urlParams.get('tx_ref');
  }

  useEffect(() => {
    console.log('Payment Success Page Loaded');
    console.log('Order ID:', orderId);
    console.log('TX Ref:', txRef);
    console.log('Full URL:', window.location.href);
    
    if (txRef) {
      console.log('TX Ref found, calling verifyPayment...');
      verifyPayment();
    } else {
      console.log('No TX Ref found, skipping verification');
      setVerifying(false);
    }
  }, [txRef]);

  const verifyPayment = async () => {
    try {
      // Add a small delay to allow Chapa to process the payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Verifying payment for tx_ref:', txRef);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/payment/verify/${txRef}`);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify/${txRef}`, {
        credentials: 'include'
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      const data = await res.json();
      console.log('Payment verification response:', data);
      
      setPaymentStatus(data);
    } catch (error) {
      console.error('Verification error:', error);
      setPaymentStatus({ success: false, message: 'Verification failed: ' + error.message });
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus?.success;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and will be processed shortly.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-bold text-black">#{orderId}</p>
              </div>
            )}
            <div className="space-y-3">
              <Link
                href="/products"
                className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => router.push('/')}
                className="block w-full border border-gray-200 text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Go to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              {paymentStatus?.message || 'There was an issue processing your payment. Please try again.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Try Again
              </Link>
              <button
                onClick={() => router.push('/cart')}
                className="block w-full border border-gray-200 text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
