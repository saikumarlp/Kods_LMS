process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import prisma from './config/prisma.js';
import bcrypt from 'bcrypt';

const coursesData = [
    {
        title: "Complete Python Developer Bootcamp",
        description: "Master Python by building 100 projects in 100 days. Learn to code, scrape web data, build APIs, and master object-oriented programming.",
        price: 3999, discountPrice: 999,
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Beginner", averageRating: 4.8, totalDuration: 18000,
        sections: [
            { title: "Python Basics", lectures: [{ title: "What is Python?", url: "kqtD5dpn9C8", dur: 300 }, { title: "Installing Python", url: "rfscVS0vtbw", dur: 450 }, { title: "Variables and Data Types", url: "khKv-8q7YmY", dur: 500 }, { title: "Input & Output", url: "rfscVS0vtbw", dur: 240 }, { title: "Operators", url: "v5MR5JnKcZI", dur: 360 }] },
            { title: "Control Flow", lectures: [{ title: "If-Else", url: "rfscVS0vtbw", dur: 420 }, { title: "Loops (for, while)", url: "94UHCEmprCY", dur: 600 }, { title: "Break & Continue", url: "rfscVS0vtbw", dur: 200 }, { title: "List Comprehension", url: "AhSvKGTh28Q", dur: 550 }] },
            { title: "Functions & Modules", lectures: [{ title: "Functions", url: "9Os0o3wzS_I", dur: 480 }, { title: "Arguments", url: "rfscVS0vtbw", dur: 300 }, { title: "Lambda", url: "rfscVS0vtbw", dur: 250 }, { title: "Modules", url: "CqvZ3vGoGs0", dur: 400 }, { title: "Virtual Environment", url: "N5vscPTWKOk", dur: 520 }] },
            { title: "OOP in Python", lectures: [{ title: "Classes & Objects", url: "JeznW_7DlB0", dur: 600 }, { title: "Constructors", url: "BJ-VvGyQxho", dur: 350 }, { title: "Inheritance", url: "RSl87lqOXDE", dur: 480 }, { title: "Polymorphism", url: "rfscVS0vtbw", dur: 300 }, { title: "Encapsulation", url: "rfscVS0vtbw", dur: 420 }] },
            { title: "Advanced Python", lectures: [{ title: "Exception Handling", url: "NIWwJbo-9_8", dur: 450 }, { title: "File Handling", url: "Uh2ebFW8OYM", dur: 500 }, { title: "Decorators", url: "FsAPt_9Bf3U", dur: 600 }, { title: "Generators", url: "bD05uGo_sVI", dur: 400 }, { title: "Working with APIs", url: "rfscVS0vtbw", dur: 550 }] },
            { title: "Real Projects", lectures: [{ title: "CLI ToDo App", url: "6iF8Xb7Z3wQ", dur: 900 }, { title: "Web Scraper", url: "XVv6mJpFOb0", dur: 1200 }, { title: "Simple Flask App", url: "Z1RJmh_OqeA", dur: 1500 }] }
        ]
    },
    {
        title: "Data Structures & Algorithms in Python",
        description: "Master DSA with Python to crack coding interviews at FAANG companies. Covers arrays, linked lists, trees, graphs, and dynamic programming.",
        price: 4999, discountPrice: 1499,
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Intermediate", averageRating: 4.9, totalDuration: 22000,
        sections: [
            { title: "Arrays & Strings", lectures: [{ title: "Introduction to Arrays", url: "RBSGKlAvoiM", dur: 400 }, { title: "Sliding Window Technique", url: "MK-NZ4hN7rs", dur: 600 }] },
            { title: "Recursion", lectures: [{ title: "Understanding Recursion", url: "ngCos392W4w", dur: 500 }, { title: "Backtracking Basics", url: "Zq4upTEaQyM", dur: 700 }] },
            { title: "Linked List", lectures: [{ title: "Singly Linked List", url: "8hly31xKli0", dur: 450 }, { title: "Doubly Linked List", url: "JdQeNxWCguQ", dur: 300 }] },
            { title: "Stack & Queue", lectures: [{ title: "Stack Implementation", url: "8hly31xKli0", dur: 400 }, { title: "Queue Operations", url: "8hly31xKli0", dur: 450 }] },
            { title: "Trees", lectures: [{ title: "Binary Trees", url: "H5JubkIy_p8", dur: 550 }, { title: "BST Operations", url: "i_Q0v_Ct5lY", dur: 600 }] },
            { title: "Graphs", lectures: [{ title: "Graph Representation", url: "8hly31xKli0", dur: 450 }, { title: "BFS & DFS", url: "pcKY4hjDrxk", dur: 750 }] },
            { title: "Dynamic Programming", lectures: [{ title: "Fibonacci & Memoization", url: "P8Xa2BitN3I", dur: 600 }, { title: "0/1 Knapsack", url: "xOlhR_2QCXY", dur: 850 }] }
        ]
    },
    {
        title: "Full Stack Web Development (MERN)",
        description: "Learn to build scalable, full-stack applications using MongoDB, Express.js, React, and Node.js. Create a massive e-commerce portfolio project.",
        price: 8999, discountPrice: 2999,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Advanced", averageRating: 4.7, totalDuration: 35000,
        sections: [
            { title: "HTML & CSS", lectures: [{ title: "HTML5 Structure", url: "qz0aGYrrlhU", dur: 350 }, { title: "CSS Flexbox & Grid", url: "1Rs2ND1ryYc", dur: 600 }] },
            { title: "JavaScript", lectures: [{ title: "JS ES6+ Features", url: "NCwa_xi0Uuc", dur: 450 }, { title: "Async/Await", url: "V_Kr9OSfDeU", dur: 500 }] },
            { title: "React", lectures: [{ title: "React Fundamentals", url: "bMknfKXIFA8", dur: 400 }, { title: "Hooks (useState, useEffect)", url: "O6P86uwfdR0", dur: 550 }] },
            { title: "Node & Express", lectures: [{ title: "Node JS Basics", url: "TlB_eWDSMt4", dur: 480 }, { title: "RESTful Routing", url: "pKd0Rpw7O48", dur: 520 }] },
            { title: "MongoDB", lectures: [{ title: "NoSQL DBs & Mongoose", url: "DZBGEVgL2eE", dur: 450 }, { title: "CRUD Operations", url: "ofme2o29ngU", dur: 500 }] },
            { title: "Deployment", lectures: [{ title: "Heroku/Render Deployment", url: "l134cBAJCuc", dur: 600 }, { title: "Vercel Frontend Deployment", url: "2HBIzEx6IZA", dur: 300 }] }
        ]
    },
    {
        title: "Machine Learning Fundamentals",
        description: "Understand the core foundations of Machine Learning. Build algorithms from scratch and use scikit-learn for powerful data analysis.",
        price: 7999, discountPrice: 2499,
        thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=1200",
        category: "Data Science", level: "Intermediate", averageRating: 4.6, totalDuration: 28000,
        sections: [
            { title: "Introduction to ML", lectures: [{ title: "What is Machine Learning?", url: "HcqpanDadyQ", dur: 300 }, { title: "Setting up Jupyter", url: "HW29067qVWk", dur: 400 }] },
            { title: "Linear Regression", lectures: [{ title: "Math behind Linear Regression", url: "zPG4NjIkCjc", dur: 600 }, { title: "Implementation in Python", url: "NUXdtN1W1FE", dur: 550 }] },
            { title: "Logistic Regression", lectures: [{ title: "Classification basics", url: "yIYKR4sgzI8", dur: 450 }] },
            { title: "Decision Trees", lectures: [{ title: "Entropy & Info Gain", url: "_L39rN6gz7Y", dur: 500 }] },
            { title: "SVM", lectures: [{ title: "Support Vector Machines", url: "efR1C6CvhmE", dur: 650 }] },
            { title: "Model Evaluation", lectures: [{ title: "Cross Validation & Metrics", url: "U3X98xZ4_no", dur: 400 }] },
            { title: "Deployment", lectures: [{ title: "Saving Models with Pickle", url: "i_LwzRmAUMU", dur: 300 }] }
        ]
    },
    {
        title: "React.js Complete Guide",
        description: "Dive deep into React.js. Learn Context API, Redux Toolkit, Next.js basics, and how to build large scale React SPA architectures.",
        price: 3499, discountPrice: 1299,
        thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Beginner", averageRating: 4.8, totalDuration: 21000,
        sections: [
            { title: "React Basics", lectures: [{ title: "Why React?", url: "N3AkSS5hXMA", dur: 300 }] },
            { title: "Components & Props", lectures: [{ title: "Functional Components", url: "bMknfKXIFA8", dur: 400 }, { title: "Passing Data via Props", url: "bMknfKXIFA8", dur: 450 }] },
            { title: "State & Hooks", lectures: [{ title: "useState deeply explored", url: "O6P86uwfdR0", dur: 600 }] },
            { title: "Routing", lectures: [{ title: "React Router V6", url: "UjHT_NKR_gU", dur: 550 }] },
            { title: "API Integration", lectures: [{ title: "Axios & Fetch with useEffect", url: "bYFYF2GnMy8", dur: 480 }] },
            { title: "Project", lectures: [{ title: "Netflix Clone Foundation", url: "XtMThy8QKqU", dur: 1200 }] }
        ]
    },
    {
        title: "Node.js & Backend Mastery",
        description: "Build incredibly fast, scalable APIs with Node.js and Express. Understand Event Loops, streams, raw SQL, and ORMs like Prisma.",
        price: 3199, discountPrice: 1199,
        thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Intermediate", averageRating: 4.7, totalDuration: 19500,
        sections: [
            { title: "Node Fundamentals", lectures: [{ title: "V8 Engine & Event Loop", url: "8aGhZQkoFbQ", dur: 500 }] },
            { title: "Express.js", lectures: [{ title: "Middlewares", url: "lY6icfhap2o", dur: 400 }] },
            { title: "REST APIs", lectures: [{ title: "Architecting a REST API", url: "pKd0Rpw7O48", dur: 550 }] },
            { title: "Authentication (JWT)", lectures: [{ title: "JWT deep dive", url: "mbsmsi7l3r4", dur: 600 }] },
            { title: "PostgreSQL Integration", lectures: [{ title: "Prisma ORM setup", url: "8aGhZQkoFbQ", dur: 700 }] },
            { title: "Deployment", lectures: [{ title: "Deploying Node to VM", url: "i_LwzRmAUMU", dur: 450 }] }
        ]
    },
    {
        title: "SQL & PostgreSQL Masterclass",
        description: "Go beyond basic SELECT statements. Master Joins, window functions, indexing, optimization, and complex transactions.",
        price: 2499, discountPrice: 899,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        category: "Database", level: "Beginner", averageRating: 4.9, totalDuration: 15000,
        sections: [
            { title: "SQL Basics", lectures: [{ title: "Tables & Data Types", url: "HXV3zeQKqGY", dur: 350 }] },
            { title: "Joins", lectures: [{ title: "Inner, Left, Right Joins", url: "9yeOJ0ZMUYw", dur: 450 }] },
            { title: "Indexing", lectures: [{ title: "B-Tree Indexes Under the Hood", url: "HXV3zeQKqGY", dur: 600 }] },
            { title: "Performance Optimization", lectures: [{ title: "EXPLAIN ANALYZE", url: "HXV3zeQKqGY", dur: 500 }] },
            { title: "Transactions", lectures: [{ title: "ACID Properties", url: "HXV3zeQKqGY", dur: 400 }] },
            { title: "Real-world Queries", lectures: [{ title: "Analytics Queries", url: "7S_tz1z_5bA", dur: 700 }] }
        ]
    },
    {
        title: "DevOps for Beginners",
        description: "Learn Linux, Docker, CI/CD pipelines, and cloud computing principles. Perfect for developers transitioning into DevOps.",
        price: 4999, discountPrice: 1499,
        thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200",
        category: "IT & Software", level: "Beginner", averageRating: 4.6, totalDuration: 16000,
        sections: [
            { title: "Linux Basics", lectures: [{ title: "File System & Permissions", url: "hQcFE0RD0cQ", dur: 450 }] },
            { title: "Git & GitHub", lectures: [{ title: "Branching Strategies", url: "RGOj5yH7evk", dur: 500 }] },
            { title: "Docker", lectures: [{ title: "Containers vs VMs", url: "gAkwW2tuIqE", dur: 600 }, { title: "Docker Compose", url: "Qw9zlE3t8Ko", dur: 550 }] },
            { title: "CI/CD", lectures: [{ title: "GitHub Actions setup", url: "R8_veQiYBjI", dur: 700 }] },
            { title: "Cloud Deployment", lectures: [{ title: "AWS EC2 Basics", url: "a9__D53WsUs", dur: 800 }] }
        ]
    },
    {
        title: "UI/UX Design Bootcamp",
        description: "Master Figma, principles of user experience design, and creating beautiful interfaces that convert.",
        price: 2999, discountPrice: 1099,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200",
        category: "Design", level: "Beginner", averageRating: 4.7, totalDuration: 12000,
        sections: [
            { title: "Design Principles", lectures: [{ title: "Color, Typography, Spacing", url: "c9Wg6Cb_YlU", dur: 500 }] },
            { title: "Wireframing", lectures: [{ title: "Low-Fidelity Designs", url: "c9Wg6Cb_YlU", dur: 400 }] },
            { title: "Figma", lectures: [{ title: "Advanced Figma Tools", url: "c9Wg6Cb_YlU", dur: 600 }] },
            { title: "Prototyping", lectures: [{ title: "Interactive Prototypes", url: "c9Wg6Cb_YlU", dur: 550 }] },
            { title: "Usability Testing", lectures: [{ title: "Testing with Real Users", url: "c9Wg6Cb_YlU", dur: 450 }] }
        ]
    },
    {
        title: "Interview Preparation & System Design",
        description: "Crack product-based companies. Learn behavior interviews, advanced DSA patterns, and scalable System Design architectures.",
        price: 5999, discountPrice: 1799,
        thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
        category: "Development", level: "Advanced", averageRating: 4.8, totalDuration: 14000,
        sections: [
            { title: "Resume Building", lectures: [{ title: "ATS Friendly Resumes", url: "Tt08KmFfIYQ", dur: 400 }] },
            { title: "DSA Interview Questions", lectures: [{ title: "Blind 75 Strategy", url: "KLlXCFG5TnA", dur: 600 }] },
            { title: "Behavioral Interviews", lectures: [{ title: "STAR Method", url: "Tt08KmFfIYQ", dur: 350 }] },
            { title: "System Design Basics", lectures: [{ title: "Load Balancers & Caching", url: "m8Icp_Cid5o", dur: 700 }, { title: "Database Sharding", url: "5faMjKuB9bc", dur: 500 }] },
            { title: "Mock Interviews", lectures: [{ title: "Real Google Mock Interview", url: "XKu_SEDAykw", dur: 1200 }] }
        ]
    }
];

