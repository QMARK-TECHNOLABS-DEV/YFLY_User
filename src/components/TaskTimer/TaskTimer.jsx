import React, { useEffect, useState } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { toast } from "react-toastify";

const TaskTimer = ({ taskId, onTimeUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [timerData, setTimerData] = useState({
    startTime: null,
    pauseTime: null,
    totalTime: 0,
    pausedDuration: 0,
  });

  // Load timer data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`timer_${taskId}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setTimerData(data);
      setElapsedTime(data.totalTime);
    }
  }, [taskId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Save timer data to localStorage
  useEffect(() => {
    const data = {
      ...timerData,
      totalTime: elapsedTime,
    };
    localStorage.setItem(`timer_${taskId}`, JSON.stringify(data));
    if (onTimeUpdate) {
      onTimeUpdate(data);
    }
  }, [elapsedTime, taskId, timerData]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!isRunning) {
      setTimerData((prev) => ({
        ...prev,
        startTime: prev.startTime || new Date().toISOString(),
      }));
      setIsRunning(true);
      setIsPaused(false);
      toast.success("Timer started");
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      setTimerData((prev) => ({
        ...prev,
        pauseTime: new Date().toISOString(),
      }));
      toast.info("Timer paused");
    } else if (isPaused) {
      setIsPaused(false);
      toast.success("Timer resumed");
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerData((prev) => ({
      ...prev,
      pauseTime: null,
    }));
    toast.success(`Task completed. Total time: ${formatTime(elapsedTime)}`);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedTime(0);
    setTimerData({
      startTime: null,
      pauseTime: null,
      totalTime: 0,
      pausedDuration: 0,
    });
    localStorage.removeItem(`timer_${taskId}`);
    toast.info("Timer reset");
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-primary_colors mb-4">
      <h3 className="text-sm font-semibold text-primary_colors mb-3">
        Task Timer
      </h3>

      {/* Time Display */}
      <div className="bg-white p-4 rounded-lg mb-4 text-center">
        <div className="text-4xl font-bold text-primary_colors font-mono">
          {formatTime(elapsedTime)}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {timerData.startTime
            ? `Started: ${new Date(timerData.startTime).toLocaleString('en-IN')}`
            : "Not started"}
        </p>
      </div>

      {/* Timer Controls */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isRunning
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600 hover:scale-105"
          }`}
        >
          <FaPlay size={16} />
          Start
        </button>

        <button
          onClick={handlePause}
          disabled={!isRunning && !isPaused}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isRunning || isPaused
              ? isPaused
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
                : "bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FaPause size={16} />
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={handleStop}
          disabled={!isRunning && elapsedTime === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isRunning || elapsedTime > 0
              ? "bg-red-500 text-white hover:bg-red-600 hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FaStop size={16} />
          Stop
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-medium bg-gray-400 text-white hover:bg-gray-500 hover:scale-105 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {isRunning && !isPaused && (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-semibold">
              Timer Running
            </span>
          </>
        )}
        {isPaused && (
          <>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-yellow-600 font-semibold">
              Timer Paused
            </span>
          </>
        )}
        {!isRunning && elapsedTime > 0 && !isPaused && (
          <>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-600 font-semibold">
              Timer Stopped
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskTimer;
