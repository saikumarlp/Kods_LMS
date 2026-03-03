import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import CourseCard from '../components/courses/CourseCard';

const WishlistSkeleton = () => (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-100 bg-white animate-pulse shadow-sm">
        <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-100" />
        <div className="p-4 flex flex-col gap-2.5">
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
            <div className="flex gap-1 items-center mt-1">
                {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-3 rounded bg-gray-200" />)}
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-1" />
        </div>
    </div>
);

const Wishlist = () => {
    const { wishlistItems, loading, fetchWishlist, toggleWishlist } = useWishlist();

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="h-6 w-6 text-red-400 fill-red-400" />
                        <h1 className="text-3xl font-extrabold">My Wishlist</h1>
                    </div>
                    <p className="text-gray-300 text-sm">
                        {loading
                            ? 'Loading your wishlist...'
                            : `${wishlistItems.length} course${wishlistItems.length !== 1 ? 's' : ''} saved`
                        }
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => <WishlistSkeleton key={i} />)}
                    </div>
                )}

                {/* Empty State */}
                {!loading && wishlistItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                                <Heart className="h-12 w-12 text-red-300" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                            Start saving courses you're interested in. Click the ❤️ heart icon on any course card to add it here.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                        >
                            Explore courses <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}

                {/* Wishlist Grid */}
                {!loading && wishlistItems.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Saved courses ({wishlistItems.length})
                            </h2>
                            <Link to="/" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                                Browse more <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {wishlistItems.map((item) => (
                                <div key={item.id} className="relative group">
                                    <CourseCard course={item.course} />
                                    {/* Remove from wishlist overlay button */}
                                    <button
                                        onClick={() => toggleWishlist(item.courseId)}
                                        className="absolute bottom-[4.5rem] right-3 z-10 opacity-0 group-hover:opacity-100
                                                   bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-semibold
                                                   px-2.5 py-1.5 rounded-lg flex items-center gap-1.5
                                                   shadow-lg transition-all duration-200 -translate-y-1 group-hover:translate-y-0"
                                        title="Remove from wishlist"
                                        aria-label={`Remove ${item.course?.title || 'course'} from wishlist`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
