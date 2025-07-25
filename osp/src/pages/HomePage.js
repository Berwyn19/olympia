import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '../components/AuthContext'

export default function HomePage() {
    const { user } = useAuth();

    return (
            <section className="flex flex-col justify-center items-center px-6 bg-gradient-to-b from-white to-blue-50 min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-5xl text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2 text-base font-medium text-blue-700 bg-blue-100 rounded-full mb-6">
                <Trophy className="w-5 h-5" />
                Trusted by 100+ students across Indonesia
                </div>

                {/* Heading */}
                <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Master Physics Olympiad with{' '}
                <span className="text-indigo-600">Expert Guidance</span>
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Comprehensive problem-solving platform with step-by-step solutions and interactive hints
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
                {!user && <Link
                    to="/login"
                    className="px-8 py-4 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                    Login →
                </Link>
                }
                <Link
                    to="/dashboard"
                    className="px-8 py-4 border border-gray-300 text-gray-800 text-base font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                    Start Learning
                </Link>
                </div>

                {/* Stats */}
                <div className="flex justify-center flex-wrap gap-12 text-center">
                <div>
                    <p className="text-2xl font-bold text-indigo-600">20+</p>
                    <p className="text-gray-600 text-base">Curated Problems</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-indigo-600">6 Hours</p>
                    <p className="text-gray-600 text-base">Crash Course</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-purple-600">24/7</p>
                    <p className="text-gray-600 text-base">Expert Support</p>
                </div>
                </div>
            </div>
            </section>

    );
}
