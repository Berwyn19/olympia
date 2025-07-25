import React from 'react';
import { Link } from 'react-router-dom';
import { Bolt } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            console.log("User signed out");
            // Optionally, redirect to login or homepage:
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const { user } = useAuth();

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
            <Bolt className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Olympia</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
            {user ? (
                <button onClick={handleLogout} className="bg-indigo-500 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition">
                    Logout
                </button>
            ) : (
                <Link
                to="/login"
                className="bg-indigo-500 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-600 transition"
                >
                Login
                </Link>
            )}

        </div>
        </nav>
    );
};

export default NavBar;
