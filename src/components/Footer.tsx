
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 pt-12 pb-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <MapPin className="mr-2 h-6 w-6 text-blue-600" />
              Into the Wild
            </Link>
            <p className="text-gray-600 mb-4">
              Your community platform for discovering and sharing trekking adventures across India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              </li>
              <li>
                <Link to="/trek-events" className="text-gray-600 hover:text-blue-600">Trek Events</Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-600 hover:text-blue-600">Sign In</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">Trekking Guide</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">Safety Tips</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">Packing List</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                <span className="text-gray-600">contact@intothewild.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                <span className="text-gray-600">+91 9876543210</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>© {currentYear} Into the Wild. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
