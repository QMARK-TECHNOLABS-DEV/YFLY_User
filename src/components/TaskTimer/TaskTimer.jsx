import React, { useEffect, useState } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { workTimerRoute } from "../../utils/Endpoint";

const TaskTimer = ({
  stepperId,
  stepNumber,
  taskId,
  onTimeUpdate,
  autoStart = false,
  command,
}) => {
  const axios = useAxiosPrivate();
  const [timerData, setTimerData] = useState({
    timerState: "stopped",
    elapsedSeconds: 0,
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerUrl = `${workTimerRoute}/${stepperId}/${stepNumber}`;

  const loadTimer = async () => {
    try {
      const response = await axios.get(timerUrl);
      setTimerData(response.data);
      setElapsedTime(response.data.elapsedSeconds || 0);
      onTimeUpdate?.(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTimer();
    const interval = setInterval(loadTimer, 5000);
    return () => clearInterval(interval);
  }, [timerUrl]);

  useEffect(() => {
    if (timerData.timerState !== "running") return undefined;

    const interval = setInterval(() => {
      setElapsedTime((currentTime) => currentTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerData.timerState]);

  useEffect(() => {
    if (command) updateTimer(command?.action || command);
  }, [command]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  };

  const updateTimer = async (action) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post(`${timerUrl}/${action}`);
      setTimerData(response.data);
      setElapsedTime(response.data.elapsedSeconds || 0);
      onTimeUpdate?.(response.data);
      if (action === "start") toast.success("Timer started");
      if (action === "pause") toast.info("Timer paused");
      if (action === "stop") toast.info("Timer stopped");
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Unable to update timer");
    } finally {
      setLoading(false);
    }
  };

  const isRunning = timerData.timerState === "running";
  const isPaused = timerData.timerState === "paused";

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
          {timerData.startedAt
            ? `Started: ${new Date(timerData.startedAt).toLocaleString("en-IN")}`
            : "Not started"}
        </p>
      </div>

      {/* Timer Controls */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => updateTimer("start")}
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
          onClick={() => updateTimer(isPaused ? "start" : "pause")}
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
          onClick={() => updateTimer("stop")}
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
