import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FaPlus, FaCheck, FaClock, FaTrash } from "react-icons/fa";
import { MdEdit, MdRefresh } from "react-icons/md";

const DailyTaskUpdatePortal = () => {
  const axios = useAxiosPrivate();
  const user = useSelector((state) => state?.auth?.userInfo);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    priority: "medium",
    status: "pending",
    timeSpent: "0", // in minutes
    estimatedTime: "0", // in minutes
    assignedTo: "",
  });

  // Load tasks from localStorage (demo implementation)
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem(`tasks_${user?._id}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveTasks = (updatedTasks) => {
    try {
      localStorage.setItem(`tasks_${user?._id}`, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.taskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    let updatedTasks;

    if (editingId) {
      // Update existing task
      updatedTasks = tasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : task
      );
      toast.success("Task updated successfully");
    } else {
      // Add new task
      const newTask = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedTasks = [newTask, ...tasks];
      toast.success("Task added successfully");
    }

    saveTasks(updatedTasks);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      taskName: "",
      description: "",
      priority: "medium",
      status: "pending",
      timeSpent: "0",
      estimatedTime: "0",
      assignedTo: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (task) => {
    setFormData({
      taskName: task.taskName,
      description: task.description,
      priority: task.priority,
      status: task.status,
      timeSpent: task.timeSpent,
      estimatedTime: task.estimatedTime,
      assignedTo: task.assignedTo,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
    toast.success("Task deleted");
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );
    saveTasks(updatedTasks);
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
    totalTime: tasks.reduce((sum, t) => sum + parseInt(t.timeSpent || 0), 0),
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
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
            <p className="text-3xl font-bold text-primary_colors">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm font-semibold">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-400">
            <p className="text-gray-600 text-sm font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm font-semibold">Time Logged</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatTime(stats.totalTime)}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary_colors text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <FaPlus /> Add New Task
          </button>
          <button
            onClick={loadTasks}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        {/* Add/Edit Task Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-primary_colors">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingId ? "📝 Edit Task" : "➕ Add New Task"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    name="taskName"
                    value={formData.taskName}
                    onChange={handleInputChange}
                    placeholder="Enter task name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add task description..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>

                {/* Time Spent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Spent (minutes)
                  </label>
                  <input
                    type="number"
                    name="timeSpent"
                    value={formData.timeSpent}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                  />
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigned To (optional)
                </label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  placeholder="Team member name or yourself"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-primary_colors text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  {editingId ? "Update Task" : "Add Task"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-primary_colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getStatusIcon(task.status)}</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {task.taskName}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                      <span
                        className={`text-sm font-bold uppercase ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {task.assignedTo && (
                        <span>👤 {task.assignedTo}</span>
                      )}
                      <span>⏱️ {formatTime(task.timeSpent)} logged</span>
                      {task.estimatedTime > 0 && (
                        <span>📅 Est. {formatTime(task.estimatedTime)}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex flex-wrap gap-2 md:flex-col">
                    {task.status !== "completed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            task.status === "pending" ? "in-progress" : "completed"
                          )
                        }
                        className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center gap-1"
                      >
                        <FaCheck size={14} />
                        {task.status === "pending" ? "Start" : "Complete"}
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center gap-1"
                    >
                      <MdEdit size={14} /> Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center gap-1"
                    >
                      <FaTrash size={14} /> Delete
                    </button>
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
