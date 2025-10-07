
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-semibold mb-2">Into The Wild</h3>
          <p className="text-gray-600">Explore outdoor adventures with a friendly community.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Navigation</h3>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            <Link to="/events" className="text-gray-600 hover:text-blue-600">Adventures</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-gray-600">support@intothewild.example</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
