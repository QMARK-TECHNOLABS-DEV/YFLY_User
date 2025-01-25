import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
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
    communication: [],
    author: user?._id,
    contents: [],
  });

  const [content, setContent] = useState("");
  // const [studentName, setStudentName] = useState("")
  const [notes, setNotes] = useState([]);

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

    setFollowData((prev) => ({
      ...prev,
      contents: [...prev.contents, content],
    }));

    setContent("");
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
          communication: followup?.communication ?? [],
        }));

        setNotes(followup?.notes);
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
      const response = await axiosPrivate.put(followupRoute, followData);

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
      <div className="relative bg-white w-full md:w-1/2 rounded-lg  p-5">
        <IoClose
          onClick={() => setModal(false)}
          className="absolute right-1 top-1 rounded bg-primary_colors text-white cursor-pointer"
        />
        <div className="flex flex-col w-full items-center justify-center border-2 rounded-lg border-dotted border-primary_colors p-5 md:p-17">
          <div className=" rounded-lg w-full flex flex-col gap-4">
            <h1 className="font-bold text-center text-xl md:text-[22px] text-primary_colors pb-3">
              View/Edit Follow-Up
            </h1>

            <div className="flex justify-between">
              <p className="mb-3 capitalize">
                Follow Up with {studentData?.name ?? "NIL"}
              </p>
              <button
                type="button"
                onClick={saveChanges}
                className="bg-primary_colors text-white p-2 px-5 rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                Save
              </button>
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
                    <div className="flex flex-col">
                      <label className="capitalize text-[#777] text-sm">
                        You:
                      </label>
                      <textarea
                        name="note"
                        placeholder="Note"
                        id=""
                        // cols="20"
                        rows="2"
                        value={item}
                        disabled={true}
                        className="w-full border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
                      ></textarea>
                    </div>
                  ))}

                {notes?.length > 0 && (
                  <h2 className="text-sm mt-4">Previous Notes: </h2>
                )}
                {notes?.length > 0 &&
                  [...notes]?.reverse()?.map((item, i) => (
                    <div className="flex flex-col">
                      <label className=" text-[#777] text-sm flex justify-between ">
                        <span className="capitalize">
                          {item?.author?.name ?? "Yfly"}:
                        </span>

                        {
                          item?.date
                          &&
                          <span className="text-xs">
                            {new Date(item?.date).toLocaleString('en-IN')}
                          </span>
                        }
                        
                      </label>
                      <textarea
                        name="note"
                        placeholder="Note"
                        id=""
                        // cols="20"
                        rows="2"
                        value={item?.content}
                        disabled={true}
                        className="w-full border-2 rounded-lg bg-primary_colors/5  border-primary_colors p-2 focus:outline-none"
                      ></textarea>
                    </div>
                  ))}
              </div>
            </div>

            {/* Add Note */}

            <div className="text-black text-normal flex items-center mt-5 justify-between">
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
          </div>
        </div>
      </div>
      {/* {loader && <ReqLoader />} */}

      {/* {addBox && <FollowupBox setModal={setAddBox} data={leadData} getMethod={getMethod} /> } */}
    </div>
  );
};

export default SingleFollow;
