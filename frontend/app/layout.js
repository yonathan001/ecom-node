import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'eCommerce Store',
  description: 'Modern eCommerce application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
