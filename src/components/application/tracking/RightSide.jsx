import React, { useEffect, useState } from "react";
import {
  getAllComments,
  getEmployeesRoute,
  notification,
  notifyRoute,
  postComment,
} from "../../../utils/Endpoint";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";

import EmptyData from "../../loading/EmptyData";
import DocModal from "../../student/DocModal";
import Tippy from "@tippyjs/react";
import StatusModal from "../../employee/StatusModal";
import AdminModal from "../../Admin/AdminModal";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Mention, MentionsInput } from "react-mentions";
import { axiosPrivate } from "../../../api/axios";

import TaskTimer from "../../TaskTimer/TaskTimer";
import TimeReport from "../../TimeReport/TimeReport";

const RightSide = ({ data, cb, application }) => {
  const axios = useAxiosPrivate();

  const createdDate = application?.createdAt?.split("T")[0];
  const user = useSelector((state) => state?.auth?.userInfo);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [docModal, setDocModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [assigneeUpdate, setAssigneeUpdate] = useState(false);
  const [stepNumber, setStepNumber] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timerData, setTimerData] = useState({});

  const path = useLocation();

  const isFinished =
    application.phase === "completed" || application.phase === "cancelled";

  // console.log(data);
  let empTasks = [];
  if (user.role === "admin") {
    empTasks = data?.steps?.filter((step) => {
      // Show all tasks that are not completed
      return step?.status !== "completed";
    });
    empTasks?.reverse();
  }

  let myTasks = [];
  if (user.role === "employee") {
    myTasks = data?.steps?.filter((step) => {
      // Show all tasks that are not completed
      return step?.status !== "completed";
    });
    myTasks?.reverse();
  }

  useEffect(() => {
    axios
      .get(`${getAllComments}/stepper/${data?._id}`)
      .then((res) => {
        setComments(res?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [data?._id]);

  const submitHandle = async (e) => {
    e.preventDefault();

    // Comment and id
    const formattedMessage = comment.replace(/@\[(.*?)\]\((.*?)\)/g, "@$1");
    const mentionPersonId = comment.match(/[^(]+(?=\))/g);

    // Message content
    const message = {
      resourceId: data?._id,
      resourceType: "stepper",
      commentorId: user?._id,
      comment: formattedMessage,
    };

    try {
      // Comment post
      const response = await axios.post(postComment, message);
      if (response.status === 200) {
        toast.success("Comment Sent");
        setComments([response?.data?.data, ...comments]);
        setComment("");
        cb();

        // Notification Data
        const notificationData = {
          userIdList: mentionPersonId,
          title: `Comment from ${user?.name}`,
          body: formattedMessage,
          notificationType: "comment",
          route: path?.pathname,
        };

        // Notification API call
        try {
          await axiosPrivate.post(
            `${notifyRoute}/multi-send`,
            notificationData
          );
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
      toast.warning("Failed to sent comment");
    }
  };

  // Comment box input change handler
  const changeHandler = (event, newValue) => {
    setComment(newValue);
  };

  // Employee Data Fetching
  useEffect(() => {
    axios
      .get(getEmployeesRoute)
      .then((res) => {
        setEmployeeData(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="w-full overflow-y-auto pb-10 space-y-6">
        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {user?.role === "admin" ? "📋 Application Steps" : "✅ My Tasks"}
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-primary_colors to-blue-400 rounded-full"></div>
        </div>

        {/* Task Timer */}
        {activeTaskId && (
          <div className="animate-fade-in">
            <TaskTimer
              taskId={activeTaskId}
              onTimeUpdate={(data) => setTimerData(data)}
            />
          </div>
        )}

        {/* Tasks Container */}
        <div className="space-y-4">
          {empTasks && empTasks.length > 0 ? (
            empTasks?.map((empTask) => (
              <div
                key={empTask._id}
                className="bg-white p-6 rounded-xl border-l-4 border-primary_colors shadow-md hover:shadow-lg transition-all transform hover:scale-102"
              >
                {/* Top Section: Date & Clear Status Display */}
                <div className="flex justify-between items-start mb-5 gap-4">
                  <span className="inline-block px-4 py-2 bg-blue-50 text-primary_colors text-xs font-bold rounded-lg border border-blue-200">
                    📅 {createdDate}
                  </span>

                  {/* STATUS SECTION - VERY CLEAR */}
                  <div className="flex-1 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-300">
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-bold tracking-widest mb-2">
                        TASK STATUS
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {empTask?.status === "pending" && (
                          <>
                            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                            <span className="text-base font-black text-yellow-700 uppercase">
                              ⏳ Pending
                            </span>
                          </>
                        )}
                        {empTask?.status === "in-progress" && (
                          <>
                            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-base font-black text-blue-700 uppercase">
                              🔄 In Progress
                            </span>
                          </>
                        )}
                        {empTask?.status === "completed" && (
                          <>
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-base font-black text-green-700 uppercase">
                              ✅ Completed
                            </span>
                          </>
                        )}
                        {!["pending", "in-progress", "completed"].includes(
                          empTask?.status
                        ) && (
                          <>
                            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                            <span className="text-base font-black text-gray-700 capitalize">
                              {empTask?.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section - Two Column Layout */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* ASSIGNEE */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                    <p className="text-xs text-blue-700 font-bold tracking-wider mb-2">
                      👤 ASSIGNEE
                    </p>
                    <p className="text-sm font-bold text-blue-900 capitalize line-clamp-2">
                      {empTask?.assigneeName || "🔄 Unassigned"}
                    </p>
                  </div>

                  {/* STEP NAME */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300">
                    <p className="text-xs text-purple-700 font-bold tracking-wider mb-2">
                      📌 STEP
                    </p>
                    <p className="text-sm font-bold text-purple-900 capitalize line-clamp-2">
                      {empTask?.name}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mb-3 flex flex-col gap-2">
                  {!isFinished &&
                    !(empTask?.assignee || empTask?.assigneeName) && (
                      <button
                        onClick={() => {
                          setStepNumber(empTask._id);
                          setAssigneeUpdate(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                      >
                        ➕ ASSIGN CURRENT STEP
                      </button>
                    )}

                  {/* Allow admin to update status as well */}
                  {!isFinished && empTask?.status !== "completed" && (
                    <button
                      onClick={() => (
                        setStepNumber(empTask._id), setStatusUpdate(true)
                      )}
                      className="w-full px-4 py-2 bg-gradient-to-r from-primary_colors to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                    >
                      ✏️ UPDATE STATUS
                    </button>
                  )}
                </div>

                {/* Timer Controls */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border-2 border-green-300 flex gap-2 items-center">
                  <span className="text-green-800 font-bold text-sm flex-shrink-0">
                    ⏱️ Timer:
                  </span>
                  <button
                    onClick={() => setActiveTaskId(empTask._id)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-bold text-xs hover:bg-green-600 transition-all hover:scale-105"
                  >
                    ▶ START
                  </button>
                  <button
                    onClick={() => setActiveTaskId(null)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-bold text-xs hover:bg-red-600 transition-all hover:scale-105"
                  >
                    ⏹ STOP
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-500 font-semibold">
                  📭 No current or upcoming tasks
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  All tasks are completed
                </p>
              </div>
            </div>
          )}
          {myTasks && myTasks.length > 0 ? (
            myTasks?.map((myTasks) => (
              <div
                key={myTasks._id}
                className="bg-white p-6 rounded-xl border-l-4 border-primary_colors shadow-md hover:shadow-lg transition-all transform hover:scale-102"
              >
                {/* Top Section: Date & Clear Status Display */}
                <div className="flex justify-between items-start mb-5 gap-4">
                  <span className="inline-block px-4 py-2 bg-blue-50 text-primary_colors text-xs font-bold rounded-lg border border-blue-200">
                    📅 {createdDate}
                  </span>

                  {/* STATUS SECTION - VERY CLEAR */}
                  <div className="flex-1 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-300">
                    <div className="text-center">
                      <p className="text-xs text-gray-700 font-bold tracking-widest mb-2">
                        TASK STATUS
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {myTasks?.status === "pending" && (
                          <>
                            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                            <span className="text-base font-black text-yellow-700 uppercase">
                              ⏳ Pending
                            </span>
                          </>
                        )}
                        {myTasks?.status === "in-progress" && (
                          <>
                            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-base font-black text-blue-700 uppercase">
                              🔄 In Progress
                            </span>
                          </>
                        )}
                        {myTasks?.status === "completed" && (
                          <>
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-base font-black text-green-700 uppercase">
                              ✅ Completed
                            </span>
                          </>
                        )}
                        {!["pending", "in-progress", "completed"].includes(
                          myTasks?.status
                        ) && (
                          <>
                            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                            <span className="text-base font-black text-gray-700 capitalize">
                              {myTasks?.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section - Two Column Layout */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* ASSIGNEE */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                    <p className="text-xs text-blue-700 font-bold tracking-wider mb-2">
                      👤 ASSIGNEE
                    </p>
                    <p className="text-sm font-bold text-blue-900 capitalize line-clamp-2">
                      {myTasks?.assigneeName || "🔄 Unassigned"}
                    </p>
                  </div>

                  {/* STEP NAME */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300">
                    <p className="text-xs text-purple-700 font-bold tracking-wider mb-2">
                      📌 STEP
                    </p>
                    <p className="text-sm font-bold text-purple-900 capitalize line-clamp-2">
                      {myTasks?.name}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-3">
                  {myTasks?.assignee === user?._id && !isFinished && (
                    <>
                      <button
                        onClick={() => (
                          setStepNumber(myTasks._id), setStatusUpdate(true)
                        )}
                        className="w-full px-4 py-2 bg-gradient-to-r from-primary_colors to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                      >
                        ✏️ UPDATE STATUS
                      </button>
                    </>
                  )}
                </div>

                {/* Timer Controls */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border-2 border-green-300 flex gap-2 items-center">
                  <span className="text-green-800 font-bold text-sm flex-shrink-0">
                    ⏱️ Timer:
                  </span>
                  <button
                    onClick={() => setActiveTaskId(myTasks._id)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-bold text-xs hover:bg-green-600 transition-all hover:scale-105"
                  >
                    ▶ START
                  </button>
                  <button
                    onClick={() => setActiveTaskId(null)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-bold text-xs hover:bg-red-600 transition-all hover:scale-105"
                  >
                    ⏹ STOP
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-500 font-semibold">
                  📭 No current or upcoming tasks
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  All tasks are completed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-800">📄 Documents</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-primary_colors to-blue-400 rounded-full"></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex gap-4 overflow-x-auto">
            {application?.documents?.length > 0 ? (
              application?.documents?.map((items, i) => (
                <Tippy key={i} className="" content={<div>{items?.name}</div>}>
                  <div className="flex flex-col items-center text-center text-[11px] cursor-pointer hover:scale-110 transition-transform">
                    <Link to={items?.location}>
                      <img
                        src={require("../../../assets/icon/file.png")}
                        alt="file"
                        className="w-16 border-2 border-gray-300 p-2 rounded-lg hover:border-primary_colors transition-all"
                      />
                    </Link>
                    <span className="mt-2 font-semibold text-gray-700 truncate max-w-16">
                      {items?.name}
                    </span>
                  </div>
                </Tippy>
              ))
            ) : (
              <div className="w-full flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-gray-500 font-semibold">
                    📂 No documents available
                  </p>
                </div>
              </div>
            )}

            {!isFinished && (
              <button
                onClick={() => setDocModal(true)}
                className="ml-auto px-6 py-3 bg-primary_colors text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2"
              >
                ➕ Upload Document
              </button>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-800">💬 Messages</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-primary_colors to-blue-400 rounded-full"></div>
          </div>

          {/* Comment Input */}
          {!isFinished && (
            <div className="relative mb-4">
              <form action="" onSubmit={submitHandle}>
                <MentionsInput
                  value={comment}
                  onChange={changeHandler}
                  className="mentions-input w-full h-20 rounded-xl focus:outline-none text-sm bg-white text-gray-700 resize-none border-2 border-gray-200 focus:border-primary_colors transition-all"
                  placeholder="Type your message... Use @name to mention"
                  style={{ padding: "12px" }}
                >
                  <Mention
                    trigger="@"
                    data={employeeData.map((emp) => ({
                      id: emp._id,
                      display: emp.name,
                    }))}
                    className="mentions__mention"
                  />
                </MentionsInput>
                <button className="absolute bottom-3 right-3 px-4 py-2 bg-primary_colors text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Chat Display */}
          <div className="w-full h-80 space-y-3 overflow-y-auto border-2 border-gray-300 p-5 rounded-xl bg-gray-50">
            {comments?.length > 0 ? (
              comments?.map((items, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h1 className="text-xs font-bold text-primary_colors capitalize">
                      {items?.commentor}
                    </h1>
                    <h1 className="text-xs text-gray-400">
                      {new Date(items?.createdAt).toLocaleString("en-IN")}
                    </h1>
                  </div>
                  <div className="bg-gradient-to-r from-primary_colors to-blue-500 p-4 mt-2 rounded-xl shadow-sm">
                    <p className="text-sm text-white break-words leading-relaxed">
                      {items?.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-40 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 font-semibold">
                    💭 No messages yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Reports */}
        <div className="mt-8">
          <TimeReport taskId={activeTaskId} allTasks={data?.steps} />
        </div>
      </div>

      {docModal && (
        <DocModal
          cb={cb}
          setModal={setDocModal}
          applicationData={application}
        />
      )}

      {statusUpdate && (
        <StatusModal
          cb={cb}
          setModal={setStatusUpdate}
          stepNumber={stepNumber}
          applicationData={data}
        />
      )}

      {assigneeUpdate && (
        <AdminModal
          cb={cb}
          setModal={setAssigneeUpdate}
          stepNumber={stepNumber}
          applicationData={data}
        />
      )}
    </>
  );
};

export default RightSide;
