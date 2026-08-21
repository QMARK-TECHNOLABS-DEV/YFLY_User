import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getAssignedWorksRoute } from "../../utils/Endpoint";
import { MdRefresh } from "react-icons/md";

const DailyTaskUpdatePortal = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.userInfo);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const isToday = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = localStorage.getItem(`tasks_${user?._id}`);
      const manualTasks = savedTasks ? JSON.parse(savedTasks) : [];
      const response = await axios.get(
        `${getAssignedWorksRoute}/${user?._id}?status=all`,
      );
      const workTasks = response.data.map((work) => ({
        id: String(work._id),
        workId: work._id,
        applicationId: work.applicationId,
        stepperId: work.stepperId,
        stepNumber: work.stepNumber,
        taskName: work.step?.name || "Assigned application step",
        description: `${work.studentName || "Student"} - ${work.university || ""}`,
        priority: "medium",
        status: work.stepStatus === "ongoing" ? "in-progress" : work.stepStatus,
        timeSpent: Math.floor((work.elapsedSeconds || 0) / 60),
        elapsedSeconds: work.elapsedSeconds || 0,
        timerState: work.timerState || "stopped",
        estimatedTime: 0,
        assignedTo: work.assigneeName || "",
        isApplicationWork: true,
        completedAt: work.completedAt || work.updatedAt,
      }));
      setTasks(
        [...workTasks, ...manualTasks].filter(
          (task) => task.status !== "completed" || isToday(task.completedAt),
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const openApplicationTask = (task) => {
    if (
      task.isApplicationWork &&
      task.applicationId &&
      task.stepperId &&
      task.stepNumber
    ) {
      navigate(
        `/employee/application/${task.applicationId}/${task.stepperId}?stepNumber=${task.stepNumber}`,
      );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "all") return true;
    return task.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in-progress":
        return "🔄";
      case "pending":
        return "⏳";
      default:
        return "📌";
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    totalTime: tasks.reduce((sum, task) => sum + getTaskSeconds(task), 0),
  };

  function getTaskSeconds(task) {
    return task.isApplicationWork
      ? Number(task.elapsedSeconds || 0)
      : Number(task.timeSpent || 0) * 60;
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 Daily Task Update Portal
          </h1>
          <p className="text-gray-600">
            Track and manage your daily tasks efficiently
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary_colors to-blue-400 rounded-full mt-3"></div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-primary_colors">
            <p className="text-gray-600 text-sm font-semibold">Total Tasks</p>
            <p className="text-3xl font-bold text-primary_colors">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm font-semibold">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-400">
            <p className="text-gray-600 text-sm font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm font-semibold">Time Logged</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatTime(stats.totalTime)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={loadTasks}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "all"
                ? "bg-primary_colors text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "pending"
                ? "bg-yellow-500 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            ⏳ Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus("in-progress")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "in-progress"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            🔄 In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "completed"
                ? "bg-green-500 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            ✅ Completed ({stats.completed})
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => openApplicationTask(task)}
                role={task.isApplicationWork ? "button" : undefined}
                tabIndex={task.isApplicationWork ? 0 : undefined}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    openApplicationTask(task);
                  }
                }}
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-primary_colors ${
                  task.isApplicationWork ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getStatusIcon(task.status)}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {task.taskName}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                          task.status,
                        )}`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                      <span
                        className={`text-sm font-bold uppercase ${getPriorityColor(
                          task.priority,
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                      <span>⏱️ {formatTime(getTaskSeconds(task))} logged</span>
                      {task.estimatedTime > 0 && (
                        <span>
                          📅 Est. {formatTime(Number(task.estimatedTime) * 60)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg font-semibold">
                {filterStatus === "all"
                  ? "No tasks yet. Create your first task!"
                  : `No ${filterStatus} tasks.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTaskUpdatePortal;
