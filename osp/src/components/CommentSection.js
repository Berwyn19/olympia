import { collection, query, onSnapshot, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from "../services/firebase"
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { Send } from 'lucide-react'
import CommentBox from './CommentBox'

export default function CommentSection({ video_id }) {
    const [comments, setComments] = useState([]);
    const [userComment, setUserComment] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (!video_id) return;

        const q = query(
            collection(db, "comments", video_id, "video-comments"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const cleanedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(cleanedData);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, [video_id]);

    const handleChange = (e) => {
        setUserComment(e.target.value);
    };

    const handleSubmit = async () => {
        if (!userComment.trim()) return; // prevent empty submits

        const timestamp = new Date();
        const docId = `${user.displayName}-${timestamp.toISOString()}`;
        const newData = {
            name: user.displayName || "Anonymous",
            timestamp: timestamp,
            content: userComment.trim()
        };
        await setDoc(doc(db, "comments", video_id, "video-comments", docId), newData);

        setUserComment(""); // Clear input after submit
    };

    return (
        <div className="mt-6 space-y-4 max-w-3xl mx-auto">
            {/* Input bar */}
            <div className="flex flex-row items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-xl shadow-sm">
                <input
                    name="comment"
                    id="comment"
                    type="text"
                    value={userComment}
                    onChange={handleChange}
                    placeholder="Enter your question"
                    className="flex-1 bg-transparent outline-none text-sm"
                />
                <button
                    onClick={handleSubmit}
                    className="text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400"
                    disabled={!userComment.trim()}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Comment list */}
            <div className="space-y-3">
                {comments.map((comment) => (
                    <CommentBox key={comment.id} commentData={comment} videoId={video_id} />
                ))}
            </div>
        </div>
    );
}