const seedDatabases = async () => {
    try {
        console.log("Starting massive 10-course seed process...");

        // 1. Create or Find an Admin Instructor
        let instructor = await prisma.user.findFirst({
            where: { email: 'admin@udemyclone.com' }
        });

        if (!instructor) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            instructor = await prisma.user.create({
                data: {
                    name: 'Colt Steele',
                    email: 'admin@udemyclone.com',
                    password: hashedPassword,
                    role: 'INSTRUCTOR',
                }
            });
            console.log("Instructor admin@udemyclone.com created.");
        }

        // 2. Iterate and create courses
        for (let c = 0; c < coursesData.length; c++) {
            const cd = coursesData[c];

            const course = await prisma.course.create({
                data: {
                    title: cd.title,
                    description: cd.description,
                    price: cd.price,
                    discountPrice: cd.discountPrice,
                    thumbnail: cd.thumbnail,
                    category: cd.category,
                    level: cd.level,
                    instructorId: instructor.id,
                    averageRating: cd.averageRating,
                    totalDuration: cd.totalDuration
                }
            });

            console.log(`[${c + 1}/10] Course created: ${course.title}`);

            // 3. Create Sections & Lectures
            for (let i = 0; i < cd.sections.length; i++) {
                const secData = cd.sections[i];

                const section = await prisma.section.create({
                    data: {
                        title: secData.title,
                        courseId: course.id,
                        orderIndex: i + 1
                    }
                });

                for (let j = 0; j < secData.lectures.length; j++) {
                    const lecData = secData.lectures[j];
                    await prisma.lecture.create({
                        data: {
                            title: lecData.title,
                            videoUrl: lecData.url ? (lecData.url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|\?v=|&v=|\/shorts\/|^)([a-zA-Z0-9_-]{11})/) ? lecData.url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|\?v=|&v=|\/shorts\/|^)([a-zA-Z0-9_-]{11})/)[1] : lecData.url) : null,
                            duration: lecData.dur,
                            sectionId: section.id,
                            orderIndex: j + 1
                        }
                    });
                }
            }
        }

        console.log("Massive seeding complete!");
    } catch (error) {
        console.error("Seeding failed: ", error);
    } finally {
        await prisma.$disconnect();
    }
};

seedDatabases();
