import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import axios from 'axios';
import {
    PlayCircle, CheckCircle, ChevronDown, ChevronRight,
    Menu, ArrowLeft, ArrowRight, Check, X, Moon, Sun,
    BookOpen, Clock, Users, Star, Home, ChevronLeft, Award, Lock, AlertTriangle, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Loading Skeleton
───────────────────────────────────────────── */
const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

const WatchCourseSkeleton = () => (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 ml-4" />
        </div>
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col">
                <Skeleton className="w-full aspect-video" />
                <div className="p-6 space-y-3">
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
            <div className="hidden lg:flex w-[350px] flex-col border-l border-gray-800 p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-8 w-full ml-4" />
                        <Skeleton className="h-8 w-full ml-4" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const WatchCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    // Core state
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [completedLectures, setCompletedLectures] = useState({});
    const [flatLectures, setFlatLectures] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoPlay, setAutoPlay] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [marking, setMarking] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [noteText, setNoteText] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [videoError, setVideoError] = useState(false); // true when iframe fails to load

    const playerRef = useRef(null);

    /* ── Data Fetching ── */
    useEffect(() => {
        const fetchAll = async () => {
            const parsedId = parseInt(courseId, 10);
            if (isNaN(parsedId)) { setError('Invalid course ID'); setLoading(false); return; }

            try {
                // Always fetch the full course data (sections + lectures + isPreview)
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const courseRes = await axios.get(`${apiUrl}/courses/${parsedId}`);
                const fetchedCourse = courseRes.data;
                setCourse(fetchedCourse);

                const flat = [];
                fetchedCourse.sections?.forEach(s =>
                    s.lectures?.forEach(l => flat.push({ ...l, sectionId: s.id, sectionTitle: s.title }))
                );
                setFlatLectures(flat);

                // Check enrollment if user is logged in
                let userEnrollment = null;
                if (user && token) {
                    try {
                        const enrollmentsRes = await api.get('/enrollments');
                        const allEnrollments = enrollmentsRes.data.enrollments || [];
                        userEnrollment = allEnrollments.find(e => e.courseId === parsedId);
                    } catch (_) { }
                }

                if (userEnrollment) {
                    // ── Enrolled: full access ──
                    setIsEnrolled(true);
                    setPreviewMode(false);
                    setEnrollment(userEnrollment);
                    setProgressPercent(userEnrollment.progressPercent || 0);

                    const completedMap = {};
                    let mostRecentLectureId = null;
                    let highestTs = new Date(0);

                    userEnrollment.videoProgress?.forEach(p => {
                        completedMap[p.lectureId] = p.isCompleted;
                        const d = new Date(p.updatedAt);
                        if (d > highestTs) { highestTs = d; mostRecentLectureId = p.lectureId; }
                    });

                    setCompletedLectures(completedMap);

                    let lectureToPlay = flat.find(l => l.id === mostRecentLectureId) || flat[0];
                    if (lectureToPlay) {
                        setActiveLecture(lectureToPlay);
                        setExpandedSections({ [lectureToPlay.sectionId]: true });
                    }
                } else {
                    // ── Not enrolled: preview mode ──
                    setIsEnrolled(false);
                    setPreviewMode(true);

                    // Auto-select first previewable lecture
                    const firstPreview = flat.find(l => l.isPreview);
                    if (firstPreview) {
                        setActiveLecture(firstPreview);
                        setExpandedSections({ [firstPreview.sectionId]: true });
                    } else if (flat[0]) {
                        // fallback: first lecture
                        setActiveLecture(flat[0]);
                        setExpandedSections({ [flat[0].sectionId]: true });
                    }
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) setError('Course not found');
                else if (err.response?.status >= 500) setError('Server error');
                else setError(err.response?.data?.message || 'Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [courseId, user, token]);

    /* ── Keyboard Shortcuts ── */
    useEffect(() => {
        const handleKey = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            if (e.code === 'Space') {
                e.preventDefault();
                const player = playerRef.current?.getInternalPlayer?.();
                if (player) {
                    player.getPlayerState().then?.(s => s === 1 ? player.pauseVideo() : player.playVideo());
                }
            }
            if (e.code === 'ArrowRight') goToNextLecture();
            if (e.code === 'ArrowLeft') goToPrevLecture();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [flatLectures, activeLecture]);

    /* ── Helpers ── */
    const activeLectureIndex = flatLectures.findIndex(l => l.id === activeLecture?.id);
    const hasNext = activeLectureIndex < flatLectures.length - 1;
    const hasPrev = activeLectureIndex > 0;

    const goToNextLecture = useCallback(() => {
        if (activeLectureIndex < flatLectures.length - 1) {
            const next = flatLectures[activeLectureIndex + 1];
            setActiveLecture(next);
            setExpandedSections(prev => ({ ...prev, [next.sectionId]: true }));
        }
    }, [activeLectureIndex, flatLectures]);

    const goToPrevLecture = useCallback(() => {
        if (activeLectureIndex > 0) {
            const prev = flatLectures[activeLectureIndex - 1];
            setActiveLecture(prev);
            setExpandedSections(prev => ({ ...prev, [prev.sectionId]: true }));
        }
    }, [activeLectureIndex, flatLectures]);

    const toggleSection = (id) =>
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

    const markLectureAsComplete = async (lectureToMark = activeLecture) => {
        if (!lectureToMark || completedLectures[lectureToMark.id] || marking) return;
        setMarking(true);
        try {
            const res = await api.put('/enrollments/progress', {
                courseId: parseInt(courseId),
                lectureId: lectureToMark.id,
                isCompleted: true
            });
            setCompletedLectures(prev => ({ ...prev, [lectureToMark.id]: true }));
            if (res.data?.progressPercent !== undefined) setProgressPercent(res.data.progressPercent);
            toast.success('Lecture marked as complete! 🎉', { style: { background: '#1e293b', color: '#f1f5f9' } });
        } catch (err) {
            toast.error('Failed to update progress');
        } finally {
            setMarking(false);
        }
    };

    const saveTimestamp = async (currentTime) => {
        if (!activeLecture || currentTime <= 0) return;
        try {
            await api.put('/enrollments/progress', {
                courseId: parseInt(courseId),
                lectureId: activeLecture.id,
                lastWatchedTimestamp: Math.floor(currentTime)
            });
        } catch (_) { }
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
        return match ? match[1] : null;
    };

    // Reset video error when lecture changes
    useEffect(() => { setVideoError(false); }, [activeLecture?.id]);

    /* ── Helpers ── */
    // Generates canonical embed URL from stored 11-char ID or legacy URL
    const getEmbedUrl = (urlOrId) => {
        if (!urlOrId) return null;
        // Extract 11-character ID if it's a full URL, or just use the ID
        const match = urlOrId.match(/(?:youtube\.com\/embed\/|youtu\.be\/|\?v=|&v=|\/shorts\/|^)([a-zA-Z0-9_-]{11})/);
        const id = match ? match[1] : urlOrId;
        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    };

    const formatDuration = (secs) => {
        if (!secs) return '0:00';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const formatHours = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const sectionDuration = (section) =>
        section.lectures?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;

    /* ── Saved timestamp ── */
    const savedProgress = enrollment?.videoProgress?.find(p => p.lectureId === activeLecture?.id);
    const startSeconds = (!savedProgress?.isCompleted && savedProgress?.lastWatchedTimestamp) ? savedProgress.lastWatchedTimestamp : 0;

    const embedUrl = activeLecture ? getEmbedUrl(activeLecture.videoUrl) : null;
    // Append start time if resuming
    const embedUrlWithStart = embedUrl && startSeconds > 0
        ? embedUrl.replace('?', `?start=${startSeconds}&`)
        : embedUrl;

    /* ── Total stats ── */
    const totalLectures = flatLectures.length;
    const totalCompleted = Object.values(completedLectures).filter(Boolean).length;

    /* ── Theme ── */
    const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100';
    const headerBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
    const sidebarBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
    const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
    const sectionHeaderBg = darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100';
    const lectureBg = darkMode ? 'bg-gray-900' : 'bg-white';
    const lectureHover = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const activeLectureBg = darkMode ? 'bg-indigo-900/40 border-l-2 border-indigo-500' : 'bg-indigo-50 border-l-2 border-indigo-500';
    const divider = darkMode ? 'border-gray-800' : 'border-gray-200';
    const contentBg = darkMode ? 'bg-gray-900' : 'bg-white';

    /* ── Early returns ── */
    if (loading) return <WatchCourseSkeleton />;
    if (error) return (
        <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-3">{error}</h2>
            <p className="text-gray-400 mb-6">Something went wrong loading this course.</p>
            <Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">Go Home</Link>
        </div>
    );

    return (
        <div className={`flex flex-col h-screen overflow-hidden ${bg} ${textPrimary} transition-colors duration-300`}>
            <Toaster position="top-right" />

            {/* ── Top Header ── */}
            <header className={`${headerBg} border-b h-14 flex items-center px-4 z-30 shrink-0 shadow-md`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-1.5 font-bold text-lg shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        <span className={`hidden sm:inline ${textPrimary}`}>Kos</span>
                        <span className="text-indigo-500 hidden sm:inline">Learn</span>
                    </Link>

                    <div className={`h-5 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 hidden sm:block`} />

                    {/* Breadcrumb */}
                    <nav className="hidden md:flex items-center gap-1 text-xs flex-1 min-w-0">
                        <Link to="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0">
                            <Home className="h-3 w-3" /> Home
                        </Link>
                        <ChevronRight className={`h-3 w-3 ${textSecondary} shrink-0`} />
                        <span className={`${textSecondary} shrink-0`}>{course?.category || 'Courses'}</span>
                        <ChevronRight className={`h-3 w-3 ${textSecondary} shrink-0`} />
                        <span className={`${textPrimary} font-medium truncate`}>{course?.title}</span>
                    </nav>
                    {/* Mobile course title */}
                    <span className={`md:hidden text-sm font-semibold truncate flex-1 ${textPrimary}`}>{course?.title}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                    {/* Progress bar area */}
                    <div className="hidden lg:flex items-center gap-2 text-xs">
                        <span className={textSecondary}>{totalCompleted}/{totalLectures}</span>
                        <div className={`w-32 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="font-bold text-indigo-400">{Math.round(progressPercent)}%</span>
                    </div>

                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setDarkMode(d => !d)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Toggle dark/light mode"
                    >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    {/* Sidebar toggle */}
                    <button
                        onClick={() => { setSidebarOpen(s => !s); setMobileSheetOpen(s => !s); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                        <span className="hidden md:inline">Course content</span>
                        <Menu className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {/* ── Top Progress Bar (thin) ── */}
            <div className={`h-0.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} w-full shrink-0`}>
                <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* ── Left: Video + Details ── */}
                <div
                    className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300`}
                    style={{ marginRight: sidebarOpen ? undefined : 0 }}
                >
                    {/* Video Player */}
                    <div className="w-full bg-black aspect-video flex items-center justify-center relative shrink-0 shadow-xl">
                        {activeLecture ? (
                            embedUrlWithStart && !videoError ? (
                                <iframe
                                    key={activeLecture.id}
                                    src={embedUrlWithStart}
                                    className="w-full h-full absolute inset-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                    allowFullScreen
                                    title={activeLecture.title}
                                    onError={() => setVideoError(true)}
                                />
                            ) : videoError ? (
                                /* Error fallback */
                                <div className="flex flex-col items-center justify-center text-center px-6 gap-4">
                                    <AlertTriangle className="h-14 w-14 text-yellow-500 opacity-80" />
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">This lecture is temporarily unavailable.</h3>
                                        <p className="text-gray-400 text-sm max-w-xs">
                                            The creator may have restricted or removed this video. We recommend continuing to the next lecture.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 flex-wrap justify-center mt-2">
                                        <button
                                            onClick={() => setVideoError(false)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition border border-gray-700"
                                        >
                                            <RefreshCw className="h-4 w-4" /> Retry
                                        </button>
                                        {hasNext && (
                                            <button
                                                onClick={goToNextLecture}
                                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 text-white text-sm font-semibold rounded-lg transition"
                                            >
                                                Go to recommended lecture <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {isEnrolled && (
                                        <button
                                            onClick={() => markLectureAsComplete()}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition mt-2 opacity-80"
                                        >
                                            Mark as completed and continue
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <PlayCircle className="h-20 w-20 opacity-30 mb-3" />
                                    <p>No video available for this lecture</p>
                                    {isEnrolled && (
                                        <button
                                            onClick={() => markLectureAsComplete()}
                                            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <PlayCircle className="h-16 w-16 opacity-20 mb-2" />
                                <p>Select a lecture to start watching</p>
                            </div>
                        )}
                    </div>

                    {/* Below-video content with Tabs */}
                    {activeLecture && (
                        <div className={`${contentBg} flex-1 flex flex-col`}>

                            {/* ── Lecture Header (always visible above tabs) ── */}
                            <div className={`px-4 md:px-8 pt-5 pb-0 border-b ${divider}`}>
                                <div className="max-w-5xl mx-auto">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
                                                {activeLecture.sectionTitle}
                                            </p>
                                            <h1 className={`text-lg sm:text-xl font-bold leading-tight ${textPrimary}`}>
                                                {activeLecture.title}
                                            </h1>
                                            {activeLecture.duration > 0 && (
                                                <p className={`mt-0.5 text-xs flex items-center gap-1 ${textSecondary}`}>
                                                    <Clock className="h-3 w-3" />
                                                    {formatDuration(activeLecture.duration)}
                                                    <span className="mx-1">•</span>
                                                    <span>{activeLectureIndex + 1} of {totalLectures}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Autoplay toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setAutoPlay(a => !a)}
                                                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${autoPlay ? 'bg-indigo-600' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
                                                title={autoPlay ? 'Autoplay ON' : 'Autoplay OFF'}
                                                aria-label={autoPlay ? 'Disable autoplay' : 'Enable autoplay'}
                                                aria-pressed={autoPlay}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPlay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                            </button>
                                            <span className={`text-xs hidden sm:inline ${textSecondary}`}>Autoplay</span>

                                            {/* Mark Complete */}
                                            <button
                                                onClick={() => markLectureAsComplete()}
                                                disabled={marking || !!completedLectures[activeLecture.id]}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${completedLectures[activeLecture.id]
                                                    ? 'border-green-600 bg-green-600/10 text-green-500 cursor-default'
                                                    : 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                                    }`}
                                            >
                                                {completedLectures[activeLecture.id]
                                                    ? <><CheckCircle className="h-3.5 w-3.5" /> Completed</>
                                                    : marking
                                                        ? <><div className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> Saving...</>
                                                        : <><Check className="h-3.5 w-3.5" /> Mark Complete</>
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* Prev / Next nav */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <button
                                            onClick={goToPrevLecture}
                                            disabled={!hasPrev}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all ${!hasPrev
                                                ? (darkMode ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-gray-200 text-gray-300 cursor-not-allowed')
                                                : (darkMode ? 'border-gray-600 text-gray-200 hover:border-indigo-500 hover:text-indigo-400' : 'border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600')
                                                }`}
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5" /> Previous
                                        </button>
                                        <button
                                            onClick={goToNextLecture}
                                            disabled={!hasNext}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${!hasNext
                                                ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25'
                                                }`}
                                        >
                                            Next <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Tab bar */}
                                    <div className="flex gap-0 -mb-px">
                                        {[
                                            { id: 'overview', label: 'Overview' },
                                            { id: 'qa', label: 'Q&A' },
                                            { id: 'notes', label: 'Notes' },
                                            { id: 'resources', label: 'Resources' },
                                            { id: 'reviews', label: 'Reviews' },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all mr-1 ${activeTab === tab.id
                                                    ? 'border-indigo-500 text-indigo-500'
                                                    : `border-transparent ${textSecondary} hover:text-indigo-400`
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Tab Content ── */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

                                    {/* OVERVIEW TAB */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                            {activeLecture.description ? (
                                                <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                                    <h3 className={`font-bold mb-2 ${textPrimary}`}>About this lecture</h3>
                                                    <p className={`text-sm leading-relaxed ${textSecondary}`}>{activeLecture.description}</p>
                                                </div>
                                            ) : (
                                                <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                                    <h3 className={`font-bold mb-2 ${textPrimary}`}>About this lecture</h3>
                                                    <p className={`text-sm ${textSecondary}`}>Watch the video to learn more about this topic.</p>
                                                </div>
                                            )}

                                            {/* Course overview */}
                                            <div className={`p-5 rounded-xl border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                                <h3 className={`font-bold mb-3 ${textPrimary}`}>Course overview</h3>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                                                        <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                                                        <span>{totalLectures} lectures total</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                                                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                        <span>{totalCompleted} completed</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                                                        <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                                                        <span>{formatHours(course?.totalDuration || 0)} total</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                                                        <Award className="h-4 w-4 text-yellow-500 shrink-0" />
                                                        <span>Certificate on completion</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Keyboard shortcuts */}
                                            <div>
                                                <h3 className={`font-semibold mb-3 text-sm ${textPrimary}`}>Keyboard shortcuts</h3>
                                                <div className={`flex flex-wrap gap-3 text-xs ${textSecondary}`}>
                                                    {[['Space', 'Play / Pause'], ['←', 'Previous lecture'], ['→', 'Next lecture']].map(([key, desc]) => (
                                                        <span key={key} className="flex items-center gap-1.5">
                                                            <kbd className={`px-2 py-0.5 rounded font-mono ${darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>{key}</kbd>
                                                            {desc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Completion badge */}
                                            {totalCompleted === totalLectures && totalLectures > 0 && (
                                                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-center">
                                                    <Award className="h-12 w-12 text-yellow-400 mb-3" />
                                                    <h3 className={`text-xl font-bold mb-1 ${textPrimary}`}>Congratulations! 🎉</h3>
                                                    <p className={`${textSecondary} text-sm`}>You have completed all lectures in this course.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Q&A TAB */}
                                    {activeTab === 'qa' && (
                                        <div className="space-y-4">
                                            <p className={`text-sm ${textSecondary}`}>Have a question? Ask the community or the instructor below.</p>
                                            <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                                <textarea
                                                    className={`w-full bg-transparent text-sm resize-none focus:outline-none ${textPrimary} placeholder:${textSecondary}`}
                                                    placeholder="Write your question here..."
                                                    rows={3}
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
                                                        Post Question
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={`text-center py-12 ${textSecondary}`}>
                                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">No questions yet for this lecture. Be the first to ask!</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* NOTES TAB */}
                                    {activeTab === 'notes' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-bold ${textPrimary}`}>My Notes</h3>
                                                <span className={`text-xs ${textSecondary}`}>Auto-saved locally</span>
                                            </div>
                                            <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div className={`px-3 py-2 border-b text-xs font-semibold ${textSecondary} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                                    {activeLecture.title}
                                                </div>
                                                <textarea
                                                    value={noteText}
                                                    onChange={e => setNoteText(e.target.value)}
                                                    className={`w-full p-4 bg-transparent text-sm resize-none focus:outline-none min-h-[200px] ${textPrimary} placeholder:text-gray-500`}
                                                    placeholder="Write your notes for this lecture here... Your notes are saved in this browser session."
                                                />
                                            </div>
                                            {noteText && (
                                                <button
                                                    onClick={() => setNoteText('')}
                                                    className={`text-xs ${textSecondary} hover:text-red-400 transition`}
                                                >
                                                    Clear notes
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* RESOURCES TAB */}
                                    {activeTab === 'resources' && (
                                        <div className="space-y-4">
                                            <p className={`text-sm ${textSecondary}`}>Downloadable resources for this lecture.</p>
                                            <div className={`text-center py-12 ${textSecondary}`}>
                                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">No resources attached to this lecture.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* REVIEWS TAB */}
                                    {activeTab === 'reviews' && (
                                        <div className="space-y-5">
                                            <div className={`flex items-center gap-6 p-5 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                                <div className="text-center">
                                                    <p className="text-5xl font-extrabold text-yellow-400">{course?.averageRating?.toFixed(1) || '4.5'}</p>
                                                    <div className="flex justify-center mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < Math.round(course?.averageRating || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs mt-1 ${textSecondary}`}>Course Rating</p>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    {[5, 4, 3, 2, 1].map(star => (
                                                        <div key={star} className="flex items-center gap-2 text-xs">
                                                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: star === 5 ? '65%' : star === 4 ? '20%' : star === 3 ? '10%' : '3%' }} />
                                                            </div>
                                                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                            <span className={textSecondary}>{star}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {course?.reviews?.length > 0 ? (
                                                course.reviews.slice(0, 5).map((review, i) => (
                                                    <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                {review.user?.name?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-semibold ${textPrimary}`}>{review.user?.name || 'Student'}</p>
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, j) => (
                                                                        <Star key={j} className={`h-3 w-3 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className={`text-sm ${textSecondary}`}>{review.comment}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={`text-center py-10 ${textSecondary}`}>
                                                    <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm">No reviews yet. Be the first to review this course!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Right: Sidebar (Desktop) ── */}
                <aside
                    className={`
                        hidden lg:flex flex-col w-[350px] shrink-0
                        ${sidebarBg} border-l transition-all duration-300 ease-in-out
                        shadow-[-8px_0_24px_rgba(0,0,0,0.3)]
                        ${sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 w-0 overflow-hidden'}
                    `}
                    style={{ display: sidebarOpen ? undefined : 'none' }}
                >
                    <SidebarContent
                        course={course}
                        activeLecture={activeLecture}
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        completedLectures={completedLectures}
                        setActiveLecture={(l) => { setActiveLecture(l); setExpandedSections(prev => ({ ...prev, [l.sectionId]: true })); }}
                        darkMode={darkMode}
                        textPrimary={textPrimary}
                        textSecondary={textSecondary}
                        sectionHeaderBg={sectionHeaderBg}
                        lectureBg={lectureBg}
                        lectureHover={lectureHover}
                        activeLectureBg={activeLectureBg}
                        divider={divider}
                        formatDuration={formatDuration}
                        formatHours={formatHours}
                        sectionDuration={sectionDuration}
                        autoPlay={autoPlay}
                        setAutoPlay={setAutoPlay}
                        totalCompleted={totalCompleted}
                        totalLectures={totalLectures}
                        progressPercent={progressPercent}
                        isEnrolled={isEnrolled}
                        previewMode={previewMode}
                        courseId={courseId}
                    />
                </aside>

                {/* ── Mobile Bottom Sheet ── */}
                <div
                    className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileSheetOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    onClick={(e) => { if (e.target === e.currentTarget) setMobileSheetOpen(false); }}
                    style={{ background: mobileSheetOpen ? 'rgba(0,0,0,0.6)' : 'transparent' }}
                >
                    <div
                        className={`absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl flex flex-col transition-transform duration-300 ${mobileSheetOpen ? 'translate-y-0' : 'translate-y-full'} ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className={`w-10 h-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex items-center justify-between px-4 pb-3">
                            <h2 className={`font-bold ${textPrimary}`}>Course Content</h2>
                            <button onClick={() => setMobileSheetOpen(false)}>
                                <X className={`h-5 w-5 ${textSecondary}`} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <SidebarContent
                                course={course}
                                activeLecture={activeLecture}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                completedLectures={completedLectures}
                                setActiveLecture={(l) => { setActiveLecture(l); setExpandedSections(prev => ({ ...prev, [l.sectionId]: true })); setMobileSheetOpen(false); }}
                                darkMode={darkMode}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                sectionHeaderBg={sectionHeaderBg}
                                lectureBg={lectureBg}
                                lectureHover={lectureHover}
                                activeLectureBg={activeLectureBg}
                                divider={divider}
                                formatDuration={formatDuration}
                                formatHours={formatHours}
                                sectionDuration={sectionDuration}
                                autoPlay={autoPlay}
                                setAutoPlay={setAutoPlay}
                                totalCompleted={totalCompleted}
                                totalLectures={totalLectures}
                                progressPercent={progressPercent}
                                isEnrolled={isEnrolled}
                                previewMode={previewMode}
                                courseId={courseId}
                                isMobile
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Sidebar Content (shared between desktop and mobile sheet)
───────────────────────────────────────────── */
const SidebarContent = ({
    course, activeLecture, expandedSections, toggleSection,
    completedLectures, setActiveLecture, darkMode,
    textPrimary, textSecondary, sectionHeaderBg, lectureBg,
    lectureHover, activeLectureBg, divider, formatDuration, formatHours,
    sectionDuration, autoPlay, setAutoPlay, totalCompleted, totalLectures,
    progressPercent, isMobile = false,
    isEnrolled = true, previewMode = false, courseId = null
}) => (
    <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        {!isMobile && (
            <div className={`px-4 py-3 border-b ${divider} shrink-0`}>
                <h2 className={`font-bold text-sm ${textPrimary}`}>Course Content</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className={`text-xs font-bold text-indigo-400 shrink-0`}>{Math.round(progressPercent)}%</span>
                </div>
                <p className={`text-xs mt-1 ${textSecondary}`}>{totalCompleted} of {totalLectures} lectures completed</p>
            </div>
        )}

        {/* Scrollable section list */}
        <div className="flex-1 overflow-y-auto">
            {course?.sections?.map((section, sIdx) => {
                const isExpanded = expandedSections[section.id];
                const total = section.lectures?.length || 0;
                const done = section.lectures?.filter(l => completedLectures[l.id]).length || 0;
                const dur = sectionDuration(section);

                return (
                    <div key={section.id} className={`border-b ${divider}`}>
                        {/* Section header */}
                        <button
                            className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-colors ${sectionHeaderBg}`}
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className={`mt-0.5 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'} ${textSecondary} shrink-0`}>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm leading-tight ${textPrimary}`}>
                                    Section {sIdx + 1}: {section.title}
                                </p>
                                <p className={`text-xs mt-1 ${textSecondary}`}>
                                    {done}/{total} completed • {formatHours(dur)}
                                </p>
                                {/* Section progress bar */}
                                <div className={`mt-1.5 h-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        </button>

                        {/* Lectures list with animated expand */}
                        <div
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{ maxHeight: isExpanded ? `${(section.lectures?.length || 0) * 80}px` : '0px' }}
                        >
                            {section.lectures?.map((lecture, lIdx) => {
                                const isActive = activeLecture?.id === lecture.id;
                                const isCompleted = completedLectures[lecture.id];
                                const isLocked = previewMode && !lecture.isPreview;

                                const handleClick = () => {
                                    if (isLocked) {
                                        toast(`🔒 Enroll to unlock "${lecture.title}"`, {
                                            icon: '🔒',
                                            style: { background: '#1e293b', color: '#f8fafc', fontWeight: '600' },
                                            duration: 3000
                                        });
                                        return;
                                    }
                                    setActiveLecture({ ...lecture, sectionId: section.id, sectionTitle: section.title });
                                };

                                return (
                                    <div
                                        key={lecture.id}
                                        onClick={handleClick}
                                        className={`flex items-start gap-3 px-4 py-3 transition-colors
                                            ${isLocked
                                                ? `cursor-not-allowed ${lectureBg} opacity-75`
                                                : `cursor-pointer ${isActive ? activeLectureBg : `${lectureBg} ${lectureHover}`}`
                                            }`}
                                    >
                                        {/* Status indicator */}
                                        <div className="mt-0.5 shrink-0">
                                            {isLocked ? (
                                                <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <Lock className="h-2.5 w-2.5 text-gray-400" />
                                                </div>
                                            ) : isCompleted ? (
                                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                                </div>
                                            ) : isActive ? (
                                                <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                                    <PlayCircle className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className={`h-5 w-5 rounded-full border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} />
                                            )}
                                        </div>

                                        {/* Lecture info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-tight ${isLocked
                                                ? (darkMode ? 'text-gray-500' : 'text-gray-400')
                                                : isActive
                                                    ? 'font-bold text-indigo-400'
                                                    : textPrimary
                                                }`}>
                                                {lIdx + 1}. {lecture.title}
                                            </p>
                                            <div className={`flex items-center gap-2 mt-0.5`}>
                                                {lecture.duration > 0 && (
                                                    <p className={`text-xs flex items-center gap-1 ${isLocked ? 'text-gray-600' : textSecondary}`}>
                                                        <PlayCircle className="h-3 w-3" />
                                                        {formatDuration(lecture.duration)}
                                                    </p>
                                                )}
                                                {lecture.isPreview && previewMode && (
                                                    <span className="text-[9px] font-bold bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        Preview
                                                    </span>
                                                )}
                                                {isLocked && (
                                                    <span className="text-[9px] font-bold bg-gray-700/50 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        Enroll to unlock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default WatchCourse;
