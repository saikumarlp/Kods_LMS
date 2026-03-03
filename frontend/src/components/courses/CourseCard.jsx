import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

const CourseCard = ({ course }) => {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const wishlisted = isWishlisted(course.id);

    const rating = course.averageRating
        ? parseFloat(course.averageRating).toFixed(1)
        : (Math.random() * 1.5 + 3.5).toFixed(1);
    const reviewCount = course._count?.reviews || Math.floor(Math.random() * 4000) + 200;
    const studentCount = course._count?.enrollments || Math.floor(Math.random() * 20000) + 500;

    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    const isDiscounted = course.discountPrice && course.discountPrice < course.price;
    const currentPrice = isDiscounted ? course.discountPrice : course.price;
    const originalPrice = isDiscounted ? course.price : null;
    const savingsPercent = isDiscounted
        ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
        : 0;

    const isBestseller = savingsPercent >= 30 || studentCount > 8000;
    const ratingStars = parseFloat(rating);

    const handleWishlistClick = (e) => {
        e.preventDefault(); // prevent card navigation
        e.stopPropagation();
        toggleWishlist(course.id);
    };

    return (
        <Link
            to={`/course/${course.id}`}
            className="group flex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden
                       shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={
                        course.thumbnail ||
                        `https://images.unsplash.com/photo-${1510000000000 + course.id * 7}?auto=format&fit=crop&w=600&q=80`
                    }
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80';
                    }}
                />

                {/* Dim overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isBestseller && (
                        <span className="bg-yellow-400 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
                            Bestseller
                        </span>
                    )}
                    {course.category && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            {course.category}
                        </span>
                    )}
                </div>

                {/* Discount badge */}
                {savingsPercent > 0 && (
                    <span className="absolute top-2 right-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        -{savingsPercent}%
                    </span>
                )}

                {/* ❤️ Wishlist button */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-1.5 right-1.5 p-1.5 rounded-full transition-all duration-200 z-10 shadow-md active:scale-90
                        ${wishlisted
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                        }`}
                    title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label={wishlisted ? `Remove ${course.title} from wishlist` : `Add ${course.title} to wishlist`}
                    aria-pressed={wishlisted}
                >
                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-white' : ''}`} />
                </button>
            </div>

            {/* Card Body */}
            <div className="flex flex-col flex-1 p-4 gap-1.5">
                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
                    {course.title}
                </h3>

                {/* Instructor */}
                {course.instructor && (
                    <p className="text-[11px] text-gray-400 truncate">
                        by {course.instructor.name}
                    </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[#b4690e] font-extrabold text-xs">{rating}</span>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(ratingStars)
                                    ? 'text-[#e59819] fill-[#e59819]'
                                    : i < ratingStars
                                        ? 'text-[#e59819] fill-[#e59819] opacity-50'
                                        : 'text-gray-300 fill-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] text-gray-400">({reviewCount.toLocaleString()})</span>
                </div>

                {/* Student count */}
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>{studentCount.toLocaleString()} students</span>
                </div>

                {/* Level */}
                {course.level && (
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{course.level}</span>
                )}

                {/* Price */}
                <div className="mt-auto pt-2 flex items-center flex-wrap gap-1.5">
                    {currentPrice === 0 ? (
                        <span className="font-extrabold text-base text-green-600">Free</span>
                    ) : (
                        <>
                            <span className="font-extrabold text-base text-gray-900">
                                {formatter.format(currentPrice)}
                            </span>
                            {originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatter.format(originalPrice)}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
