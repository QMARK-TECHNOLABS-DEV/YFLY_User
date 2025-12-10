import React, { useEffect, useState } from "react";
import { MdDownload } from "react-icons/md";
import { toast } from "react-toastify";

const TimeReport = ({ taskId, allTasks }) => {
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [totalWeeklyTime, setTotalWeeklyTime] = useState(0);
  const [totalMonthlyTime, setTotalMonthlyTime] = useState(0);

  // Generate reports from localStorage
  useEffect(() => {
    generateReports();
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDateKey = (date, period) => {
    const d = new Date(date);
    if (period === "weekly") {
      const week = Math.floor(d.getDate() / 7);
      return `${d.getFullYear()}-W${week}`;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const generateReports = () => {
    const weeklyData = {};
    const monthlyData = {};
    let totalWeekly = 0;
    let totalMonthly = 0;

    // Get all timer data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("timer_")) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.startTime) {
          const taskIdFromKey = key.replace("timer_", "");
          const weekKey = getDateKey(data.startTime, "weekly");
          const monthKey = getDateKey(data.startTime, "monthly");

          // Weekly aggregation
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { tasks: [], totalTime: 0 };
          }
          weeklyData[weekKey].tasks.push({
            taskId: taskIdFromKey,
            time: data.totalTime,
            startTime: data.startTime,
          });
          weeklyData[weekKey].totalTime += data.totalTime;
          totalWeekly += data.totalTime;

          // Monthly aggregation
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { tasks: [], totalTime: 0 };
          }
          monthlyData[monthKey].tasks.push({
            taskId: taskIdFromKey,
            time: data.totalTime,
            startTime: data.startTime,
          });
          monthlyData[monthKey].totalTime += data.totalTime;
          totalMonthly += data.totalTime;
        }
      }
    }

    const weeklyArray = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      ...data,
    }));

    const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));

    setWeeklyReport(weeklyArray.reverse());
    setMonthlyReport(monthlyArray.reverse());
    setTotalWeeklyTime(totalWeekly);
    setTotalMonthlyTime(totalMonthly);
  };

  const downloadReport = () => {
    const reportContent = {
      generatedAt: new Date().toLocaleString('en-IN'),
      weeklyReport: weeklyReport.map((w) => ({
        week: w.week,
        totalTime: formatTime(w.totalTime),
        taskCount: w.tasks.length,
      })),
      monthlyReport: monthlyReport.map((m) => ({
        month: m.month,
        totalTime: formatTime(m.totalTime),
        taskCount: m.tasks.length,
      })),
      summary: {
        totalWeeklyTime: formatTime(totalWeeklyTime),
        totalMonthlyTime: formatTime(totalMonthlyTime),
      },
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `time-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Time Reports</h2>
        <button
          onClick={() => {
            generateReports();
            toast.info("Reports refreshed");
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 font-semibold">This Week</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatTime(totalWeeklyTime)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {weeklyReport.length} periods tracked
          </p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-xs text-gray-600 font-semibold">This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {formatTime(totalMonthlyTime)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {monthlyReport.length} months tracked
          </p>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Weekly Breakdown
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {weeklyReport.length > 0 ? (
            weeklyReport.map((week, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Week {week.week}
                  </p>
                  <p className="text-xs text-gray-500">
                    {week.tasks.length} tasks
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {formatTime(week.totalTime)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No weekly data available
            </p>
          )}
        </div>
      </div>

      {/* Monthly Report */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Monthly Breakdown
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {monthlyReport.length > 0 ? (
            monthlyReport.map((month, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(month.month).toLocaleString('en-IN', {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {month.tasks.length} tasks
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {formatTime(month.totalTime)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No monthly data available
            </p>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadReport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
      >
        <MdDownload size={20} />
        Download Report
      </button>
    </div>
  );
};

export default TimeReport;
