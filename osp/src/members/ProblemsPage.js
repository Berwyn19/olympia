import React, { useState, useEffect } from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { storage } from '../services/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, onSnapshot } from 'firebase/firestore'
import { Clock, CheckCheck } from 'lucide-react'
import { useAuth } from '../components/AuthContext'; 
import DisplayReflection from '../components/DisplayReflection';

const config = {
  tex2jax: { inlineMath: [['\\(', '\\)'], ['$', '$']] },
}

// Simple Markdown parser (bold and italic only)
function replaceMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\n/g, '<br />')                          // newline support
}

export default function ProblemsPage({ problems }) {
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [activeTab, setActiveTab] = useState('problem')
    const [imageURLs, setImageURLs] = useState({});
    const [solution, setSolution] = useState(null);       
    const [solutionLoading, setSolutionLoading] = useState(false);
    const [solutionError, setSolutionError] = useState(null);
    const [solutionMediaURL, setSolutionMediaURL] = useState(null);
    const [solutionImageUrlMap, setSolutionImageUrlMap] = useState({})
    const [confirmed, setConfirmed] = useState(false);
    const [takeaway, setTakeaway] = useState("");
    const [problemsProgress, setProblemsProgress] = useState(null);
    const { user } = useAuth();

    const selectedProblem = problems[selectedIdx]

    useEffect(() => {
        if (!selectedProblem) return;
      
        const fetchImageURLs = async () => {
          const newURLs = {};
      
          const imageBlocks = selectedProblem.blocks.filter(b => b.type === 'image');
          await Promise.all(imageBlocks.map(async (block) => {
            try {
              const url = await getDownloadURL(ref(storage, block.value.url));
              newURLs[block.value.url] = url;
            } catch (err) {
              console.error("Error fetching image URL:", err);
            }
          }));
      
          setImageURLs(newURLs);
        };
      
        fetchImageURLs();
      }, [selectedProblem]);

      useEffect(() => {
        if (activeTab !== 'solutions' || !selectedProblem?.ref) {
          setSolution(null)
          setSolutionMediaURL(null)
          setSolutionImageUrlMap({})
          setSolutionLoading(false)
          setSolutionError(null)
          return
        }
      
        const fetchSolution = async () => {
          setSolutionLoading(true)
          setSolutionError(null)
          setSolution(null)
          setSolutionMediaURL(null)
          setSolutionImageUrlMap({})
          try {
            const docRef = doc(db, 'solutions', selectedProblem.ref)
            const docSnap = await getDoc(docRef)
            if (!docSnap.exists()) throw new Error('Solution not found')
            const sol = docSnap.data()
            setSolution(sol)
      
            // Fetch general media URLs (pdf or video)
            if (sol.format === 'pdf' && sol.pdf_url) {
              const url = await getDownloadURL(ref(storage, sol.pdf_url))
              setSolutionMediaURL(url)
            }
            if (sol.format === 'video' && sol.video_url) {
              const url = await getDownloadURL(ref(storage, sol.video_url))
              setSolutionMediaURL(url)
            }
      
            // Fetch all image URLs from solution blocks (if any)
            if (sol.blocks && sol.blocks.length > 0) {
              const imageBlocks = sol.blocks.filter(
                (b) => b.type === 'image' && b.value.url
              )
              const urlMap = {}
              await Promise.all(
                imageBlocks.map(async (block) => {
                  try {
                    const url = await getDownloadURL(ref(storage, block.value.url))
                    urlMap[block.value.url] = url
                  } catch (err) {
                    console.error('Error fetching solution image URL:', err)
                  }
                })
              )
              setSolutionImageUrlMap(urlMap)
            }
          } catch (err) {
            setSolutionError(err.message)
          } finally {
            setSolutionLoading(false)
          }
        }
      
        fetchSolution()
      }, [activeTab, selectedProblem])
    
    const handleFinishProblem = async () => {
      if (!takeaway.trim()) return;
      const timestamp = new Date();

      const newData = {
        timestamp: timestamp,
        respond: takeaway
      }

      await setDoc(
        doc(db, "problems-progress", user.uid, "solved", selectedProblem.id),
        newData,
        { merge: true }
      )

      setTakeaway("");
      setConfirmed(false);
    }

    // Fetch the problems progress
    useEffect(() => {
      if (!user) return;
    
      const q = query(collection(db, "problems-progress", user.uid, "solved"));
    
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const idList = querySnapshot.docs.map((doc) => doc.id);
        setProblemsProgress(idList);
      }, (error) => {
        console.error("Failed to listen to user progress:", error);
      });
    
      return () => unsubscribe(); // Clean up listener on unmount
    }, [user]);

    return (
        <MathJaxContext config={config}>
            <div className="flex h-screen">
                {/* Left side: list of problems */}
                <div className="w-1/3 border-r p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Problems</h2>
                {problems.map((p, idx) => (
                    <div
                    key={idx}
                    className={`cursor-pointer p-2 rounded flex flex-row gap-4 ${
                        idx === selectedIdx ? 'bg-blue-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                        setSelectedIdx(idx)
                        setActiveTab('problem')
                    }}
                    >
                    {problemsProgress && problemsProgress.includes(p.id) && <CheckCheck color="green"/>}
                    {p.title}
                    </div>
                ))}
                </div>

                {/* Right side: dynamic content wrapped in <MathJax> */}
                <div className="w-2/3 p-4 overflow-y-auto">
                <div className="flex space-x-4 border-b mb-4">
                    {['problem',  'solutions', 'check'].map((tab) => (
                    <button
                        key={tab}
                        className={`py-2 px-4 capitalize ${
                        activeTab === tab
                            ? 'border-b-2 border-blue-500 font-bold text-blue-600'
                            : 'text-gray-600 hover:text-black'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                    ))}
                </div>

                <MathJax>
                    {activeTab === 'problem' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-2">{selectedProblem.title}</h3>
                        {selectedProblem.blocks.map((block, i) => {
                        if (block.type === 'text') {
                            return (
                            <p
                                key={i}
                                className="text-gray-800 whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                __html: replaceMarkdown(block.value),
                                }}
                            />
                            )
                        }
                        if (block.type === 'math') {
                            return (
                            <div key={i} dangerouslySetInnerHTML={{ __html: block.value }} />
                            )
                        }
                        if (block.type === 'image') {
                            const imageUrl = imageURLs[block.value.url];
                          
                            return (
                              <div key={i} className="flex flex-col items-center">
                                {imageUrl ? (
                                  <>
                                    <img
                                      src={imageUrl}
                                      alt={block.value.caption}
                                      className="mb-2 max-w-full w-[400px] h-auto object-contain"
                                      loading="lazy"
                                    />
                                    <p className="text-center text-sm text-gray-600 italic">
                                      {block.value.caption}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm italic text-gray-500">Loading image...</p>
                                )}
                              </div>
                            );
                          }
                        return null
                        })}
                    </div>
                    )}

                    {activeTab === 'check' && (
                      <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-md border border-gray-200 dark:border-neutral-700 space-y-4 mt-6">
                      {/* Section Header */}
                      <div className="flex items-center space-x-2">
                        <Clock/>
                        <h3 className="text-md font-semibold text-gray-800 dark:text-white">Finish Problem Reflection</h3>
                      </div>

                      {/* Confirmation Checkbox */}
                      <div className="flex space-x-3 flex-row items-center">
                        <input
                          type="checkbox"
                          id="check-solution"
                          className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        <label htmlFor="check-solution" className="text-sm text-gray-700 dark:text-gray-300">
                          I have made a <span className="font-semibold">significant effort</span> in solving the problem,
                          reviewed the solution, and now <span className="font-semibold">fully understand</span> it.
                        </label>
                      </div>

                      {/* Takeaway Textarea */}
                      <div>
                        <label htmlFor="takeaway" className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                          ✍️ What did you learn or realize from this problem?
                        </label>
                        <textarea
                          id="takeaway"
                          rows={4}
                          value={takeaway}
                          onChange={(e) => setTakeaway(e.target.value)}
                          placeholder="Reflect on your thought process, mistakes, key insights, or aha moments..."
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          disabled={!confirmed || takeaway.trim() === ""}
                          onClick={handleFinishProblem}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            !confirmed || takeaway.trim() === ""
                              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          }`}
                        >
                          ✅ Mark as Completed
                        </button>
                      </div>
                      <DisplayReflection user={user} problemId={selectedProblem.id} />
                    </div>

                    )}

                    {activeTab === 'solutions' && (
                      <div>
                        {solutionLoading && (
                          <p className="text-gray-500 italic">Loading solution...</p>
                        )}

                        {solutionError && (
                          <p className="text-red-500 italic">Error: {solutionError}</p>
                        )}

                        {!solutionLoading && !solutionError && solution && (
                          <>
                            {/* PDF format solution */}
                            {solution.format === 'pdf' && solutionMediaURL && (
                              <div className="flex flex-col items-center">
                                <object
                                  data={solutionMediaURL}
                                  type="application/pdf"
                                  width="100%"
                                  height="600px"
                                  className="mt-4 border shadow"
                                >
                                  <p>
                                    PDF cannot be displayed. <a href={solutionMediaURL} target="_blank" rel="noopener noreferrer">Click here</a> to download.
                                  </p>
                                </object>
                              </div>
                            )}

                            {/* Video format solution */}
                            {solution.format === 'video' && solutionMediaURL && (
                              <div className="flex flex-col w-full items-center">
                                <video
                                  src={solutionMediaURL}
                                  controls
                                  className="w-full rounded shadow"
                                  style={{maxHeight: '60vh'}}
                                />
                              </div>
                            )}

                            {/* LaTeX solution */}
                            {solution.format === 'latex' && solution.blocks && (
                              <MathJax>
                                <div className="space-y-4">
                                  {solution.blocks.map((block, i) => {
                                    if (block.type === 'text') {
                                      return (
                                        <p
                                          key={i}
                                          className="text-gray-800 whitespace-pre-wrap"
                                          dangerouslySetInnerHTML={{
                                            __html: replaceMarkdown(block.value),
                                          }}
                                        />
                                      )
                                    }
                                    if (block.type === 'math') {
                                      return <div key={i} dangerouslySetInnerHTML={{ __html: block.value }} />
                                    }
                                    if (block.type === 'image') {
                                      // this assumes solution image blocks use url that is path to storage
                                      // For simplicity, show as "download" (upgrade if you want image previews)
                                      return (
                                        <div key={i} className="flex flex-col items-center">
                                        {solutionImageUrlMap ? (
                                          <>
                                            <img
                                              src={solutionImageUrlMap[block.value.url]}
                                              alt={block.value.caption}
                                              className="mb-2 max-w-full w-[400px] h-auto object-contain"
                                              loading="lazy"
                                            />
                                            <p className="text-center text-sm text-gray-600 italic">
                                              {block.value.caption}
                                            </p>
                                          </>
                                        ) : (
                                          <p className="text-sm italic text-gray-500">Loading image...</p>
                                        )}
                                      </div>
                                      )
                                    }
                                    return null
                                  })}
                                </div>
                              </MathJax>
                            )}
                          </>
                        )}
                      </div>
                    )}
                </MathJax>
                </div>
            </div>
        </MathJaxContext>
  )
}
