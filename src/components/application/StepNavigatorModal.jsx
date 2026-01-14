import React, { useEffect, useMemo, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";

// Reuse category mapping like AssignStepModal
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

const StepNavigatorModal = ({
  setModal,
  steps = [],
  onSelectStep,
  categoriesMapping = null,
}) => {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");

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
      if (!matched) mapping["Strategy & Special Handling"].push(s._id);
    });

    return { derivedCategories: Object.keys(mapping), derivedMapping: mapping };
  }, [categoriesMapping, steps]);

  const categories = ["All", ...derivedCategories];

  useEffect(() => {
    if (!category && categories && categories.length)
      setCategory(categories[0]);
  }, [categories]);

  const stepsInCategory = useMemo(() => {
    if (!category || category === "All") return steps || [];
    const ids = new Set(derivedMapping[category] || []);
    return (steps || []).filter((s) => ids.has(Number(s._id) || s._id));
  }, [category, derivedMapping, steps]);

  const filteredSteps = stepsInCategory.filter((s) =>
    (s?.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const handleGo = () => {
    if (!selectedStepId) return toast.error("Please choose a step");
    onSelectStep && onSelectStep(selectedStepId, category);
    setModal(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <IoCloseCircle
          onClick={() => setModal(false)}
          size={28}
          className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-red-600 transition-all"
        />

        <h2 className="text-xl font-bold text-gray-800 mb-4">Go to Step</h2>

        <div className="space-y-4">
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
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search steps..."
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <select
              value={selectedStepId}
              onChange={(e) => setSelectedStepId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select step</option>
              {filteredSteps.map((s) => (
                <option key={s._id} value={s._id}>
                  {s._id} - {s.name}
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
              type="button"
              onClick={handleGo}
              className="flex-1 px-4 py-2 text-white bg-primary_colors rounded-lg"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepNavigatorModal;
