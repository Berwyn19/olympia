import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function DisplayReflection({ user, problemId }) {
  const [reflection, setReflection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedText, setUpdatedText] = useState("");

  useEffect(() => {
    if (!user?.uid || !problemId) return;

    const ref = doc(db, "problems-progress", user.uid, "solved", problemId);

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReflection(data);
        setUpdatedText(data.respond || "");
      }
    });

    return () => unsubscribe();
  }, [user?.uid, problemId]);

  const handleUpdate = async () => {
    if (!updatedText.trim()) return;

    const ref = doc(db, "problems-progress", user.uid, "solved", problemId);
    await setDoc(ref, {
      respond: updatedText,
      timestamp: serverTimestamp(),
    }, { merge: true });

    setIsEditing(false);
  };

  if (!reflection) return null;

  const readableTime = reflection.timestamp?.seconds
    ? new Date(reflection.timestamp.seconds * 1000).toLocaleString()
    : "Just now";

  return (
    <div className="mt-6 p-5 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Submitted on <span className="font-medium">{readableTime}</span>
        </span>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 transition"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={updatedText}
            onChange={(e) => setUpdatedText(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end mt-3 space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md transition"
            >
              💾 Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-white whitespace-pre-wrap text-sm leading-relaxed">
          {reflection.respond}
        </p>
      )}
    </div>
  );
}
