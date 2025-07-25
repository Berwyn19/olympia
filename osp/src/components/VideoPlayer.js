import { useRef } from 'react';
import { db } from '../services/firebase'; // Adjust import as needed
import { doc, setDoc } from 'firebase/firestore';

export default function VideoPlayer({ user, video, url }) {
  const videoRef = useRef(null);
  const watchedRef = useRef(0);
  const lastSavedPercentRef = useRef(0);
  const markedCompleteRef = useRef(false);

  const handleTimeUpdate = async () => {
    // ✅ Skip all writes if video already completed
    if (video.completed) return;

    const videoElement = videoRef.current;
    if (!videoElement || !videoElement.duration) return;

    const watched = (videoElement.currentTime / videoElement.duration) * 100;
    watchedRef.current = watched;

    const roundedPercent = Math.floor(watched / 10) * 10;

    // ✅ Write only when new 10% chunk is crossed
    if (roundedPercent >= 10 && roundedPercent > lastSavedPercentRef.current) {
      lastSavedPercentRef.current = roundedPercent;

      const progressRef = doc(db, "user-progress", user.uid, "progress", video.id);
      try {
        await setDoc(progressRef, {
          watchedPercent: roundedPercent,
          lastWatched: new Date(),
        }, { merge: true });
      } catch (err) {
        console.error("Failed to update watched percent:", err);
      }
    }

    // ✅ Final update if video is completed
    if (watched >= 90 && !markedCompleteRef.current) {
      markedCompleteRef.current = true;

      const progressRef = doc(db, "user-progress", user.uid, "progress", video.id);
      try {
        await setDoc(progressRef, {
          watchedPercent: 100,
          completed: true,
          lastWatched: new Date(),
        }, { merge: true });
      } catch (err) {
        console.error("Failed to mark video complete:", err);
      }
    }
  };

  return (
    <video
      controls
      ref={videoRef}
      onTimeUpdate={handleTimeUpdate}
      src={url}
      className="w-full rounded-xl shadow-lg border border-gray-200"
    />
  );
}
