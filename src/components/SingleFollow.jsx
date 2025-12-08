import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { followupRoute, notification } from "../utils/Endpoint";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const SingleFollow = ({
  setModal,
  getData,
  studentData,
  employeeData,
  stagesData,
  comMethods,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const user = useSelector((state) => state.auth.userInfo);

  const path = useLocation();
  // console.log(path)
  // console.log(user)
  // console.log(studentData)

  const [followData, setFollowData] = useState({
    studentId: studentData?._id,
    assignee: null,
    stage: null,
    status: null,
    communication: [],
    author: user?._id,
    contents: [],
    attachments: [],
  });

  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState("");
  // const [studentName, setStudentName] = useState("")
  const [notes, setNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [previousAttachments, setPreviousAttachments] = useState([]);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFollowData((prev) => {
      if (name === "communication") {
        return {
          ...prev,
          communication: [...prev.communication, value],
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const toggleChecker = (commId) => {
    // remove commId if present
    if (followData?.communication?.includes(commId)) {
      const newArr = followData?.communication?.filter(
        (item) => item !== commId
      );
      setFollowData((prev) => ({ ...prev, communication: newArr }));
    } else {
      setFollowData((prev) => ({
        ...prev,
        communication: [...prev.communication, commId],
      }));
    }
  };

  const addNoteFunc = () => {
    if (!content?.trim()) {
      return;
    }

    const noteWithTimestamp = {
      content: content,
      createdAt: new Date().toISOString(),
    };

    setFollowData((prev) => ({
      ...prev,
      contents: [...prev.contents, noteWithTimestamp],
    }));

    setContent("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const addAttachment = () => {
    if (!selectedFile) {
      toast.warning("Please select a file first");
      return;
    }

    const attachment = {
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      uploadedAt: new Date().toISOString(),
    };

    setFollowData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, attachment],
    }));

    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById("attachmentInput");
    if (fileInput) fileInput.value = "";
    toast.success("File added successfully");
  };

  const removeAttachment = (index) => {
    setFollowData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
    toast.info("Attachment removed");
  };

  const addCommentFunc = async () => {
    if (!comment?.trim()) {
      toast.warning("Please enter a comment");
      return;
    }

    try {
      const commentData = {
        followupId: studentData?.followup,
        studentId: followData?.studentId,
        commentText: comment,
        commentor: user?._id,
        commentorName: user?.name,
        createdAt: new Date().toISOString(),
      };

      const newComment = {
        ...commentData,
        _id: Math.random().toString(36).substr(2, 9),
      };

      setComments([newComment, ...comments]);
      setComment("");
      toast.success("Comment added");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add comment");
    }
  };

  const getFollowup = async () => {
    try {
      if (!studentData?.followup) {
        return;
      }
      const response = await axiosPrivate.get(
        `${followupRoute}/${studentData?.followup}`
      );

      if (response.status === 200) {
        const followup = response.data.followup;

        setFollowData((prev) => ({
          ...prev,
          // studentId:followup?.studentId?._id,
          assignee: followup?.assignee?._id ?? null,
          stage: followup?.stage ?? null,
          status: followup?.status ?? null,
          communication: followup?.communication ?? [],
        }));

        setNotes(followup?.notes);
        // Fetch and set comments
        if (followup?.comments && Array.isArray(followup.comments)) {
          setComments(followup.comments);
        }
        // Fetch and set previous attachments
        if (followup?.attachments && Array.isArray(followup.attachments)) {
          setPreviousAttachments(followup.attachments);
        }
        // setStudentName(studentData.name)
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (studentData?.followup) {
      getFollowup();
    }
  }, [studentData?.followup]);

  const saveChanges = async () => {
    try {
      if (!followData?.studentId) {
        return;
      }

      // Create FormData to handle both files and JSON data
      const formDataToSend = new FormData();
      
      // Add regular fields
      formDataToSend.append("studentId", followData.studentId);
      formDataToSend.append("assignee", followData.assignee);
      formDataToSend.append("stage", followData.stage);
      formDataToSend.append("status", followData.status);
      formDataToSend.append("author", followData.author);
      formDataToSend.append("communication", JSON.stringify(followData.communication));
      formDataToSend.append("contents", JSON.stringify(followData.contents));
      formDataToSend.append("comments", JSON.stringify(comments));

      // Add files
      followData.attachments.forEach((attachment, index) => {
        formDataToSend.append(`attachments`, attachment.file);
      });

      const response = await axiosPrivate.put(followupRoute, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Update Saved");

        if (followData?.assignee) {
          const data = {
            userId: followData?.assignee,
            title: `Follow up with ${studentData?.name}`,
            body: `${user?.name} assigned you `,
            notificationType: "assign",
            route: `/employee/followups`,
          };

          try {
            // Notification post Data
            const notificationReponse = await axiosPrivate.post(notification, data);
            console.log({ notificationReponse });

          } catch (error) {
            console.log(error)
          }

        }

        setModal(false);
        getData();
      } else {
        toast.error("Unable to save");
      }
    } catch (error) {
      if (error?.response?.data?.msg === "FCM Token not found") {
        toast.success("Saved changes");
        setModal(false);
        getData();
      } else {
        console.log(error);
        toast.error("Unable to save");
      }
    }
  };


  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-auto bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="relative bg-white w-full md:w-1/2 rounded-lg p-5 max-h-[90vh] overflow-y-auto">
        <IoClose
          onClick={() => setModal(false)}
          className="sticky top-0 right-0 rounded bg-primary_colors text-white cursor-pointer z-10 float-right"
        />
        <div className="flex flex-col w-full items-center justify-center border-2 rounded-lg border-dotted border-primary_colors p-5 md:p-17 mt-8">
          <div className=" rounded-lg w-full flex flex-col gap-4">
            <h1 className="font-bold text-center text-xl md:text-[22px] text-primary_colors pb-3">
              View/Edit Follow-Up
            </h1>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-primary_colors">Status:</h2>
              <button
                type="button"
                onClick={saveChanges}
                className="bg-primary_colors text-white p-2 px-5 rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                Save
              </button>
            </div>

            {/* Status Selection Buttons */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {["Lead", "Hot", "Warm"].map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() =>
                    setFollowData((prev) => ({
                      ...prev,
                      status: prev.status === statusOption ? null : statusOption,
                    }))
                  }
                  className={`px-6 py-2 rounded-lg font-medium transition-all ease-in-out duration-200 ${
                    followData?.status === statusOption
                      ? "bg-primary_colors text-white scale-105"
                      : "border-2 border-primary_colors text-primary_colors hover:bg-primary_colors/10"
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <p className="mb-3 capitalize text-sm text-gray-600">
                {studentData?.name ?? "NIL"}
              </p>
            </div>

            <div className="w-full h-[200px] flex sm:flex-row flex-wrap overflow-y-scroll border-2 rounded-lg border-dotted border-primary_colors">
              {/* Employee Assignee */}
              <div className="h-fit px-2 py-4 capitalize">
                <select
                  name="assignee"
                  id=""
                  className="border focus:outline-none p-2 rounded border-primary_colors/30 cursor-pointer md:w-[125px]"
                  value={followData?.assignee ?? ""}
                  onChange={changeHandler}
                >
                  <option value="">Assignee</option>
                  {employeeData.map((data) => (
                    <option key={data?._id} value={data?._id}>
                      {data?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stages */}
              <div className="h-fit px-2 py-4 capitalize">
                <select
                  name="stage"
                  id=""
                  className="border focus:outline-none p-2 rounded border-primary_colors/30 cursor-pointer md:w-[125px]"
                  value={followData?.stage ?? ""}
                  onChange={changeHandler}
                >
                  <option value="">Stage</option>

                  {stagesData?.list?.map((data) => (
                    <option key={data?._id} value={data?._id}>
                      {data?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Communication Methods */}
              <div className="px-2 py-4 capitalize flex flex-wrap gap-2">
                {comMethods?.list?.map((data, i) => (
                  <div
                    className="w-fit h-fit flex items-center gap-2 p-2 rounded-lg border border-primary_colors"
                    key={data?._id}
                  >
                    <label htmlFor={`checkBox-${i}`}>{data?.label}</label>
                    <input
                      id={`checkBox-${i}`}
                      type="checkbox"
                      className="cursor-pointer"
                      name="communication"
                      checked={followData?.communication?.includes(data._id)}
                      onChange={() => toggleChecker(data?._id)}
                    />
                  </div>
                ))}
              </div>

              <div className="w-full px-4 flex flex-col gap-2">
                {followData?.contents?.length > 0 &&
                  [...followData?.contents]?.reverse()?.map((item, i) => (
                    <div className="flex flex-col" key={i}>
                      <label className="capitalize text-[#777] text-sm flex justify-between">
                        <span>You:</span>
                        {item?.createdAt && (
                          <span className="text-xs">
                            {new Date(item?.createdAt).toLocaleString('en-IN')}
                          </span>
                        )}
                      </label>
                      <textarea
                        name="note"
                        placeholder="Note"
                        id=""
                        rows="2"
                        value={item?.content || item}
                        disabled={true}
                        className="w-full border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
                      ></textarea>
                    </div>
                  ))}

                {notes?.length > 0 && (
                  <h2 className="text-sm mt-4">Previous Notes: </h2>
                )}
                {notes?.length > 0 &&
                  [...notes]?.reverse()?.map((item, i) => {
                    // Parse item if it's a string
                    const parsedItem = typeof item === 'string' ? JSON.parse(item) : item;
                    return (
                      <div className="flex flex-col" key={i}>
                        <label className=" text-[#777] text-sm flex justify-between ">
                          <span className="capitalize">
                            {parsedItem?.author?.name ?? "Yfly"}:
                          </span>

                          {
                            parsedItem?.date
                            &&
                            <span className="text-xs">
                              {new Date(parsedItem?.date).toLocaleString('en-IN')}
                            </span>
                          }
                          
                        </label>
                        <textarea
                          name="note"
                          placeholder="Note"
                          id=""
                          // cols="20"
                          rows="2"
                          value={parsedItem?.content}
                          disabled={true}
                          className="w-full border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
                        ></textarea>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Add Note */}

            <div className="text-black text-normal flex items-center mt-5 justify-between gap-2">
              <textarea
                name="content"
                placeholder="Note"
                id=""
                rows="2"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full sm:w-3/4 border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
              ></textarea>

              <button
                type="button"
                onClick={addNoteFunc}
                className=" bg-primary_colors text-white py-2 px-3 rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                Add Note
              </button>
            </div>

            {/* Attachments Section */}
            <div className="mt-5 border-2 rounded-lg border-dashed border-primary_colors p-4">
              <h2 className="text-sm font-semibold text-primary_colors mb-3">Upload Attachments (CV, Documents, etc.)</h2>
              
              {/* File Input */}
              <div className="flex gap-2 mb-4">
                <input
                  id="attachmentInput"
                  type="file"
                  onChange={handleFileSelect}
                  className="flex-1 text-sm p-2 border rounded-lg border-primary_colors/50 focus:outline-none"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip"
                />
                <button
                  type="button"
                  onClick={addAttachment}
                  className="bg-primary_colors text-white px-4 py-2 rounded-lg hover:scale-105 ease-in-out duration-200 whitespace-nowrap"
                >
                  + Add File
                </button>
              </div>

              {/* Attached Files List */}
              {(followData?.attachments?.length > 0 || previousAttachments?.length > 0) && (
                <div className="mb-3">
                  <label className="text-xs text-gray-600 block mb-2">Attached Files:</label>
                  <div className="flex flex-wrap gap-2">
                    {/* Previously Saved Attachments */}
                    {previousAttachments?.map((attachment, index) => (
                      <div
                        key={`prev-${index}`}
                        className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-300"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {attachment.name || attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.size ? (attachment.size / 1024).toFixed(2) : 'N/A'} KB
                          </p>
                        </div>
                        <span className="text-xs text-green-600 font-semibold">Saved</span>
                      </div>
                    ))}
                    {/* Newly Added Attachments */}
                    {followData?.attachments?.map((attachment, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-primary_colors/30"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, ZIP (Max 5MB each)
              </p>
            </div>

            {/* Comments Section */}
            <div className="mt-5 border-2 rounded-lg border-primary_colors p-4">
              <h2 className="text-sm font-semibold text-primary_colors mb-3">Team Comments</h2>

              {/* Comments List */}
              <div className="max-h-[200px] overflow-y-scroll mb-4 space-y-2">
                {comments?.length > 0 ? (
                  comments.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-gray-800">
                          {item?.commentorName || "You"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item?.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 break-words">
                        {item?.commentText}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No comments yet</p>
                )}
              </div>

              {/* Comment Input */}
              <div className="flex gap-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="2"
                  className="flex-1 text-sm p-2 border rounded-lg border-primary_colors/50 focus:outline-none resize-none"
                ></textarea>
                <button
                  type="button"
                  onClick={addCommentFunc}
                  className="bg-primary_colors text-white px-4 py-2 rounded-lg hover:scale-105 ease-in-out duration-200 whitespace-nowrap h-fit"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {loader && <ReqLoader />} */}

      {/* {addBox && <FollowupBox setModal={setAddBox} data={leadData} getMethod={getMethod} /> } */}
    </div>
  );
};

export default SingleFollow;
