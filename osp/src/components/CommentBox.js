import { useState, useEffect } from 'react';
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";
import { collection, onSnapshot, setDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

function formatTimestamp(ts) {
    try {
        const date = typeof ts === "string" ? new Date(ts) : ts.toDate();
        return date.toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch (e) {
        return "";
    }
}

export default function CommentBox({ commentData, videoId }) {
    const [reply, setReply] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!videoId || !commentData?.id) return;

        const q = query(
            collection(db, "comments", videoId, "video-comments", commentData.id, "reply"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReplies(data);
        });

        return () => unsubscribe();
    }, [videoId, commentData.id]);

    const handleSendReply = async () => {
        if (!replyContent.trim()) return;

        const timestamp = new Date();
        const docId = `${user.displayName}-${timestamp.toISOString()}`;
        const newData = {
            name: user.displayName || "Anonymous",
            timestamp: timestamp,
            content: replyContent.trim(),
        };

        await setDoc(
            doc(db, "comments", videoId, "video-comments", commentData.id, "reply", docId),
            newData
        );

        setReplyContent("");
        setReply(false);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-neutral-700 rounded-xl p-4 mb-4">
            {/* Main comment */}
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{commentData.name}</span>
                <span className="text-xs text-gray-500">{formatTimestamp(commentData.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{commentData.content}</p>

            {/* Reply toggle */}
            <button
                onClick={() => setReply((prev) => !prev)}
                className="text-blue-600 text-sm hover:underline"
            >
                {reply ? "Reply" : "Reply"}
            </button>

            {/* Reply input */}
            {reply && (
                <div className="mt-3 space-y-2">
                    <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        type="text"
                        placeholder="Reply to this comment"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setReply(false);
                                setReplyContent("");
                            }}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-white text-sm px-4 py-1.5 rounded-md border border-gray-300 dark:border-neutral-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendReply}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md transition"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}


            {/* Replies */}
            {replies.length > 0 && (
                <div className="mt-3 border-l border-gray-300 dark:border-gray-600 pl-4 space-y-3">
                    {replies.map((r) => (
                        <div key={r.id} className="text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-100">{r.name}</span>
                                <span className="text-xs text-gray-500">{formatTimestamp(r.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{r.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
