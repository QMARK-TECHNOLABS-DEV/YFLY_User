import React, { useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { EmployeeCards } from "../../data/Employee";
import { useLocation } from "react-router-dom";

import {
  getEmployeesRoute,
  notification,
  workAssignRoute,
  workEmployeeAssignRoute,
} from "../../utils/Endpoint";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../api/axios";

const AdminModal = ({ setModal, applicationData, cb, stepNumber }) => {
  const axios = useAxiosPrivate();
  const path = useLocation();

  const userInfo = useSelector((items) => items.auth.userInfo);
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef();
  const [formData, setFormData] = useState({
    applicationId: applicationData?.applicationId,
    employeeId: "",
    stepNumber: stepNumber || "",
    stepperId: applicationData?._id,
  });

  // Keep form data in sync when props change
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      applicationId: applicationData?.applicationId,
      stepNumber: stepNumber || prev.stepNumber || "",
      stepperId: applicationData?._id,
    }));
  }, [applicationData, stepNumber]);

  // console.log(applicationData);

  const onChangeCata = async (e) => {
    try {
      const response = await axios.get(
        `${getEmployeesRoute}?department=${e.target.value}`
      );
      setEmployee(response?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const inputChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(workEmployeeAssignRoute, formData);
      if (response?.status === 200) {
        toast.success(response?.data?.msg);

        const step =
          applicationData?.steps?.find(
            (item) => String(item?._id) === formData?.stepNumber
          ) || "NA";

        const notificationData = {
          userId: formData?.employeeId,
          title: `New Task assigned by ${userInfo?.name}`,
          body: `Step : ${step?.name} `,
          notificationType: "assign",
          route: path?.pathname,
        };
        const notificationSend = await axiosPrivate.post(
          notification,
          notificationData
        );

        console.log(notificationSend);
      }
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.msg === "FCM Token not found") {
        toast.success("Saved changes");
      }
    } finally {
      setLoading(false);
      setModal(false);
      cb();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-auto bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white mt-20 md:w-2/6  md:mt-0  rounded-lg p-5  m-5">
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
                {formData?.stepNumber
                  ? "Assign to the current step"
                  : "Assign to the next step"}
              </h1>

              <div>
                <label
                  htmlFor=""
                  className="text-sm text-gray-600 font-semibold"
                >
                  Step Status*
                </label>
                <div className="mt-1">
                  <select
                    ref={selectRef}
                    name="stepNumber"
                    value={formData.stepNumber}
                    id=""
                    className="border p-3 w-full rounded focus:outline-none text-sm text-gray-400"
                    onChange={inputChangeHandler}
                  >
                    <option className="text-sm" value="">
                      Select a step
                    </option>
                    {applicationData?.steps?.map((items, i) => (
                      <option
                        key={i}
                        className="text-gray-900"
                        value={items?._id}
                      >
                        {items?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <label
                  htmlFor=""
                  className="text-sm text-gray-600 font-semibold"
                >
                  Assignee Category*
                </label>
                <div className="mt-1">
                  <select
                    ref={selectRef}
                    name="stepStatus"
                    id=""
                    className="border p-3 w-full rounded focus:outline-none text-sm text-gray-400"
                    onChange={onChangeCata}
                  >
                    <option className="text-sm" value="">
                      Select a Category
                    </option>
                    {EmployeeCards.map((items, i) => (
                      <option
                        key={i}
                        className="text-gray-900"
                        value={items?.path}
                      >
                        {items?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <label
                  htmlFor=""
                  className="text-sm text-gray-600 font-semibold"
                >
                  Assignee*
                </label>
                <div className="mt-1">
                  <select
                    ref={selectRef}
                    name="employeeId"
                    id=""
                    className="border p-3 w-full rounded focus:outline-none text-sm text-gray-400"
                    onChange={inputChangeHandler}
                  >
                    <option className="text-sm" value="">
                      Select an option
                    </option>
                    {employee?.length > 0 ? (
                      employee?.map((items, i) => (
                        <option
                          key={i}
                          className="text-gray-900"
                          value={items?._id}
                        >
                          {items?.name}
                        </option>
                      ))
                    ) : (
                      <option>No data</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex w-full">
                <button
                  type="submit"
                  className="bg-primary_colors p-2 px-4 rounded text-white text-sm mt-6 w-full"
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {loading && <ReqLoader />}
    </div>
  );
};

export default AdminModal;
