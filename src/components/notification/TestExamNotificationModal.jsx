import React, { useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { useNotification } from "../../hooks/useNotification";

const TestExamNotificationModal = ({
  setModal,
  employees,
  students = [],
  showEmployees = true,
}) => {
  const { sendTestExamNotification, sendEmployeeTestExamNotification } =
    useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    testName: "",
    type: "test", // 'test' or 'exam'
    description: "",
    date: "",
    time: "",
    duration: "",
    // separate selections for employees and students
    notifyEmployees: [],
    notifyStudents: [],
    // search strings for filtering lists
    employeeSearch: "",
    studentSearch: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeSelection = (id) => {
    setFormData((prev) => ({
      ...prev,
      notifyEmployees: prev.notifyEmployees.includes(id)
        ? prev.notifyEmployees.filter((i) => i !== id)
        : [...prev.notifyEmployees, id],
    }));
  };

  const handleStudentSelection = (id) => {
    setFormData((prev) => ({
      ...prev,
      notifyStudents: prev.notifyStudents.includes(id)
        ? prev.notifyStudents.filter((i) => i !== id)
        : [...prev.notifyStudents, id],
    }));
  };

  const handleSelectAllEmployees = () => {
    if (formData.notifyEmployees.length === employees?.length) {
      setFormData((prev) => ({ ...prev, notifyEmployees: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        notifyEmployees: employees?.map((emp) => emp._id) || [],
      }));
    }
  };

  const handleSelectAllStudents = () => {
    if (formData.notifyStudents.length === students?.length) {
      setFormData((prev) => ({ ...prev, notifyStudents: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        notifyStudents: students?.map((st) => st._id) || [],
      }));
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.testName.trim()) {
      toast.error("Please enter test/exam name");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    const totalSelected =
      (formData.notifyEmployees?.length || 0) +
      (formData.notifyStudents?.length || 0);
    if (totalSelected === 0) {
      toast.error(
        showEmployees
          ? "Please select at least one employee or student to notify"
          : "Please select at least one student to notify"
      );
      return;
    }

    const validIds = showEmployees
      ? [
          ...(employees?.map((e) => String(e._id)) || []),
          ...(students?.map((s) => String(s._id)) || []),
        ]
      : [...(students?.map((s) => String(s._id)) || [])];

    const selectedIds = showEmployees
      ? [
          ...(formData.notifyEmployees || []),
          ...(formData.notifyStudents || []),
        ]
      : [...(formData.notifyStudents || [])];

    const invalidIds = selectedIds.filter(
      (id) => !validIds.includes(String(id))
    );

    if (invalidIds.length > 0) {
      toast.error(`Invalid selection: ${invalidIds.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const testExamData = {
        testName: formData.testName,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        route: "/applications",
      };

      let result;
      if (!showEmployees) {
        // Use employee-only endpoint that accepts studentIdList
        result = await sendEmployeeTestExamNotification(
          formData.notifyStudents || [],
          testExamData
        );
      } else {
        result = await sendTestExamNotification(
          formData.notifyEmployees || [],
          formData.notifyStudents || [],
          testExamData
        );
      }

      if (result.success) {
        toast.success(result.message);
        setModal(false);
        // Reset form
        setFormData({
          testName: "",
          type: "test",
          description: "",
          date: "",
          time: "",
          duration: "",
          notifyEmployees: [],
          notifyStudents: [],
          employeeSearch: "",
          studentSearch: "",
        });
      } else {
        // Log detailed server response for debugging
        console.error(
          "[Notification] sendTestExamNotification failed:",
          result
        );
        // Show informative toast to user including status when available
        const statusPart = result?.status ? ` (status ${result.status})` : "";
        toast.error(
          `${result.message || "Failed to send notification"}${statusPart}`
        );
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
        {/* Close Button */}
        <IoCloseCircle
          onClick={() => setModal(false)}
          size={28}
          className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-red-600 transition-all"
        />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📝 Test/Exam Notification
          </h1>
          <p className="text-gray-600 text-sm">
            {showEmployees
              ? "Send a test/exam update notification to selected employees or students"
              : "Send a test/exam update notification to selected students"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Test Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test/Exam Name *
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                placeholder="Eg: Final Math Exam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              >
                <option value="test">Test</option>
                <option value="exam">Exam</option>
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
              placeholder="Eg: Chapter 1-3, Focus on practice problems..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors resize-none"
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Eg: 120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              />
            </div>
          </div>

          {/* Employee & Student Selections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showEmployees && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Employees to Notify *
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllEmployees}
                    className="text-xs text-primary_colors hover:text-blue-700 font-semibold"
                  >
                    {formData.notifyEmployees.length === employees?.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <input
                  type="text"
                  name="employeeSearch"
                  value={formData.employeeSearch}
                  onChange={handleSearchChange}
                  placeholder="Type to search employees..."
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors"
                />

                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {employees && employees.length > 0 ? (
                    <div className="space-y-2">
                      {(employees || [])
                        .filter((e) =>
                          e?.name
                            ?.toLowerCase()
                            .includes(
                              formData.employeeSearch?.toLowerCase() || ""
                            )
                        )
                        .map((employee) => (
                          <label
                            key={employee._id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.notifyEmployees.includes(
                                employee._id
                              )}
                              onChange={() =>
                                handleEmployeeSelection(employee._id)
                              }
                              className="cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              {employee.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({employee.role})
                            </span>
                          </label>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No employees available
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Selected Employees: {formData.notifyEmployees.length}
                </p>
              </div>
            )}

            {/* Students Column */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Select Students to Notify *
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="text-xs text-primary_colors hover:text-blue-700 font-semibold"
                >
                  {formData.notifyStudents.length === students?.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <input
                type="text"
                name="studentSearch"
                value={formData.studentSearch}
                onChange={handleSearchChange}
                placeholder="Type to search students..."
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors"
              />

              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                {students && students.length > 0 ? (
                  <div className="space-y-2">
                    {(students || [])
                      .filter((s) =>
                        s?.name
                          ?.toLowerCase()
                          .includes(formData.studentSearch?.toLowerCase() || "")
                      )
                      .map((student) => (
                        <label
                          key={student._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.notifyStudents.includes(
                              student._id
                            )}
                            onChange={() => handleStudentSelection(student._id)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {student.name}
                          </span>
                        </label>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No students available
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Selected Students: {formData.notifyStudents.length}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary_colors hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestExamNotificationModal;
