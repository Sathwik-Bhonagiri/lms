import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);

    // Create axios instance with credentials
    const api = axios.create({
        baseURL: backendUrl,
        withCredentials: true
    });

    // Add interceptor to include token in protected requests
    api.interceptors.request.use(async (config) => {
        // Skip adding token for public routes
        if (config.url.includes('/api/course')) {
            return config;
        }
        
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const fetchAllCourses = async () => {
        try {
            // Public route - no token needed
            const { data } = await api.get('/api/course/all');
            if (data.success) {
                setAllCourses(data.courses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Fetch courses error:', error);
            toast.error(error.response?.data?.message || 'Failed to load courses');
        }
    };

    const fetchUserData = async () => {
        if (!user) return;
        
        try {
            // Protected route - token will be added by interceptor
            const { data } = await api.get('/api/user/data');
            if (data.success) {
                setUserData(data.user);
                // Check educator status from user data
                if (data.user.role === 'educator') {
                    setIsEducator(true);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Fetch user data error:', error);
            toast.error(error.response?.data?.message || 'Failed to load user data');
        }
    };

    const calculateRating = (course) => {
        if (!course || !Array.isArray(course.courseRatings) || course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        return Math.floor(totalRating / course.courseRatings.length);
    };

    const calculateChapterTime = (chapter) => {
        if (!chapter || !Array.isArray(chapter.chapterContent)) return '0m';
        let time = 0;
        chapter.chapterContent.forEach(lecture => {
            time += lecture.lectureDuration || 0;
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateCourseDuration = (course) => {
        if (!course || !Array.isArray(course.courseContent)) return '0m';
        let time = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                chapter.chapterContent.forEach(lecture => {
                    time += lecture.lectureDuration || 0;
                });
            }
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateNoOfLectures = (course) => {
        if (!course || !Array.isArray(course.courseContent)) return 0;
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    const fetchUserEnrolledCourses = async () => {
        if (!user) return;
        try {
            // Protected route - token will be added by interceptor
            const { data } = await api.get('/api/user/enrolled-courses');
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Fetch enrolled courses error:', error);
            toast.error(error.response?.data?.message || 'Failed to load enrolled courses');
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchUserEnrolledCourses();
        } else {
            // Reset user-related state when logged out
            setUserData(null);
            setEnrolledCourses([]);
            setIsEducator(false);
        }
    }, [user]);

    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateNoOfLectures,
        calculateCourseDuration,
        calculateChapterTime,
        enrolledCourses,
        fetchUserEnrolledCourses,
        backendUrl,
        userData,
        setUserData,
        getToken,
        fetchAllCourses,
        api  // Export the configured axios instance
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};