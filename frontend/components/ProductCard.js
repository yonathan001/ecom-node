import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img
        src={product.image_url || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">${product.price}</span>
          <Link
            href={`/products/${product.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-orange-500 text-sm mt-2">Only {product.stock} left!</p>
        )}
        {product.stock === 0 && (
          <p className="text-red-500 text-sm mt-2">Out of stock</p>
        )}
      </div>
    </div>
  );
}
