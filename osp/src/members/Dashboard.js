import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Star, TrendingUp, ArrowRight } from 'lucide-react';
import ProblemsPage from './ProblemsPage';
import { db } from "../services/firebase";
import { getDocs, collection, getDoc, doc, setDoc, query } from 'firebase/firestore';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";
import CustomProgressBar from '../components/CustomProgressBar';
import CommentSection from '../components/CommentSection';
const topics = [
  'Kinematics',
  'Forces',
  'Momentum and Energy',
  'Oscillation',
  'Celestial Mechanics',
];

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow p-5 w-full">
      <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ProblemTopicCard({ title, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow hover:shadow-md transition p-5 cursor-pointer hover:ring-2 hover:ring-indigo-500">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">Explore problems in {title}</p>
    </div>
  );
}

function CrashCourseCard({ progress }) {
  return (
    <div>
      <Link to="/course" className="block">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
          {/* Top content: title and arrow */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-indigo-800 mb-1">
                🚀 Celestial Mechanics Crash Course
              </h3>
              <p className="text-sm text-indigo-700">
                Fast-track your mastery in just 6 hours
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
          </div>

          {/* Bottom content: progress bar */}
          <CustomProgressBar progress={progress} />
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { topicName } = useParams(); // from URL like /dashboard/topic/Kinematics
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState(null);
  const [progress, setProgress] = useState(0);
  const [minutesWatched, setMinutesWatched] = useState(0);
  const [problemsProgress, setProblemsProgress] =  useState(null);
  const [problemsSolved, setProblemsSolved] = useState(0)
  const { user } = useAuth();
  console.log(user.uid)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const snapshot = await getDocs(collection(db, "problems"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProblems(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Get the progress on problems solved
  useEffect(() => {
    const fetchProblemsProgress = async () => {
      const progressRef = collection(db, "problems-progress", user.uid, "solved");
      const progressSnap = await getDocs(progressRef)
      console.log(progressSnap)
      setProblemsSolved(progressSnap.docs.length)
    }
    fetchProblemsProgress();
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const videoRef = collection(db, "user-progress", user.uid, "progress");
        const videoSnap = await getDocs(videoRef);
        setVideos(videoSnap);
  
        // Progress calculation
        const videosData = videoSnap.docs.map(doc => doc.data());
        console.log(videosData)
        let totalMinutes = 0;
        let totalWatched = 0;
  
        for (let i = 0; i < videosData.length; i++) {
          const video = videosData[i];
          if (video.duration) {
            totalMinutes += video.duration;
            if (video.completed) {
              totalWatched += video.duration;
            }
          }
        }

        setMinutesWatched(Math.floor(totalWatched/60))
  
        const progress = totalMinutes > 0
          ? Math.ceil((totalWatched / totalMinutes) * 100)
          : 0;
  
        setProgress(progress);
  
      } catch (err) {
        console.error("Failed to fetch user progress:", err);
      }
    };
  
    fetchUserData();
  }, [user.uid]);

  // Try to fetch user progress info on problems solved
  useEffect(() => {
    if (!user) return;
    const fetchProblemsProgress = async () => {
        try {
            const docRef = doc(db, "problems-progress", user.uid);
            const docSnap = await getDoc(docRef);
            setProblemsProgress(docSnap)
        } catch(err) {
            console.error("Failed to fetch user progress:", err)
        }
    }
    fetchProblemsProgress();
  }, [user])

  // Initialize the problems progress if user is new
  const initializeUser = async (user) => {
    // Create the user document (can be empty or have metadata if needed)
    const userRef = doc(db, "problems-progress", user.uid);
    await setDoc(userRef, {});
  };

  if (problemsProgress && !problemsProgress.exists()) {
    initializeUser(user);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  // If topic is selected in the URL, show ProblemsPage
  if (topicName) {
    const filtered = problems.filter((p) => p.topic === topicName);
    return (
        <div className="p-6">
        <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg shadow-sm transition"
        >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
        </button>
        <div className="mt-6">
            <ProblemsPage problems={filtered} />
        </div>
        </div>
    );
  }

  // Otherwise, show the dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-4">
            <Trophy className="w-4 h-4" />
            Welcome back, {user ? user.displayName: "champion"}!
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your Physics Olympiad Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress and dive deeper into problem sets.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={Trophy} title="Minutes Watched" value={minutesWatched} />
          <StatCard icon={TrendingUp} title="Problems Learned" value={problemsSolved} />
          <StatCard icon={Star} title="Level" value="Advanced" />
        </div>

        {/* Problem Topics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore by Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, idx) => (
              <ProblemTopicCard
                key={idx}
                title={topic}
                onClick={() => navigate(`/dashboard/topic/${encodeURIComponent(topic)}`)}
              />
            ))}
          </div>
        </div>

        {/* Crash Course Card */}
        <div>
          <CrashCourseCard progress={progress}/>
        </div>
      </div>
    </div>
  );
}
