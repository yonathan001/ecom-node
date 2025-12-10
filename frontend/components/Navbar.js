'use client';
import Link from 'next/link';
import { useSession, signOut } from '../lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const user = session?.user;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            eCommerce
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/products" className="hover:text-blue-200">
              Products
            </Link>
            
            {user ? (
              <>
                <Link href="/cart" className="hover:text-blue-200">
                  Cart
                </Link>
                {user.is_admin && (
                  <Link href="/admin" className="hover:text-blue-200">
                    Admin
                  </Link>
                )}
                <span className="text-sm">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
