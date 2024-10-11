import React, { useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { status } from "../../data/Employee";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import { changeStepStatus } from "../../utils/Endpoint";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const StatusModal = ({ setModal, stepNumber, applicationData, cb }) => {
  const axios = useAxiosPrivate();
  const selectRef = useRef();
  const employeeData = useSelector((state) => state.auth.userInfo);
  const [loading,setLoading] = useState(false)

  const currentStep = applicationData?.steps?.filter(
    (step) => step?._id === stepNumber
  );

  // console.log({applicationData});

  const submitHandler = async (e) => {
    e.preventDefault();
    const data = {
      stepperId: applicationData?._id,
      stepAssignee: employeeData?._id,
      stepNumber,
      stepStatus: selectRef.current.value,
    };
    try {
      setLoading(true)

      await axios.put(changeStepStatus, data)
      .then((response)=>{
        setModal(false)
        cb();
        toast.success(response?.data?.msg || "Status Update Successfully");
      })
      .catch((error)=>{
        toast.warning(error?.response?.data?.msg);
      })
      .finally(()=>{
        setLoading(false)
      })
    } catch (error) {
      console.log(error);
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
              <h1 className="font-bold capitalize  mb-4 text-primary_colors">
                Update the status of step : <span className="text-black">{currentStep[0]?.name ?? 'NA'}</span>
              </h1>
              <label htmlFor="" className="text-sm text-gray-600 font-semibold">
                Step Status*
              </label>
              <div className="mt-1">
                <select
                  ref={selectRef}
                  name="stepStatus"
                  id=""
                  className="border p-3 w-full rounded focus:outline-none text-sm text-gray-700"
                >
                  <option className="text-xs" value="">
                    Select an option
                  </option>
                  {status.map((items, index) => (
                    <option key={index} value={items?.name}>{items?.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex w-full">
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
      {loading && <ReqLoader/>}
    </div>
  );
};

export default StatusModal;
