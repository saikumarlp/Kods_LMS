import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/courses/CourseCard';
import {
    Search, BookOpen, Users, Star, TrendingUp,
    ChevronRight, ArrowRight, Play, Award, Globe, Zap,
    Code, Database, BarChart2, Layers, Palette, Music, Briefcase, Mic
} from 'lucide-react';

const CATEGORIES = [
    { label: 'Development', icon: Code, color: 'from-blue-600 to-indigo-600' },
    { label: 'Data Science', icon: BarChart2, color: 'from-emerald-500 to-teal-600' },
    { label: 'IT & Software', icon: Layers, color: 'from-orange-500 to-amber-600' },
    { label: 'Database', icon: Database, color: 'from-purple-600 to-violet-600' },
    { label: 'Design', icon: Palette, color: 'from-pink-500 to-rose-600' },
    { label: 'Marketing', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Business', icon: Briefcase, color: 'from-cyan-500 to-blue-600' },
    { label: 'Music', icon: Mic, color: 'from-red-500 to-pink-600' },
];

const STATS = [
    { value: '75,000+', label: 'Online courses', icon: BookOpen },
    { value: '4.8', label: 'Average rating', icon: Star },
    { value: '58M+', label: 'Students enrolled', icon: Users },
    { value: '180+', label: 'Countries reached', icon: Globe },
];

const CourseSkeleton = () => (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-100 bg-white animate-pulse shadow-sm">
        <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-100" />
        <div className="p-4 flex flex-col gap-2.5">
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
            <div className="flex gap-1 items-center mt-1">
                {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-3 rounded bg-gray-200" />)}
                <div className="h-3 w-12 rounded-full bg-gray-200 ml-1" />
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-1" />
        </div>
    </div>
);

const Home = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchFilter = searchParams.get('search');
    const categoryFilter = searchParams.get('category');

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const coursesRef = useRef(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                let endpoint = '/courses?limit=12';
                if (searchFilter) endpoint += `&search=${encodeURIComponent(searchFilter)}`;
                if (categoryFilter) endpoint += `&category=${encodeURIComponent(categoryFilter)}`;
                const { data } = await api.get(endpoint);
                setCourses(data.courses || []);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [searchFilter, categoryFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    };

    const scrollToCourses = () => coursesRef.current?.scrollIntoView({ behavior: 'smooth' });

    const isDefaultView = !searchFilter && !categoryFilter;

    return (
        <div className="flex flex-col w-full bg-white">

            {/* ── Search Results Header ── */}
            {searchFilter && (
                <div className="bg-gray-900 text-white py-10 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-gray-400 text-sm mb-1">Search results</p>
                        <h1 className="text-3xl font-bold">{courses.length} results for <span className="text-yellow-400">"{searchFilter}"</span></h1>
                    </div>
                </div>
            )}

            {/* ── Category Header ── */}
            {categoryFilter && !searchFilter && (
                <div className="bg-gray-900 text-white py-12 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-white">{categoryFilter}</span>
                        </nav>
                        <h1 className="text-4xl font-bold">{categoryFilter}</h1>
                        <p className="text-gray-300 mt-2">Expand your skills with top-rated {categoryFilter.toLowerCase()} courses.</p>
                    </div>
                </div>
            )}

            {/* ── Hero Section ── */}
            {isDefaultView && (
                <section className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
                        {/* Left content */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                                <Zap className="h-3.5 w-3.5" /> India's fastest growing learning platform
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4">
                                Learn without<br />
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    limits.
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300 mb-2 max-w-xl leading-relaxed">
                                Gain job-ready skills with expert-led video courses. Join 58 million learners building the careers they want.
                            </p>
                            <p className="text-sm text-indigo-300 font-semibold mb-6">Build real-world skills with KosLearn.</p>

                            {/* Search bar */}
                            <form onSubmit={handleSearch} className="relative flex items-center max-w-xl bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                                <Search className="absolute left-4 h-5 w-5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search for anything — Python, React, SQL..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 pl-12 pr-4 py-4 text-gray-900 text-sm focus:outline-none bg-transparent placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shrink-0 flex items-center gap-2"
                                >
                                    Search <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4 text-sm text-gray-400">
                                <span>Popular:</span>
                                {['Python', 'React', 'MySQL', 'System Design'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => navigate(`/?search=${term}`)}
                                        className="text-indigo-300 hover:text-indigo-200 hover:underline transition"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="hidden lg:flex flex-1 justify-end relative">
                            <div className="relative w-[420px] h-[340px]">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                                    alt="Students learning"
                                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                                />
                                {/* Floating cards */}
                                <div className="absolute -bottom-6 -left-10 bg-white text-gray-900 p-3 rounded-xl shadow-xl flex items-center gap-3 w-52">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs">Certified course</p>
                                        <p className="text-[11px] text-gray-500">Get verified certificate</p>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-6 bg-white text-gray-900 p-3 rounded-xl shadow-xl flex items-center gap-3">
                                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                                        <Play className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs">1000+ Courses</p>
                                        <p className="text-[11px] text-gray-500">New content weekly</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="relative border-t border-white/10 bg-black/20 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {STATS.map(({ value, label, icon: Icon }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon className="h-5 w-5 text-indigo-300" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-extrabold">{value}</p>
                                        <p className="text-xs text-gray-400">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Trusted By Banner ── */}
            {isDefaultView && (
                <div className="bg-gray-50 border-b border-gray-200 py-6 px-4 hidden md:block">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                        <p className="text-gray-500 text-sm font-semibold shrink-0">Trusted by teams at:</p>
                        <div className="flex items-center gap-10 opacity-50">
                            {['Infosys', 'TCS', 'Wipro', 'HCL', 'Cognizant', 'Accenture'].map(b => (
                                <span key={b} className="text-base font-extrabold text-gray-600 tracking-tight">{b}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Categories Grid ── */}
            {isDefaultView && (
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Explore Top Categories</h2>
                        <Link to="/?category=Development" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                            View all <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {CATEGORIES.map(({ label, icon: Icon, color }) => (
                            <Link
                                key={label}
                                to={`/?category=${encodeURIComponent(label)}`}
                                className="group relative overflow-hidden rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                <div className="p-5 flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-md`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-700 transition-colors">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Explore courses</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Courses Section ── */}
            <section ref={coursesRef} id="courses-section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full">
                {isDefaultView && (
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Most popular courses</h2>
                            <p className="text-gray-500 mt-1 text-sm">Hand-picked by our team. New additions every week.</p>
                        </div>
                        <button
                            onClick={scrollToCourses}
                            className="hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:underline text-sm"
                        >
                            See all <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-semibold">Failed to load courses</p>
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    </div>
                ) : courses.length === 0 && !loading ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl max-w-lg mx-auto">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No courses found</h3>
                        <p className="text-gray-400 text-sm">Try a different search or explore all categories.</p>
                        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline font-semibold text-sm">Browse all courses</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                        {loading
                            ? [...Array(8)].map((_, i) => <CourseSkeleton key={i} />)
                            : courses.map(course => <CourseCard key={course.id} course={course} />)
                        }
                    </div>
                )}
            </section>

            {/* ── Instructor Spotlight ── */}
            {isDefaultView && (
                <section className="relative bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                                <Award className="h-3.5 w-3.5" /> Share your knowledge on KosLearn
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                                Become an expert <br />instructor today
                            </h2>
                            <p className="text-indigo-200 mb-8 text-lg leading-relaxed max-w-lg">
                                Join our community of 75,000+ instructors on KosLearn. Create your first course and earn from every enrollment.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg">
                                    Start teaching today
                                </button>
                                <button className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition">
                                    Learn more
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-1 justify-end">
                            <img
                                src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600"
                                alt="Instructor"
                                className="w-[380px] h-[320px] object-cover rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
