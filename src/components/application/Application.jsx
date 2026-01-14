import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnApplicationRoute, getStepper } from "../../utils/Endpoint";
import { useSelector } from "react-redux";
import DateFormat from "../../utils/DateFormat";
import { toast } from "react-toastify";

import RightSide from "./tracking/RightSide";
import AssignStepModal from "./AssignStepModal";
import StepNavigatorModal from "./StepNavigatorModal";
import ReqLoader from "../loading/ReqLoader";
import PhaseChanger from "../modals/PhaseChanger"; //for updating the deadline
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Application = () => {
  const instance = useAxiosPrivate();

  const [loader, setLoader] = useState(false);
  const { id, stepperId } = useParams();
  const [data, setData] = useState({});
  const [application, setApplication] = useState({});
  const [stepper, setStepper] = useState([]);

  const getApplication = async () => {
    try {
      await instance
        .get(`${getAnApplicationRoute}/${id}`)
        .then((res) => {
          setData(res?.data);
          console.log(res?.data);
          setApplication(res?.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const GetStepperData = async () => {
    await instance
      .get(`${getStepper}/${stepperId}`)
      .then((res) => {
        setStepper(res?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    window.scroll(0, 0);
    getApplication();
    GetStepperData();
  }, [id]);

  const fnToCallGetFn = () => {
    getApplication();
    GetStepperData();
  };

  // console.log(application);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [navModal, setNavModal] = useState(false);
  const [targetStepId, setTargetStepId] = useState(null);
  // Selected filter by admin: all / counsellors / counsellors_operations / operations / operations_freelance / counsellors_freelance / freelance / case_closure
  const [selectedFilter, setSelectedFilter] = useState("all");
  const user = useSelector((state) => state?.auth?.userInfo);
  // Map explicit step numeric IDs (from your list) to owner groups for precision
  const idOwnersMap = {
    2: ["counsellors"],
    3: ["counsellors"],
    25: ["counsellors"],
    53: ["counsellors"],
    104: ["counsellors"],
    112: ["counsellors"],
    65: ["counsellors"],

    14: ["counsellors", "operations"],
    9: ["counsellors", "operations"],
    30: ["counsellors", "operations"],
    31: ["counsellors", "operations"],
    32: ["counsellors", "operations"],
    33: ["counsellors", "operations"],
    94: ["counsellors", "operations"],

    1: ["operations"],
    15: ["operations"],
    16: ["operations"],
    34: ["operations"],
    11: ["operations"],
    12: ["operations"],
    13: ["operations"],
    4: ["operations"],
    5: ["operations"],
    6: ["operations"],
    7: ["operations"],
    8: ["operations"],
    27: ["operations"],
    28: ["operations"],
    10: ["operations"],
    18: ["operations"],
    19: ["operations"],
    20: ["operations"],
    21: ["operations"],
    35: ["operations"],
    36: ["operations"],
    37: ["operations"],
    38: ["operations"],
    43: ["operations"],
    44: ["operations"],
    45: ["operations"],
    46: ["operations"],
    51: ["operations"],
    54: ["operations"],
    60: ["operations"],
    61: ["operations"],
    62: ["operations"],
    39: ["operations"],
    40: ["operations"],
    41: ["operations"],
    42: ["operations"],
    47: ["operations"],
    48: ["operations"],
    67: ["operations"],
    68: ["operations"],
    69: ["operations"],
    70: ["operations"],
    71: ["operations"],
    72: ["operations"],
    73: ["operations"],
    74: ["operations"],
    75: ["operations"],
    55: ["operations"],
    56: ["operations"],
    57: ["operations"],
    58: ["operations"],
    59: ["operations"],
    83: ["operations"],
    84: ["operations"],
    87: ["operations"],
    89: ["operations"],
    91: ["operations"],
    92: ["operations"],
    93: ["operations"],
    95: ["operations"],
    102: ["operations"],
    103: ["operations"],
    105: ["operations"],
    106: ["operations"],
    114: ["operations"],
    96: ["operations"],
    97: ["operations"],
    98: ["operations"],
    99: ["operations"],
    100: ["operations"],
    101: ["operations"],
    107: ["operations"],
    108: ["operations"],
    109: ["operations"],
    110: ["operations"],
    111: ["operations"],
    22: ["operations", "freelance"],
    23: ["operations", "freelance"],
    24: ["operations", "freelance"],
    26: ["operations", "freelance"],
    29: ["operations", "freelance"],
    88: ["operations", "freelance"],
    90: ["operations", "freelance"],
    63: ["operations", "freelance"],
    113: ["operations", "freelance"],
    115: ["operations", "freelance"],

    17: ["counsellors", "freelance"],
  };

  const getOwnersForStep = (step) => {
    // Try integer-based mapping first (if step contains a numeric id)
    const num = Number(
      step?.number ??
        step?.stepNumber ??
        step?.id ??
        step?.code ??
        step?.order ??
        step?.index
    );
    if (!isNaN(num) && idOwnersMap[num]) {
      return idOwnersMap[num];
    }

    // Fallback to name-based detection
    const name = (step?.name || "").toLowerCase();
    const owners = [];
    if (
      /counsell|brainstorm|packages|proof|student decision|pre departure|after departure|aptitude|aptitude test|interview/.test(
        name
      )
    )
      owners.push("counsellors");
    if (
      /course finding|final profile|sop review|cv review|ects review|lom review|visa received/.test(
        name
      )
    ) {
      owners.push("counsellors");
      owners.push("operations");
    }
    if (
      /student enrolment|check eligibility|course shortlisting|pre application|pro listing|scholarship finding|equalance|basic documents|grade calculation|credit calculation|gpa|ects calculation|credit conversion|course segregation|attestation|documents chase|documentation process|documentation bundle|courier|uni assist|create login credentials|find applicant portal|application process learning|application submission|portal review|follow up|chasing conditions|accepting offer|tuition|application on hold|intake yet to be opened|incomplete|rejected|loan assistance|financial assistance|funds pending|funds submitted|finance under assessment|blocked account|finance approved|scholarship|visa|flight|forex|airport|departure|acceptance letter|visa filing|visa documentation|visa in process|visa rejected/.test(
        name
      )
    )
      owners.push("operations");
    if (
      /cv preparation|essay|sop preparation|letter of motivation|online visa submission|vfs|mock interview|accommodation|part time|essay edits|sop preparation|cv preparation|essay edits/.test(
        name
      )
    ) {
      owners.push("operations");
      owners.push("freelance");
    }
    if (/test preparation/.test(name)) {
      owners.push("counsellors");
      owners.push("freelance");
    }
    if (/case closed|deferral|deferred|refund/.test(name))
      owners.push("operations");
    return owners;
  };

  // Explicit case closure IDs (only these should appear when case_closure is selected)
  const caseClosureIds = new Set([
    96, 97, 98, 99, 100, 101, 107, 108, 109, 110, 111,
  ]);

  const filterMatches = (step) => {
    if (!step) return false;
    if (selectedFilter === "all") return true;
    // Special handling for the case_closure filter: match only the IDs in caseClosureIds or the name fallback
    if (selectedFilter === "case_closure") {
      const num = Number(
        step?.number ??
          step?.stepNumber ??
          step?.id ??
          step?._id ??
          step?.code ??
          step?.order ??
          step?.index
      );
      if (!isNaN(num) && caseClosureIds.has(num)) return true;
      // fallback to name-based matching if no numeric id is present
      const name = (step?.name || "").toLowerCase();
      return /case closed|deferral|deferred|refund|student not enrolled|student deferred|deferral initiated|deferred \/ refund request pending/.test(
        name
      );
    }

    const owners = getOwnersForStep(step);
    if (!owners.length) return false;
    const filterMap = {
      counsellors: ["counsellors"],
      operations: ["operations"],
      freelance: ["freelance"],
      counsellors_operations: ["counsellors", "operations"],
      operations_freelance: ["operations", "freelance"],
      counsellors_freelance: ["counsellors", "freelance"],
    };

    const allowed = filterMap[selectedFilter] || [];
    return allowed.some((a) => owners.includes(a));
  };

  const filteredSteps = (stepper?.steps || []).filter(filterMatches);

  useEffect(() => {
    const list = filteredSteps;
    if (list.length) {
      const pendingIndex = list.findIndex((s) => s?.status === "pending");
      if (pendingIndex !== -1) {
        setCurrentIndex(pendingIndex);
      } else {
        const nextIdx = list.findIndex((s) => s?.status !== "completed");
        setCurrentIndex(nextIdx !== -1 ? nextIdx : 0);
      }
    } else {
      setCurrentIndex(0);
    }
  }, [stepper, selectedFilter]);

  // When a target step id is set (by the navigator), focus that step after filteredSteps refresh
  useEffect(() => {
    if (!targetStepId) return;
    const idx = filteredSteps.findIndex(
      (s) => String(s?._id) === String(targetStepId)
    );
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      // step not found within current filteredSteps
      // try resetting filter to 'all' and attempt again on next render
      if (selectedFilter !== "all") {
        setSelectedFilter("all");
        return;
      }
      // still not found
      toast.warning("Selected step not found in this application");
    }
    setTargetStepId(null);
  }, [filteredSteps, targetStepId]);

  const stepsLen = filteredSteps?.length || 0;
  const currentStep = filteredSteps?.[currentIndex];
  const singleStepper = { ...stepper, steps: currentStep ? [currentStep] : [] };

  const handleNavigateToStep = (stepId, category) => {
    // set selectedFilter to all to ensure step is visible, then set target
    setSelectedFilter("all");
    setTargetStepId(stepId);
    setNavModal(false);
  };

  return (
    <div className="container mx-auto w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-32">
      {/* Welcome Card - Enhanced */}
      <div className="bg-gradient-to-r from-primary_colors to-blue-600 p-8 rounded-2xl shadow-lg mb-8">
        <h1 className="text-white text-3xl font-bold mb-6">
          Application of{" "}
          <span className="capitalize text-yellow-300">
            {" "}
            {data?.studentName}
          </span>
        </h1>
        <div className="text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Name</h5>
            <h5 className="text-lg capitalize font-bold">
              {data?.studentName}
            </h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">
              Country
            </h5>
            <h5 className="text-lg capitalize font-bold">{data?.country}</h5>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">
              Deadline
            </h5>
            <h5 className="text-lg capitalize font-bold">
              {data?.deadline ? DateFormat(data.deadline) : "Not set"}
            </h5>
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  setApplication(data);
                  setEditModal(true);
                }}
                className="mt-3 bg-white text-primary_colors px-3 py-1 rounded text-sm font-semibold"
              >
                {data?.deadline ? "Update Deadline" : "Set Deadline"}
              </button>
            )}
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
                <h5 className="font-semibold text-sm text-gray-100 mb-1">
                  Intake
                </h5>
                <h5 className="text-lg capitalize font-bold">
                  {stepper?.intake}
                </h5>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
                <h5 className="font-semibold text-sm text-gray-100 mb-1">
                  University
                </h5>
                <h5 className="text-lg capitalize font-bold">
                  {stepper?.university}
                </h5>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
                <h5 className="font-semibold text-sm text-gray-100 mb-1">
                  Program
                </h5>
                <h5 className="text-lg capitalize font-bold">
                  {stepper?.program}
                </h5>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
                <h5 className="font-semibold text-sm text-gray-100 mb-1">
                  Through
                </h5>
                <h5 className="text-lg capitalize font-bold">
                  {stepper?.through}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking process - Enhanced Layout */}
      <div className="w-full p-0 border-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary_colors to-blue-500 p-6">
          <h1 className="text-white text-2xl font-bold">Tracking Progress</h1>
        </div>

        {/* Tracking Container */}
        <div className="w-full min-h-screen flex flex-col lg:flex-row gap-6 p-6">
          {/* Right Panel - Details */}
          <div className="w-full rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {currentStep?.name || "No Step Selected"}
                </h2>
                <div className="text-sm text-gray-500">
                  Step {stepsLen ? currentIndex + 1 : 0} of {stepsLen}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === "admin" && (
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 rounded-md text-sm bg-white border border-gray-200 shadow-sm"
                  >
                    <option value="all">All Steps</option>
                    <option value="counsellors">Counsellors (Primary)</option>
                    <option value="counsellors_operations">
                      Counsellors + Operations
                    </option>
                    <option value="operations">Operations (Primary)</option>
                    <option value="operations_freelance">
                      Operations + Freelance
                    </option>
                    <option value="counsellors_freelance">
                      Counsellors + Freelance
                    </option>
                    <option value="freelance">Freelance</option>
                    <option value="case_closure">
                      Case Closure & Deferrals (Operations)
                    </option>
                  </select>
                )}

                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex <= 0}
                  className={`px-3 py-2 rounded-md text-sm font-semibold ${
                    currentIndex <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  ◀ Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(stepsLen - 1, i + 1))
                  }
                  disabled={currentIndex >= stepsLen - 1}
                  className={`px-3 py-2 rounded-md text-sm font-semibold ${
                    currentIndex >= stepsLen - 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  Next ▶
                </button>

                {user?.role === "admin" && (
                  <button
                    onClick={() => setAssignModal(true)}
                    className="px-3 py-2 ml-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                  >
                    ➕ Assign Step
                  </button>
                )}

                <button
                  onClick={() => setNavModal(true)}
                  className="px-3 py-2 ml-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  🔎 Go to Step
                </button>
              </div>
            </div>

            {stepsLen === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No steps available for selected role.
              </div>
            ) : (
              <RightSide
                data={singleStepper}
                cb={fnToCallGetFn}
                application={application}
              />
            )}
          </div>
        </div>
      </div>
      {loader && <ReqLoader />}

      {editModal && (
        <PhaseChanger
          data={application}
          setData={setApplication}
          getTableData={fnToCallGetFn}
          setModal={setEditModal}
        />
      )}

      {assignModal && (
        <AssignStepModal
          setModal={setAssignModal}
          steps={stepper?.steps || []}
          applicationData={application}
          stepperData={stepper}
          cb={fnToCallGetFn}
        />
      )}

      {navModal && (
        <StepNavigatorModal
          setModal={setNavModal}
          steps={stepper?.steps || []}
          categoriesMapping={null}
          onSelectStep={handleNavigateToStep}
        />
      )}
    </div>
  );
};

export default Application;
