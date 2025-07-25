import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase'
import { db } from '../services/firebase'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../components/AuthContext'
import { getDocs, collection, getDoc, doc, setDoc } from 'firebase/firestore';
import CommentSection from '../components/CommentSection'

export default function Course() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [videos, setVideos] = useState(null);

    const desiredTopic = [
        "Gaya Sentral dan Gravitasi",
        "Medan Gravitasi",
        "Kumpulan Soal"
    ]

    const [selectedTopicIndex, setSelectedTopicIndex] = useState(0)
    const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)
    const [problemURL, setProblemURL] = useState("")
    const [video, setVideo] = useState({})
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "crash-course-videos"), { source: "server" });
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setData(data);
                setLoading(false);
            } catch(err) {
                console.log("Error Fetching Videos", err);
                setLoading(false);
            }
        }
        fetchVideos()
    }, [])

    const progressMap = useMemo(() => {
        if (!videos) return {};
        const map = {};
        videos.docs.forEach((doc) => {
          map[doc.id] = doc.data();
        });
        return map;
      }, [videos]);

    const sections = desiredTopic.map((topic) => {
        const videos = data
          .filter((video) => video.topic === topic)
          .sort((a, b) => a.order - b.order);
      
        return {
          topic,
          videos,
        };
    });

    const selectedProblem = sections[selectedTopicIndex]["videos"][selectedProblemIndex]

    useEffect(() => {
        const fetchVideoURL = async () => {
          if (selectedProblem) {
            try {
              const pathReference = ref(storage, selectedProblem.url);
              const url = await getDownloadURL(pathReference);
              setProblemURL(url);
              setVideo(selectedProblem);
            } catch (err) {
              console.error("Error getting video URL:", err);
              setProblemURL(""); // Optional: fallback
            }
          }
        };
      
        fetchVideoURL();
    }, [selectedProblem]);

    useEffect(() => {
        if (!user) return;
        const fetchUserData = async () => {
            try {
                const docRef = doc(db, "user-progress", user.uid);
                const docSnap = await getDoc(docRef);
                const videoRef = collection(db, "user-progress", user.uid, "progress");
                const videoSnap = await getDocs(videoRef);
                setProgress(docSnap)
                setVideos(videoSnap)
            } catch(err) {
                console.error("Failed to fetch user progress:", err)
            }
        }
        fetchUserData();
      }, [user])
    
    const initializeUser = async (user) => {
        const userRef = doc(db, "user-progress", user.uid)
        await setDoc(userRef, {})
        const progressRef = collection(db, "user-progress", user.uid, "progress")
        for (const video of data) {
            const videoRef = doc(progressRef, video.id);
            await setDoc(videoRef, {
              watchedPercent: 0,
              completed: false,
              lastWatched: null,
              duration: video.duration
            });
        }
    }
    console.log(data)
    if (progress && !progress.exists()) {
        initializeUser(user);
    }

    if (videos) {
        console.log(videos.docs)
    }

    return(
        <div className="flex h-screen">
            <div className="w-1/3 border-r p-4 overflow-y-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg shadow-sm transition mb-6 ml-4 mt-2"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to Dashboard
                </button>
                <h2 className="text-xl font-semibold mb-4">Videos</h2>
                {sections.map((content, idx) => (
                <div key={idx} className="mb-6">
                    <h2 className="text-lg font-bold mb-2">{content.topic}</h2>
                    {content.videos.map((video, vidx) => (
                    <div 
                        key={vidx} 
                        className={`cursor-pointer rounded p-2 
                                    ${idx === selectedTopicIndex && vidx === selectedProblemIndex ? 
                                    'bg-blue-200': 'hover:bg-gray-100'} flex flex-row items-center gap-4`}
                        onClick={() => {
                        setSelectedTopicIndex(idx);
                        setSelectedProblemIndex(vidx);
                        }}
                    >
                        {video.title} 
                        {
                        progressMap[video.id]?.completed && (
                            <span className="text-green-600 border border-green-600 rounded-full px-3 py-1 text-sm font-medium bg-transparent">
                            Completed
                            </span>
                        )
                        }
                    </div>
                    ))}
                </div>
                ))}
            </div>
            <div className="w-2/3 p-4 overflow-y-auto">
                { problemURL && problemURL !== "" ? (
                <div className="space-y-4">
                    <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md inline-block">
                        <h2 className="text-xl font-semibold">{selectedProblem.title}</h2>
                    </div>
                    <VideoPlayer user={user} video={video} url={problemURL}/>
                    <CommentSection video_id={video.id}/>
                </div>
                ) : (
                    <h2 className="text-gray-800">Loading...</h2>
                )}
            </div>
        </div>
    )

}