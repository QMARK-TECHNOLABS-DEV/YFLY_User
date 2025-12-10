import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  followupRoute,
  notification,
  baseUrl,
  deleteFollowupNote,
  deleteFollowupAttachment,
  deleteFollowupComment,
} from "../utils/Endpoint";
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
  const [notes, setNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComments, setNewComments] = useState([]); // local unsaved comments
  const [previousAttachments, setPreviousAttachments] = useState([]);

  const normalizeNotes = (rawNotes) => {
    if (!rawNotes) return [];

    console.log("Raw notes received:", rawNotes);
    console.log("Type of rawNotes:", typeof rawNotes);

    let notesArray = rawNotes;

    // Handle if entire notes is a stringified array
    if (typeof rawNotes === "string") {
      try {
        notesArray = JSON.parse(rawNotes);
        console.log("Parsed notes string:", notesArray);
      } catch (e) {
        console.error("Failed to parse notes string:", e);
        return [];
      }
    }

    if (!Array.isArray(notesArray)) {
      console.log("Notes is not an array, wrapping:", notesArray);
      notesArray = [notesArray];
    }

    // Normalize each note item
    const normalized = notesArray
      .map((item, index) => {
        console.log(`Processing note ${index}:`, item, "Type:", typeof item);
        let noteObj = item;

        // Parse if item is a stringified object
        if (typeof item === "string") {
          try {
            noteObj = JSON.parse(item);
            console.log(`Parsed note ${index}:`, noteObj);
          } catch (e) {
            console.error(`Failed to parse note ${index}:`, e);
            return { content: String(item), date: null, author: null };
          }
        }

        // If parsed result is an array, take the first item
        if (Array.isArray(noteObj) && noteObj.length > 0) {
          console.log(
            `Note ${index} is array, extracting first item:`,
            noteObj[0]
          );
          noteObj = noteObj[0];
        }

        // Check if content itself is a stringified JSON
        let content = noteObj?.content || noteObj?.note || "";
        if (typeof content === "string" && content.trim().startsWith("[")) {
          try {
            const parsedContent = JSON.parse(content);
            console.log(`Content is stringified array:`, parsedContent);
            if (Array.isArray(parsedContent) && parsedContent.length > 0) {
              // Extract the actual content from the first item in the array
              const firstItem = parsedContent[0];
              content = firstItem?.content || firstItem?.note || "";
              noteObj.date =
                noteObj.date || firstItem?.createdAt || firstItem?.date || null;
              noteObj.author = noteObj.author || firstItem?.author || null;
            }
          } catch (e) {
            console.log(`Content looks like JSON but failed to parse:`, e);
          }
        }

        const result = {
          id: noteObj?._id || noteObj?.id || null,
          content: content,
          date: noteObj?.date || noteObj?.createdAt || null,
          author: noteObj?.author || null,
          raw: noteObj,
        };

        console.log(`Normalized note ${index}:`, result);
        return result;
      })
      .filter((note) => note.content); // Remove empty notes

    console.log("Final normalized notes:", normalized);
    return normalized;
  };

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

  // Utility to expand endpoint templates with followupId and resource id
  const buildDeleteUrl = (template, resourceIdPlaceholder, resourceId) => {
    if (!studentData?.followup) return null;
    let url = template.replace(":followupId", studentData.followup);
    if (resourceIdPlaceholder && resourceId) {
      url = url.replace(resourceIdPlaceholder, resourceId);
    }
    return url;
  };

  // Delete handlers using endpoint constants
  const deleteNote = async (noteId) => {
    if (!noteId) return toast.error("Missing note id");
    if (!studentData?.followup) return toast.error("Missing followup id");
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const prev = notes;
    setNotes((n) => n.filter((nt) => nt.id !== noteId));

    try {
      const url = buildDeleteUrl(deleteFollowupNote, ":noteId", noteId);
      const res = await axiosPrivate.delete(url);
      if (res.status === 200) {
        toast.success("Note deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setNotes(prev);
      toast.error("Failed to delete note");
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (!attachmentId) return toast.error("Missing attachment id");
    if (!studentData?.followup) return toast.error("Missing followup id");
    if (!window.confirm("Are you sure you want to delete this attachment?"))
      return;

    const prev = previousAttachments;
    setPreviousAttachments((a) =>
      a.filter((att) => (att._id || att.id) !== attachmentId)
    );

    try {
      const url = buildDeleteUrl(
        deleteFollowupAttachment,
        ":attachmentId",
        attachmentId
      );
      const res = await axiosPrivate.delete(url);
      if (res.status === 200) {
        toast.success("Attachment deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setPreviousAttachments(prev);
      toast.error("Failed to delete attachment");
    }
  };

  const deleteComment = async (item) => {
    if (!item) return;
    // if local unsaved comment
    if (newComments.find((c) => c._id === item._id)) {
      if (!window.confirm("Remove this unsaved comment?")) return;
      setNewComments((prev) => prev.filter((c) => c._id !== item._id));
      toast.info("Comment removed");
      return;
    }

    if (!item._id) return toast.error("Missing comment id");
    if (!studentData?.followup) return toast.error("Missing followup id");
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    const prev = comments;
    setComments((c) => c.filter((it) => it._id !== item._id));

    try {
      const url = buildDeleteUrl(deleteFollowupComment, ":commentId", item._id);
      const res = await axiosPrivate.delete(url);
      if (res.status === 200) {
        toast.success("Comment deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setComments(prev);
      toast.error("Failed to delete comment");
    }
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

  const addCommentFunc = () => {
    const trimmedComment = comment?.trim();
    if (!trimmedComment || trimmedComment.length === 0) {
      toast.warning("Please enter a comment");
      return;
    }

    const commentData = {
      followupId: studentData?.followup,
      studentId: followData?.studentId,
      commentText: trimmedComment,
      commentor: user?._id,
      commentorName: user?.name,
      createdAt: new Date().toISOString(),
      _id: Math.random().toString(36).substr(2, 9),
    };

    // add to local unsaved comments only
    setNewComments((prev) => [commentData, ...prev]);
    setComment("");
    toast.success("Comment added (not yet saved)");
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

        setNotes(normalizeNotes(followup?.notes));
        // Fetch and set comments from backend only
        if (followup?.comments && Array.isArray(followup.comments)) {
          setComments(followup.comments);
        }
        // keep any local newComments until user saves or modal is reopened
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
      formDataToSend.append(
        "communication",
        JSON.stringify(followData.communication)
      );
      formDataToSend.append("contents", JSON.stringify(followData.contents));
      // only send newly added comments (not existing fetched comments)
      formDataToSend.append("comments", JSON.stringify(newComments));

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
            const notificationReponse = await axiosPrivate.post(
              notification,
              data
            );
            console.log({ notificationReponse });
          } catch (error) {
            console.log(error);
          }
        }

        // clear local unsaved comments after successful save
        setNewComments([]);
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
              <h2 className="text-sm font-semibold text-primary_colors">
                Status:
              </h2>
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
                      status:
                        prev.status === statusOption ? null : statusOption,
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
                            {new Date(item?.createdAt).toLocaleString("en-IN")}
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
                  [...notes]?.reverse()?.map((note, i) => (
                    <div className="flex flex-col" key={i}>
                      <label className=" text-[#777] text-sm flex justify-between items-center ">
                        <div>
                          <span className="capitalize">
                            {note?.author?.name ?? "Yfly"}:
                          </span>
                          {note?.date && (
                            <span className="text-xs ml-2">
                              {new Date(note?.date).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        {note?.id && (
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Delete note"
                          >
                            <MdDeleteOutline size={18} />
                          </button>
                        )}
                      </label>
                      <textarea
                        name="note"
                        placeholder="Note"
                        id=""
                        rows="2"
                        value={note?.content}
                        disabled={true}
                        className="w-full border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
                      ></textarea>
                    </div>
                  ))}
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
              <h2 className="text-sm font-semibold text-primary_colors mb-3">
                Upload Attachments (CV, Documents, etc.)
              </h2>

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
              {(followData?.attachments?.length > 0 ||
                previousAttachments?.length > 0) && (
                <div className="mb-3">
                  <label className="text-xs text-gray-600 block mb-2">
                    Attached Files:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Previously Saved Attachments */}
                    {previousAttachments?.map((attachment, index) => {
                      // derive file name and url
                      const fileName =
                        attachment.name ||
                        attachment.filename ||
                        attachment.fileName ||
                        attachment.key ||
                        "";
                      let fileUrl =
                        attachment.location ||
                        attachment.url ||
                        attachment.path ||
                        "";

                      if (!fileUrl) {
                        if (attachment.key) {
                          fileUrl = `${baseUrl}/uploads/${attachment.key}`;
                        } else if (fileName) {
                          fileUrl = `${baseUrl}/uploads/${fileName}`;
                        }
                      } else if (fileUrl && !/^https?:\/\//i.test(fileUrl)) {
                        // relative path stored (e.g. '/uploads/xxx')
                        fileUrl = `${baseUrl}/${fileUrl.replace(/^\//, "")}`;
                      }

                      return (
                        <div
                          key={`prev-${index}`}
                          role={fileUrl ? "button" : undefined}
                          tabIndex={fileUrl ? 0 : undefined}
                          onClick={() =>
                            fileUrl && window.open(fileUrl, "_blank")
                          }
                          onKeyDown={(e) => {
                            if (
                              fileUrl &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              window.open(fileUrl, "_blank");
                            }
                          }}
                          className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-300 cursor-pointer"
                        >
                          <div className="flex-1">
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-gray-700 truncate hover:underline block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {fileName || fileUrl}
                              </a>
                            ) : (
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {fileName || "Attachment"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAttachment(
                                  attachment._id || attachment.id
                                );
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Delete attachment"
                            >
                              <MdDeleteOutline size={16} />
                            </button>
                            <span className="text-xs text-green-600 font-semibold">
                              Saved
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
                Accepted formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, ZIP
                (Max 5MB each)
              </p>
            </div>

            {/* Comments Section */}
            <div className="mt-5 border-2 rounded-lg border-primary_colors p-4">
              <h2 className="text-sm font-semibold text-primary_colors mb-3">
                Team Comments
              </h2>

              {/* Comments List */}
              <div className="max-h-[200px] overflow-y-scroll mb-4 space-y-2">
                {[...newComments, ...comments].length > 0 ? (
                  [...newComments, ...comments].map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-gray-800">
                          {item?.commentorName || "You"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(item?.createdAt).toLocaleString("en-IN")}
                          </span>
                          {(item.commentor === user?._id ||
                            newComments.find((c) => c._id === item._id)) && (
                            <button
                              type="button"
                              onClick={() => deleteComment(item)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              title="Delete comment"
                            >
                              <MdDeleteOutline size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 break-words">
                        {item?.commentText}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No comments yet
                  </p>
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
