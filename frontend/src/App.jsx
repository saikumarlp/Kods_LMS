import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetails from './pages/CourseDetails';
import MyLearning from './pages/MyLearning';
import WatchCourse from './pages/WatchCourse';
import Wishlist from './pages/Wishlist';
import { Toaster } from 'react-hot-toast';

// Shell decides whether to show Navbar/Footer based on current route
const AppShell = () => {
  const { pathname } = useLocation();
  const isWatchPage = pathname.startsWith('/watch/');

  return (
    <div className={`${isWatchPage ? '' : 'min-h-screen bg-white flex flex-col font-sans'}`}>
      <Toaster position="top-right" />
      {!isWatchPage && <Navbar />}
      <main className={isWatchPage ? '' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/watch/:courseId" element={<WatchCourse />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isWatchPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <WishlistProvider>
          <AppShell />
        </WishlistProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
