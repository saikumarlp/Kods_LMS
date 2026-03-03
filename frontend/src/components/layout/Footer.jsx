import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white w-full border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between">
                <div className="flex flex-col space-y-3 mb-8 md:mb-0">
                    <Link to="#" className="hover:underline text-sm font-semibold">KosLearn for Business</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Teach on KosLearn</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Get the app</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">About us</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Contact us</Link>
                </div>

                <div className="flex flex-col space-y-3 mb-8 md:mb-0">
                    <Link to="#" className="hover:underline text-sm font-semibold">Careers</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Blog</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Help and Support</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Affiliate</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Investors</Link>
                </div>

                <div className="flex flex-col space-y-3">
                    <Link to="#" className="hover:underline text-sm font-semibold">Terms</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Privacy policy</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Cookie settings</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Sitemap</Link>
                    <Link to="#" className="hover:underline text-sm font-semibold">Accessibility statement</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between border-t border-gray-800">
                <Link to="/" className="text-2xl font-bold mb-4 md:mb-0 tracking-tight">
                    Kos<span className="text-indigo-400">Learn</span>
                </Link>
                <p className="text-xs text-gray-400">© 2026 KosLearn. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
