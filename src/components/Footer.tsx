import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13z"/>
                </svg>
                <h3 className="text-xl font-bold text-white">allBooks.co.in</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Your ultimate destination for discovering amazing books. From bestsellers to hidden gems, 
                find your next great read with our curated collection.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/bestsellers" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link href="/new-releases" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    New Releases
                  </Link>
                </li>
                <li>
                  <Link href="/just-listed" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Just Listed
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/disclaimer" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Sitemap
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300 hover:text-green-400 transition-colors duration-200">
                  <Mail className="h-4 w-4 mr-3 text-green-400" />
                  <a href="mailto:info@allbooks.co.in" className="hover:underline">
                    info@allbooks.co.in
                  </a>
                </div>
                <div className="flex items-center text-gray-300 hover:text-green-400 transition-colors duration-200">
                  <Phone className="h-4 w-4 mr-3 text-green-400" />
                  <a href="tel:+15551234567" className="hover:underline">
                    +1 (555) 123-4567
                  </a>
                </div>
                <div className="flex items-start text-gray-300">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-green-400" />
                  <span>123 Book Street<br />Reading City, RC 12345</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} allBooks.co.in. All rights reserved.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" />
              <span>for book lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 