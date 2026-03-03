import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT'); // Default role
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-lg shadow-md border border-gray-100">
                <div>
                    <h1 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
                        Join <span className="text-indigo-600">KosLearn</span>
                    </h1>
                    <p className="text-center text-sm text-gray-500 mt-1">Create your account and start learning today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="relative block w-full rounded border-black border-solid border p-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded border-black border-solid border p-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded border-black border-solid border p-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Simple role selector for demo purposes */}
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-900 mb-2">I am registering as an:</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio h-4 w-4 text-blue-600" name="role" value="STUDENT" checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} />
                                    <span className="ml-2 text-sm text-gray-700">Student</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio h-4 w-4 text-blue-600" name="role" value="INSTRUCTOR" checked={role === 'INSTRUCTOR'} onChange={() => setRole('INSTRUCTOR')} />
                                    <span className="ml-2 text-sm text-gray-700">Instructor</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center bg-gray-900 py-3 px-4 text-sm font-bold text-white hover:bg-gray-800 disabled:opactity-70 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-blue-600 underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
