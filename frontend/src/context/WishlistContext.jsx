import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]); // array of courseIds in wishlist
    const [wishlistItems, setWishlistItems] = useState([]); // full wishlist objects
    const [loading, setLoading] = useState(false);

    // Fetch wishlist from backend
    const fetchWishlist = useCallback(async () => {
        if (!user) { setWishlist([]); setWishlistItems([]); return; }
        try {
            setLoading(true);
            const { data } = await api.get('/wishlist');
            setWishlistItems(data);
            setWishlist(data.map(item => item.courseId));
        } catch (err) {
            // Silently fail – user might not be logged in
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const isWishlisted = (courseId) => wishlist.includes(Number(courseId));

    const toggleWishlist = async (courseId) => {
        if (!user) {
            toast.error('Please log in to save courses to your wishlist');
            return;
        }

        const id = Number(courseId);
        const alreadyIn = isWishlisted(id);

        // Optimistic update
        if (alreadyIn) {
            setWishlist(prev => prev.filter(c => c !== id));
            setWishlistItems(prev => prev.filter(item => item.courseId !== id));
        } else {
            setWishlist(prev => [...prev, id]);
        }

        try {
            if (alreadyIn) {
                await api.delete(`/wishlist/${id}`);
                toast.success('Removed from wishlist');
            } else {
                const { data } = await api.post('/wishlist', { courseId: id });
                // Refetch to get full course data
                await fetchWishlist();
                toast.success('Added to wishlist ❤️');
            }
        } catch (err) {
            // Revert on error
            fetchWishlist();
            toast.error('Could not update wishlist');
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, wishlistItems, loading, isWishlisted, toggleWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
