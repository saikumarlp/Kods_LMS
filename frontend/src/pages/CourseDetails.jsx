import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import axios from 'axios';
import {
    Star, PlayCircle, Check, AlertCircle, Heart,
    ChevronDown, ChevronUp, ThumbsUp, Users, Clock, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Star Rating Input Component ─── */
const StarInput = ({ value, onChange, size = 'h-8 w-8' }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className="transition-transform hover:scale-110"
            >
                <Star
                    className={`${size} transition-colors ${star <= value
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                        }`}
                />
            </button>
        ))}
    </div>
);

/* ─── Rating Breakdown Bar ─── */
const RatingBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 shrink-0 w-8 justify-end text-gray-600 font-medium">
                {star}<Star className="h-3 w-3 text-yellow-400 fill-yellow-400 inline" />
            </div>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 shrink-0 w-8">{pct}%</span>
        </div>
    );
};

/* ─── Individual Review Card ─── */
const ReviewCard = ({ review }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.comment && review.comment.length > 200;

    return (
        <div className="py-5 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm text-gray-900">{review.user?.name || 'Student'}</p>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    {review.comment && (
                        <div className="mt-1.5">
                            <p className={`text-sm text-gray-700 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
                                {review.comment}
                            </p>
                            {isLong && (
                                <button
                                    onClick={() => setExpanded(e => !e)}
                                    className="text-indigo-600 text-xs font-semibold mt-1 hover:underline flex items-center gap-0.5"
                                >
                                    {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show more</>}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ─── */
const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { isWishlisted, toggleWishlist } = useWishlist();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollError, setEnrollError] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [userReview, setUserReview] = useState(null); // user's own review if any
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const REVIEWS_PER_PAGE = 6;

    const wishlisted = isWishlisted(Number(id));

    /* fetch course */
    useEffect(() => {
        const fetchCourseDetails = async () => {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) { setError('Invalid course ID'); setLoading(false); return; }
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/courses/${parsedId}`);
                setCourse(data);
                if (user) {
                    try {
                        const { data: enrollData } = await api.get('/enrollments');
                        const userEnrollments = enrollData.enrollments || [];
                        setIsEnrolled(userEnrollments.some(e => e.courseId === parsedId));
                    } catch (_) { }
                }
            } catch (err) {
                if (err.response?.status === 404) setError('Course not found');
                else setError(err.response?.data?.message || 'Failed to fetch course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [id, user]);

    /* fetch reviews */
    const fetchReviews = useCallback(async () => {
        if (!id) return;
        setReviewsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.get(`${apiUrl}/reviews/course/${id}`);
            setReviews(data);
            if (user) {
                const mine = data.find(r => r.userId === user.id || r.user?.name === user.name);
                if (mine) setUserReview(mine);
            }
        } catch (_) {
        } finally {
            setReviewsLoading(false);
        }
    }, [id, user]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    /* computed */
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews)
        : (course?.averageRating || 0);

    const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }));

    const paginatedReviews = reviews.slice(0, reviewsPage * REVIEWS_PER_PAGE);
    const hasMore = reviews.length > paginatedReviews.length;

    /* actions */
    const handleEnrollment = async () => {
        if (!user) { navigate('/login'); return; }
        setIsEnrolling(true); setEnrollError(null);
        try {
            await api.post('/enrollments', { courseId: parseInt(id) });
            setIsEnrolled(true);
            toast.success('Successfully enrolled! Redirecting...');
            setTimeout(() => navigate(`/watch/${id}`), 1000);
        } catch (err) {
            setEnrollError(err.response?.data?.message || 'Failed to enroll');
            setIsEnrolling(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (newRating === 0) { toast.error('Please select a star rating'); return; }
        setSubmitting(true);
        try {
            await api.post('/reviews', { courseId: parseInt(id), rating: newRating, comment: newComment });
            toast.success('Review submitted! Thank you 🎉');
            setNewRating(0); setNewComment('');
            await fetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit review');
        } finally {
            setSubmitting(false);
        }
    };

    /* loading / error */
    if (loading) return (
        <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading course details...</p>
        </div>
    );
    if (error) return (
        <div className="p-20 text-center text-red-600">
            <AlertCircle className="inline h-8 w-8 mb-4" /><br />{error}
        </div>
    );
    if (!course) return null;

    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    const isDiscounted = course.discountPrice && course.discountPrice < course.price;
    const currentPrice = isDiscounted ? course.discountPrice : course.price;
    const originalPrice = isDiscounted ? course.price : null;
    const savingsPercent = isDiscounted ? Math.round(((course.price - course.discountPrice) / course.price) * 100) : 0;

    return (
        <div className="flex flex-col w-full relative bg-gray-50">

            {/* ── Dark Header ── */}
            <div className="bg-gray-900 text-white pt-10 pb-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative">
                    <div className="md:w-2/3 md:pr-10 lg:pr-20 z-10">
                        {course.category && (
                            <span className="inline-block bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                {course.category}
                            </span>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
                        <p className="text-lg mb-6 text-gray-300 line-clamp-3">{course.description}</p>

                        {/* Rating summary row */}
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                            <span className="bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded border border-yellow-400/30">
                                Bestseller
                            </span>
                            <span className="text-yellow-400 font-bold text-lg">{avgRating.toFixed(1)}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30'}`} />
                                ))}
                            </div>
                            <span className="text-blue-300 underline decoration-dotted cursor-pointer">
                                ({totalReviews.toLocaleString()} rating{totalReviews !== 1 ? 's' : ''})
                            </span>
                        </div>

                        {course.instructor && (
                            <p className="mb-4 text-gray-300 text-sm">
                                Created by <span className="text-blue-300 underline">{course.instructor.name}</span>
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                            {course.totalDuration > 0 && (
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {Math.ceil(course.totalDuration / 3600)}h total</span>
                            )}
                            {course.level && (
                                <span className="flex items-center gap-1.5"><BarChart2 className="h-4 w-4" /> {course.level}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full relative">
                <div className="md:w-2/3 md:pr-8">

                    {/* What you'll learn */}
                    <div className="border border-gray-200 rounded-xl p-6 mb-10 bg-white shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Master the core concepts of this course',
                                'Build real-world projects you can showcase',
                                'Understand modern development best practices',
                                'Earn a certificate of completion'
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Content */}
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Course content</h2>
                    <div className="border border-gray-200 rounded-xl mb-10 bg-white shadow-sm overflow-hidden">
                        {course.sections?.length > 0 ? course.sections.map((section, idx) => (
                            <div key={section.id} className="border-b border-gray-100 last:border-0">
                                <div className="bg-gray-50 px-5 py-3.5 font-bold flex justify-between items-center text-sm">
                                    <span className="text-gray-800">Section {idx + 1}: {section.title}</span>
                                    <span className="text-xs text-gray-500 font-normal">{section.lectures?.length || 0} lectures</span>
                                </div>
                                <div className="px-5 py-3 space-y-2.5">
                                    {section.lectures?.map((lecture, lIdx) => (
                                        <div key={lecture.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <PlayCircle className="h-4 w-4 shrink-0" />
                                                <span>{lIdx + 1}. {lecture.title}</span>
                                            </div>
                                            {lecture.duration > 0 && (
                                                <span className="text-gray-400 text-xs">{Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-500 text-sm">Syllabus is being prepared.</div>
                        )}
                    </div>

                    {/* Description */}
                    <h2 className="text-xl font-bold mb-3 text-gray-900">Description</h2>
                    <p className="text-gray-700 leading-relaxed mb-12">{course.description}</p>

                    {/* ══════════════════════════════════
                        REVIEWS & RATINGS SECTION
                    ══════════════════════════════════ */}
                    <div id="reviews">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            Student Reviews
                        </h2>

                        {/* Rating Overview */}
                        {totalReviews > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    {/* Big number */}
                                    <div className="text-center shrink-0">
                                        <p className="text-7xl font-extrabold text-gray-900 leading-none">{avgRating.toFixed(1)}</p>
                                        <div className="flex justify-center mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 font-semibold">Course Rating</p>
                                    </div>

                                    {/* Breakdown bars */}
                                    <div className="flex-1 w-full space-y-2">
                                        {ratingBreakdown.map(({ star, count }) => (
                                            <RatingBar key={star} star={star} count={count} total={totalReviews} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-right">{totalReviews} total review{totalReviews !== 1 ? 's' : ''}</p>
                            </div>
                        )}

                        {/* Submit Review Form */}
                        {isEnrolled && !userReview && (
                            <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 mb-8 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-1">Leave a review</h3>
                                <p className="text-sm text-gray-500 mb-4">Share your experience to help other students.</p>
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
                                        <StarInput value={newRating} onChange={setNewRating} />
                                        {newRating > 0 && (
                                            <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review (optional)</label>
                                        <textarea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            rows={4}
                                            placeholder="What did you like or dislike about this course? How would you describe it to a friend?"
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || newRating === 0}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-sm flex items-center gap-2"
                                    >
                                        {submitting
                                            ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                                            : 'Submit Review'
                                        }
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* User already reviewed */}
                        {userReview && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8 text-sm text-indigo-700 flex items-center gap-2">
                                <Check className="h-4 w-4 shrink-0" /> You've already reviewed this course. Thank you!
                            </div>
                        )}

                        {/* Not enrolled notice */}
                        {!isEnrolled && user && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-sm text-gray-600 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-gray-400" /> Enroll in this course to leave a review.
                            </div>
                        )}

                        {/* Review list */}
                        {reviewsLoading && (
                            <div className="text-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                            </div>
                        )}

                        {!reviewsLoading && reviews.length === 0 && (
                            <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
                                <Star className="h-12 w-12 text-gray-200 fill-gray-100 mx-auto mb-3" />
                                <p className="font-semibold text-gray-600">No reviews yet</p>
                                <p className="text-sm text-gray-400 mt-1">Be the first to review this course!</p>
                            </div>
                        )}

                        {!reviewsLoading && reviews.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50 px-6">
                                    {paginatedReviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>

                                {/* Load more */}
                                {hasMore && (
                                    <div className="px-6 py-4 border-t border-gray-100 text-center">
                                        <button
                                            onClick={() => setReviewsPage(p => p + 1)}
                                            className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1 mx-auto"
                                        >
                                            Load more reviews <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Floating Checkout Card ── */}
            <div className="md:absolute top-20 right-8 lg:right-[max(32px,calc((100vw-1280px)/2+32px))] w-full md:w-[340px] px-4 md:px-0 z-20 mb-10 md:mb-0">
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden md:sticky md:top-24">
                    <div className="hidden md:block relative">
                        <img
                            src={course.thumbnail || `https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80`}
                            alt={course.title}
                            className="w-full h-44 object-cover"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <div className="p-6">
                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-4xl font-extrabold text-gray-900">{formatter.format(currentPrice)}</span>
                            {originalPrice && (
                                <span className="text-lg text-gray-400 line-through pb-0.5">{formatter.format(originalPrice)}</span>
                            )}
                        </div>
                        {savingsPercent > 0 && (
                            <p className="text-red-600 font-bold text-sm mb-4">{savingsPercent}% off — Limited time deal!</p>
                        )}

                        {enrollError && <p className="text-red-500 text-sm mb-3 font-semibold">{enrollError}</p>}

                        {isEnrolled ? (
                            <button
                                onClick={() => navigate(`/watch/${id}`)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg mb-3 transition shadow-lg shadow-indigo-500/25"
                            >
                                Go to course →
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 mb-3">
                                <button
                                    onClick={handleEnrollment}
                                    disabled={isEnrolling}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2"
                                >
                                    {isEnrolling
                                        ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Enrolling...</>
                                        : 'Enroll now'
                                    }
                                </button>

                                <button
                                    onClick={() => toggleWishlist(Number(id))}
                                    className={`w-full border-2 font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 text-sm ${wishlisted
                                        ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100'
                                        : 'border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                >
                                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                                    {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>
                        )}

                        <p className="text-center text-xs text-gray-400 mb-5">30-Day Money-Back Guarantee</p>

                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="font-bold text-gray-800">This course includes:</p>
                            {course.totalDuration > 0 && (
                                <div className="flex items-center gap-2"><PlayCircle className="h-4 w-4 text-gray-400" />{Math.ceil(course.totalDuration / 3600)} hours on-demand video</div>
                            )}
                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-gray-400" />Full lifetime access</div>
                            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" />Access on mobile and desktop</div>
                            <div className="flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-gray-400" />Certificate of completion</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
