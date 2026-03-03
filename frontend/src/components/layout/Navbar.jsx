import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Search, ShoppingCart, User, LogOut, Menu, Bell, BookOpen, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { wishlist } = useWishlist();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between px-4 h-16 md:px-6">

                {/* Left Section: Logo & Categories */}
                <div className="flex items-center">
                    <button className="md:hidden mr-4 text-gray-700 hover:text-black">
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link to="/" className="flex items-center text-gray-900 mr-8">
                        <span className="text-2xl font-bold tracking-tight">
                            Kos<span className="text-indigo-600">Learn</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center cursor-pointer group relative text-sm text-gray-700 hover:text-black transition-colors">
                        <span>Categories</span>
                        {/* Simple Dropdown Stub */}
                        <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <Link to="/?category=Development" className="block px-4 py-2 hover:bg-gray-100">Development</Link>
                            <Link to="/?category=Business" className="block px-4 py-2 hover:bg-gray-100">Business</Link>
                            <Link to="/?category=Design" className="block px-4 py-2 hover:bg-gray-100">Design</Link>
                        </div>
                    </div>
                </div>

                {/* Center Section: Search Bar */}
                <div className="hidden md:flex flex-1 max-w-3xl mx-8 relative">
                    <form className="w-full flex" onSubmit={handleSearch}>
                        <button type="submit" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900">
                            <Search className="h-5 w-5" />
                        </button>
                        <input
                            type="text"
                            placeholder="Search for anything"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right Section: Navigation Links & Auth */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    <button className="md:hidden text-gray-700 hover:text-black p-2">
                        <Search className="h-5 w-5" />
                    </button>

                    <Link to="/" className="hidden lg:block text-sm text-gray-700 hover:text-black px-2 transition-colors">
                        KosLearn for Business
                    </Link>
                    <Link to="/" className="hidden lg:block text-sm text-gray-700 hover:text-black px-2 transition-colors">
                        Teach on KosLearn
                    </Link>

                    {user ? (
                        <div className="flex items-center space-x-1 md:space-x-4 pl-2">
                            <Link to="/my-learning" className="text-sm font-medium text-gray-700 hover:text-black hidden sm:block p-2">
                                My learning
                            </Link>

                            <Link to="/wishlist" className="relative text-gray-700 hover:text-red-500 p-2 hidden sm:block transition-colors" title="My Wishlist">
                                <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                {wishlist.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {wishlist.length > 9 ? '9+' : wishlist.length}
                                    </span>
                                )}
                            </Link>

                            <button className="text-gray-700 hover:text-black p-2 relative hidden sm:block">
                                <Bell className="h-5 w-5" />
                            </button>

                            <div className="group relative">
                                <button className="w-8 h-8 rounded-full bg-gray-900 text-white flex justify-center items-center text-sm font-bold ml-2">
                                    {user.name?.charAt(0).toUpperCase()}
                                </button>

                                {/* User Dropdown Profile Menu */}
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="p-4 flex items-center border-b border-gray-200">
                                        <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex justify-center items-center text-xl font-bold mr-3">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="py-2 border-b border-gray-200">
                                        <Link to="/my-learning" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <BookOpen className="h-4 w-4 mr-3 text-gray-500" /> My learning
                                        </Link>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="h-4 w-4 mr-3 text-gray-500" /> Log out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 ml-2">
                            <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-900 border border-gray-900 px-4 py-2 hover:bg-gray-100 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-white bg-gray-900 px-4 py-2 hover:bg-gray-800 transition-colors">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
