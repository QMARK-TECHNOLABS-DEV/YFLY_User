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

  const path = useLocation();

  const isFinished =
    application.phase === "completed" || application.phase === "cancelled";

  // console.log(data);
  let empTasks = [];
  if (user.role === "admin") {
    empTasks = data?.steps?.filter((step) => (step?.assignee ? true : false));
    empTasks?.reverse();
  }

  let myTasks = [];
  if (user.role === "employee") {
    myTasks = data?.steps?.filter((step) => (step?.assignee ? true : false));
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
          await axiosPrivate.post(`${notifyRoute}/multi-send`, notificationData);

        } catch (error) {
          console.log(error)
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
      {/* Application Info */}
      <h1 className="mb-3 font-semibold text-slate-500 text-sm text-gray-600">
        {user?.role === "admin" ? "Application Steps" : "Task Update"}
      </h1>

      <div className="w-full max-h-[220px] overflow-y-scroll space-y-2 ">
        {empTasks?.map((empTask) => (
          <div key={empTask._id} className="bg-white p-5  rounded-lg">
            <div className="flex justify-between">
              <h1 className="text-sm font-semibold">{createdDate}</h1>
              <div>
                <h1 className="text-sm font-bold ">
                  <span>Status : </span>
                  <span className="text-primary_colors capitalize">
                    {empTask?.status}
                  </span>
                </h1>
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex justify-between ">
              <div className="space-y-1">
                <h1 className="text-sm text-primary_colors font-semibold capitalize">
                  Assignee : {empTask?.assigneeName}
                </h1>
                <h1 className="text-sm font-semibold capitalize">
                  Step : {empTask?.name}
                </h1>
              </div>
              <div className="flex flex-col justify-between capitalize">
                {!isFinished && (
                  <button
                    onClick={() => {
                      setStepNumber(empTask._id);
                      setAssigneeUpdate(true);
                    }}
                    className="w-full text-[13px] bg-primary_colors text-white p-1 px-5 rounded "
                  >
                    Assign Next
                  </button>
                )}
                <h1 className="font-semibold text-sm mt-1 text-end">
                  Step Number: {empTask?._id}
                </h1>
              </div>
            </div>
          </div>
        ))}
        {myTasks?.map((myTasks) => (
          <div key={myTasks._id} className="bg-white p-5  rounded-lg">
            <div className="flex justify-between">
              <h1 className="text-sm font-semibold">{createdDate}</h1>
              <div>
                <h1 className="text-sm font-bold ">
                  <span>Status : </span>
                  <span className="text-primary_colors capitalize">
                    {myTasks?.status}
                  </span>
                </h1>
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex justify-between ">
              <div className="space-y-1">
                <h1 className="text-sm text-primary_colors font-semibold capitalize">
                  Assignee : {myTasks?.assigneeName}
                </h1>
                <h1 className="text-sm font-semibold capitalize">
                  Step : {myTasks?.name}
                </h1>
              </div>
              <div className="flex flex-col justify-between capitalize">
                {myTasks?.assignee === user?._id && !isFinished && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => (
                        setStepNumber(myTasks._id), setStatusUpdate(true)
                      )}
                      className="w-full text-[13px] bg-primary_colors text-white p-1 px-5 rounded "
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setStepNumber(myTasks._id);
                        setAssigneeUpdate(true);
                      }}
                      className="w-full text-[13px] bg-primary_colors text-white p-1 px-5 rounded "
                    >
                      Assign Next
                    </button>
                  </div>
                )}

                <h1 className="font-semibold text-sm mt-1 text-end">
                  Step Number: {myTasks?._id}
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <h1 className="my-3 font-semibold text-slate-500 text-sm text-gray-600">
        Documents
      </h1>
      <div className="bg-white p-4 rounded-lg flex gap-2 relative overflow-x-scroll capitalize">
        {application?.documents?.length > 0 ? (
          application?.documents?.map((items, i) => (
            <Tippy key={i} className="" content={<div>{items?.name}</div>}>
              <div className="flex flex-col text-center text-[11px] cursor-pointer">
                <Link to={items?.location}>
                  <img
                    src={require("../../../assets/icon/file.png")}
                    alt="file"
                    className="w-14 border p-1 rounded"
                  />
                </Link>
                <span>{items?.name}</span>
              </div>
            </Tippy>
          ))
        ) : (
          <div className="w-full flex items-center justify-center">
            <EmptyData data={"No Document Are Available"} />
          </div>
        )}

        {!isFinished && (
          <button
            onClick={() => setDocModal(true)}
            className="absolute bottom-5 right-4 bg-primary_colors text-white text-[13px] px-5 rounded p-1 text-center"
          >
            Upload Document
          </button>
        )}
      </div>

      {/* Comment typing Form */}
      <h1 className="my-3 font-semibold text-slate-500 text-sm text-gray-600">
        Comments
      </h1>
      {/* {!isFinished && (
        <div className="relative ">
          <form action="" onSubmit={submitHandle}>
            <textarea
              required
              name="comment"
              id=""
              cols="30"
              rows="10"
              className="w-full h-20 rounded-lg focus:outline-none p-3 text-xs text-slate-300"
              placeholder="Enter your message"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button className="absolute bottom-5 right-4 bg-primary_colors text-white text-[13px] px-5 rounded p-2 text-center">
              Send
            </button>
          </form>
        </div>
      )} */}

      {!isFinished && (
        <div className="relative">
          <form action="" onSubmit={submitHandle}>
            <MentionsInput
              value={comment}
              onChange={changeHandler}
              className="mentions-input w-full h-20 rounded-lg focus:outline-none  text-xs bg-white text-slate-300 resize-none overflow-y-auto"
              placeholder="Enter your message"
              style={{ padding: "5px" }}
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
            <button className="absolute bottom-5 right-4 bg-primary_colors text-white text-[13px] px-5 rounded p-2 text-center">
              Send
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="my-3  max-h-[220px] space-y-3 overflow-scroll border p-3 rounded-lg">
        {comments?.length > 0 ? (
          comments?.map((items, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <h1 className="text-xs font-medium text-gray-500 capitalize">
                  {items?.commentor}
                </h1>
                <h1 className="text-xs text-gray-500">
                  {new Date(items?.createdAt).toLocaleString()}
                </h1>
              </div>
              <div className="bg-primary_colors p-5 mt-2 rounded-lg">
                <p className="text-[13px] text-white">{items?.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <EmptyData data={"No Comments Are Available"} />
          </div>
        )}
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
