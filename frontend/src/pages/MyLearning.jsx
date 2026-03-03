import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PlayCircle, Clock, Heart } from 'lucide-react';
import CourseCard from '../components/courses/CourseCard';

const MyLearning = () => {
    const { user, token } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('courses');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [enrollmentsRes, wishlistsRes] = await Promise.all([
                    api.get('/enrollments'),
                    api.get('/wishlist')
                ]);

                // Sort enrollments by recently updated so they appear first
                const sortedEnrollments = (enrollmentsRes.data.enrollments || []).sort((a, b) => {
                    const latestA = Math.max(...(a.videoProgress?.map(p => new Date(p.updatedAt).getTime()) || [0]));
                    const latestB = Math.max(...(b.videoProgress?.map(p => new Date(p.updatedAt).getTime()) || [0]));
                    return latestB - latestA;
                });

                setEnrollments(sortedEnrollments);
                setWishlists(wishlistsRes.data || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch your dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            fetchDashboardData();
        }
    }, [user, token]);

    if (!user && !token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex flex-col w-full min-h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="bg-gray-900 text-white py-12 px-4 md:px-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold font-serif">My learning</h1>
                    <div className="mt-8 flex space-x-6 border-b border-gray-700">
                        <button
                            className={`pb-2 font-bold text-lg transition-colors ${activeTab === 'courses' ? 'border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            All courses
                        </button>
                        <button
                            className={`pb-2 font-bold text-lg transition-colors ${activeTab === 'wishlist' ? 'border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('wishlist')}
                        >
                            Wishlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 w-full">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'courses' && (
                            enrollments.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                                    <h3 className="text-xl font-medium text-gray-600 mb-4">You are not enrolled in any courses</h3>
                                    <Link to="/" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">
                                        Browse Courses
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                                    {enrollments.map(enrollment => {
                                        const course = enrollment.course;
                                        // Ensure we clamp between 0 and 100
                                        const progress = Math.min(100, Math.max(0, enrollment.progressPercent || 0));

                                        return (
                                            <div key={enrollment.id} className="flex flex-col group h-full cursor-pointer hover:opacity-90 transition-opacity">
                                                <div className="relative overflow-hidden aspect-video border border-gray-200">
                                                    <Link to={`/watch/${course.id}`}>
                                                        <img
                                                            src={course.thumbnail || `https://source.unsplash.com/random/800x600/?education,technology&sig=${course.id}`}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3';
                                                            }}
                                                        />
                                                        {/* Play overlay overlay */}
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                            <PlayCircle className="text-white h-16 w-16 opacity-90" />
                                                        </div>
                                                    </Link>
                                                </div>

                                                <div className="flex flex-col flex-1 py-1 pr-2">
                                                    <h3 className="font-bold text-[15px] text-gray-900 line-clamp-2 leading-tight mt-2 mb-1">
                                                        <Link to={`/watch/${course.id}`} className="hover:text-blue-700">
                                                            {course.title}
                                                        </Link>
                                                    </h3>

                                                    {course.instructor && (
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            {course.instructor.name}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto pt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                            <div
                                                                className="bg-blue-600 h-1.5 rounded-full"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs text-gray-600">
                                                            <span>{Math.round(progress)}% complete</span>
                                                            {progress === 100 && <span className="text-green-600 font-bold">Completed</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}

                        {activeTab === 'wishlist' && (
                            wishlists.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                                    <h3 className="text-xl font-medium text-gray-600 mb-4">You have no items in your wishlist</h3>
                                    <Link to="/" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">
                                        Browse Courses
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                                    {wishlists.map(wishlistItem => (
                                        <CourseCard key={wishlistItem.id} course={wishlistItem.course} />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLearning;
