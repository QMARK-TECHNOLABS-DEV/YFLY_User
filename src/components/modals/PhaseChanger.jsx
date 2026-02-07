import React, { useRef, useState, useEffect } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";

import {
  changePhaseOfApplication,
  updateApplicationRoute,
} from "../../utils/Endpoint";
import { Phases } from "../../data/Dashboard";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const PhaseChanger = ({ data, setData, getTableData, setModal }) => {
  const axios = useAxiosPrivate();

  const selectRef = useRef();
  const [loader, setLoader] = useState(false);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    // initialize deadline input when modal opens
    if (data?.deadline) {
      const d = new Date(data.deadline);
      if (!isNaN(d.valueOf())) {
        setDeadline(d.toISOString().slice(0, 10));
      }
    } else {
      setDeadline("");
    }
  }, [data]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const phase = selectRef?.current?.value;

    try {
      setLoader(true);
      // update phase
      await axios.put(`${changePhaseOfApplication}/${data?._id}`, { phase });

      // update deadline if provided
      if (deadline) {
        try {
          await axios.put(updateApplicationRoute, {
            applicationId: data?._id,
            deadline,
          });
        } catch (err) {
          console.error("Deadline update failed", err);
          toast.warning(
            err?.response?.data?.msg || "Failed to update deadline"
          );
        }
      }

      setModal(false);
      setData({});
      getTableData();
      toast.success("Application State Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.warning(error?.response?.data?.msg);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-auto bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white mt-60 md:w-2/6  md:mt-0  rounded-lg p-5  m-5">
        <IoCloseCircle
          onClick={() => setModal(false)}
          className="absolute right-3 top-3 rounded bg-primary_colors text-white cursor-pointer"
        />

        {/* Form part */}
        <div className="flex flex-col w-full border rounded shadow ">
          <form
            action=""
            onSubmit={submitHandler}
            className="flex flex-col md:flex-row justify-around w-full gap-3 "
          >
            {/* File Name and submit */}
            <div className="w-full p-5">
              <h1 className="font-bold text-center mb-4 text-primary_colors">
                Update the Deadline of {data?.studentName}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* <div>
                  <label
                    htmlFor=""
                    className="text-sm text-gray-600 font-semibold"
                  >
                    Application State
                  </label>
                  <div className="mt-1">
                    <select
                      ref={selectRef}
                      defaultValue={data?.phase}
                      name="stepStatus"
                      id=""
                      className="border p-3 w-full rounded capitalize focus:outline-none text-sm text-gray-700"
                    >
                      <option className="text-xs" value="">
                        Select a state
                      </option>
                      {Phases.map((phase) => (
                        <option
                          key={phase.id}
                          value={phase?.name}
                          className="capitalize"
                        >
                          {phase?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div> */}

                <div>
                  {/* <label
                    htmlFor=""
                    className="text-sm text-gray-600 font-semibold"
                  >
                    Update Deadline
                  </label> */}
                  <div className="mt-1 ">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="border p-3 w-full rounded focus:outline-none text-sm text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex w-full justify-around">
                <button
                  type="submit"
                  className="bg-primary_colors p-2 px-4 rounded text-white text-sm mt-6 w-full"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {loader && <ReqLoader />}
    </div>
  );
};

export default PhaseChanger;
