import React, { useEffect, useMemo, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  getEmployeesRoute,
  workAssignRoute,
  workEmployeeAssignRoute,
  notification as notificationRoute,
} from "../../utils/Endpoint";
import { useSelector } from "react-redux";
import { axiosPrivate } from "../../api/axios";
import { EmployeeCards } from "../../data/Employee";

const AssignStepModal = ({
  setModal,
  steps = [],
  applicationData = {},
  stepperData = {},
  cb,
  categoriesMapping = null,
}) => {
  const axios = useAxiosPrivate();
  const user = useSelector((state) => state?.auth?.userInfo);

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [stepId, setStepId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeCategory, setAssigneeCategory] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default categories -> step name fragments mapping (used to match the step names from the stepper doc)
  const DEFAULT_CATEGORY_STEPS = {
    "Initial Stages & Counselling": [
      "Received application",
      "Introduction to parents and students",
      "Career opportunities",
      "Complete overview",
      "Counselling and brainstorming",
      "Packages and explanations",
      "Shortlisting courses",
      "Course finding",
      "Eligibility check",
      "Course shortlisting",
      "Pre-application assessment",
    ],
    "Documents & Profile Preparation": [
      "Basic documents",
      "Grade calculation",
      "credit calculation",
      "GPA calculation",
      "ECTS calculation",
      "Final profile portfolio",
      "CV preparation",
      "Essay preparation",
      "Essay edits",
      "Proof reading",
      "SOP preparation",
      "Letter of motivation",
      "Credit conversion",
      "Course segregation",
      "Documentation review",
      "SOP review",
      "CV review",
      "ECTS review",
      "LOM review",
    ],
    "Documentation & Communication": [
      "Follow-up",
      "Documentation collection",
      "Document chasing",
      "Documentation processing",
      "Documentation bundle",
      "Courier",
      "Uni-Assist",
      "Creation of login credentials",
      "Finding applicant portal",
      "Application process",
      "Application submission",
      "Portal review",
      "Follow-ups",
      "Follow-up calls",
      "Chasing conditions",
      "Student decision",
      "Offer acceptance",
      "Tuition fee",
    ],
    "Application Progress": [
      "Application submitted",
      "Follow-up on offer",
      "Conditional offer",
      "Fulfilment of offer",
      "Unconditional offer",
    ],
    "Interviews & Test Preparation": [
      "Mock interview",
      "Interview",
      "Aptitude test",
    ],
    "Finance & Scholarship": [
      "Blocked account",
      "Financial assistance",
      "Meeting financial conditions",
      "Funds pending",
      "Funds submitted",
      "Finance under assessment",
      "Blocked account activation",
      "Finance approved",
    ],
    "Visa Process": [
      "Acceptance letter",
      "Accommodation",
      "Online visa submission",
      "Visa filing",
      "VFS",
      "Visa documentation",
      "Visa in process",
      "Visa outcome",
      "Visa received",
    ],
    "Departure & Aftercare": [
      "Flight ticket",
      "Forex transaction",
      "Pre-departure",
      "Documentation for travel",
      "Things to carry",
      "After departure",
      "Accommodation arrangements",
      "Airport pickup",
      "Part-time assistance",
    ],
    "Strategy & Special Handling": [
      "DPC",
      "Destination settings",
      "Student enrolment",
      "Attestation",
      "University pro-listing",
      "Scholarship finding",
      "Equivalence",
      "Test preparation",
      "Application in progress",
      "Application on hold",
      "Intake not yet opened",
      "Pending from student",
      "Application on hold by university",
      "Rejection",
      "Tuition fee payment",
      "Credibility interview",
      "Medical assistance",
      "Scholarship documentation",
      "Meeting critical",
      "Visa rejection",
    ],
    "Case Closures & Special Scenarios": [
      "Case closed",
      "Change of agent",
      "Student not enrolled",
      "Student deferred",
      "Deferral initiated",
      "Deferred/Refund",
    ],
  };

  // Build categories list and mapping by matching step names (case-insensitive substring match)
  const { derivedCategories, derivedMapping } = useMemo(() => {
    if (categoriesMapping && typeof categoriesMapping === "object") {
      return {
        derivedCategories: Object.keys(categoriesMapping),
        derivedMapping: categoriesMapping,
      };
    }

    const mapping = {};
    Object.keys(DEFAULT_CATEGORY_STEPS).forEach((cat) => {
      mapping[cat] = [];
    });

    (steps || []).forEach((s) => {
      const name = (s?.name || "").toLowerCase();
      let matched = false;
      for (const cat of Object.keys(DEFAULT_CATEGORY_STEPS)) {
        const fragments = DEFAULT_CATEGORY_STEPS[cat];
        for (const f of fragments) {
          if (!f) continue;
          if (name.includes(f.toLowerCase())) {
            mapping[cat].push(s._id);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      // If no match, place it into 'Strategy & Special Handling' as a fallback
      if (!matched) {
        mapping["Strategy & Special Handling"].push(s._id);
      }
    });

    const cats = Object.keys(mapping);
    return { derivedCategories: cats, derivedMapping: mapping };
  }, [categoriesMapping, steps]);

  const categories = ["All", ...derivedCategories];

  // Steps filtered for selected category (All => all steps)
  const stepsInCategory = useMemo(() => {
    if (!category || category === "All") return steps || [];
    const ids = new Set(derivedMapping[category] || []);
    return (steps || []).filter((s) => ids.has(Number(s._id) || s._id));
  }, [derivedMapping, category, steps]);

  const filteredSteps = stepsInCategory.filter((s) =>
    (s?.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  useEffect(() => {
    // fetch employees optionally filtered by department (assigneeCategory)
    const url = assigneeCategory
      ? `${getEmployeesRoute}?department=${assigneeCategory}`
      : getEmployeesRoute;
    axios
      .get(url)
      .then((res) => setEmployees(res.data || []))
      .catch((err) => console.log(err));
  }, [assigneeCategory]);

  useEffect(() => {
    if (!category && categories && categories.length)
      setCategory(categories[0]);
  }, [categories]);

  // ensure assigneeCategory has default 'All' (empty meaning All)
  useEffect(() => {
    if (!assigneeCategory) setAssigneeCategory("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stepId) {
      toast.error("Please select a step to assign");
      return;
    }
    if (!assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    const payload = {
      applicationId: applicationData?.applicationId || applicationData?._id,
      stepNumber: stepId,
      stepperId: stepperData?._id || stepperData?._id || applicationData?._id,
      employeeId: assigneeId,
    };

    // Prevent assigning a step that's already completed
    const selectedStep = (steps || []).find(
      (s) => String(s._id) === String(stepId)
    );
    if (selectedStep?.status === "completed") {
      toast.warning(
        "Selected step is already completed and cannot be assigned"
      );
      return;
    }

    setLoading(true);
    try {
      // Use employee assign endpoint which backend currently exposes
      const endpoint = workEmployeeAssignRoute;

      const res = await axios.put(endpoint, payload);
      toast.success(res?.data?.msg || "Assigned successfully");
      // send notification to assignee (best effort)
      try {
        const stepName = selectedStep?.name || stepId;
        const notifPayload = {
          userId: assigneeId,
          title: `New Task assigned by ${user?.name}`,
          body: `Step: ${stepName}`,
          notificationType: "assign",
          route: `/applications/stepper/${
            stepperData?._id || applicationData?._id
          }`,
        };
        await axiosPrivate.post(notificationRoute, notifPayload);
      } catch (notifErr) {
        // swallow notification errors
        console.log("notification failed:", notifErr);
      }

      setModal(false);
      cb && cb();
    } catch (error) {
      console.error("Assign failed:", error);
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data ||
        error?.message ||
        "Failed to assign step";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <IoCloseCircle
          onClick={() => setModal(false)}
          size={28}
          className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-red-600 transition-all"
        />

        <h2 className="text-xl font-bold text-gray-800 mb-4">Assign a Step</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Step (searchable)
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search steps..."
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <select
              value={stepId}
              onChange={(e) => setStepId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a step</option>
              {filteredSteps
                .filter((s) => s?.status !== "completed")
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s._id} - {s.name} {s?.status ? `(${s.status})` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Assignee Category
            </label>
            <select
              value={assigneeCategory}
              onChange={(e) => setAssigneeCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            >
              <option value="">All</option>
              {EmployeeCards.map((c) => (
                <option key={c.path} value={c.path}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg ${
                loading ? "bg-gray-400" : "bg-primary_colors hover:bg-blue-700"
              }`}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStepModal;
