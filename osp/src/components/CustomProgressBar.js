export default function CustomProgressBar({ progress }) {
    const color =
      progress >= 100
        ? "bg-green-500"
        : progress >= 70
        ? "bg-indigo-500"
        : progress >= 40
        ? "bg-yellow-400"
        : "bg-red-400";
  
    return (
      <div className="w-full mt-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-indigo-700">Course Progress</span>
          <span className="text-sm font-medium text-indigo-700">{progress}%</span>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-4 shadow-inner overflow-hidden">
          <div
            className={`${color} h-4 rounded-full transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }