
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-6 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Blank App. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">
              A simple starting point for your project
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
