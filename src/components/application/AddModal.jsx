import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  createApplicationRoute,
  getEmployeesRoute,
  getNamesOfStudentsRoute,
} from "../../utils/Endpoint";
import { Intake, countries } from "../../data/Dashboard";
import { useSelector } from "react-redux";

import { EmployeeCards } from "../../data/Employee";
import { toast } from "react-toastify";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AddModal = ({ setModal, cb }) => {
  const axios = useAxiosPrivate();

  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [employee, setEmployee] = useState([]);
  const user = useSelector((state) => state?.auth?.userInfo);

  const [formData, setFormData] = useState({
    creator: user?._id,
    studentId: "",
    country: "",
    uniBased: [
      {
        intake: "",
        program: "",
        university: "",
        partnership: "",
        through: "",
      },
    ],
    assignee: "",
  });

  // State for managing dynamic university inputs
  const [dynamicUniInputs, setDynamicUniInputs] = useState([
    {
      intake: "",
      program: "",
      university: "",
      partnership: "",
      through: "",
    },
  ]);

  // tracking the input changes
  const ChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // For department-wise employee data fetching
  const employeeCataChange = async (e) => {
    try {
      const response = await axios.get(
        `${getEmployeesRoute}?department=${e.target.value}`
      );
      setEmployee(response?.data);
    } catch (error) {
      console.log(error);
    } 
  };

  // Handle changes in dynamic university inputs
  const handleDynamicUniChange = (index, e) => {
    console.log("dynamicIndex", index);
    const newDynamicUniInputs = [...dynamicUniInputs];
    newDynamicUniInputs[index][e.target.name] = e.target.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      uniBased: newDynamicUniInputs,
    }));

    setDynamicUniInputs(newDynamicUniInputs);
  };

  // Add a new set of university inputs
  const handleAddUniInput = () => {
    setDynamicUniInputs([
      ...dynamicUniInputs,
      {
        intake: "",
        program: "",
        university: "",
        partnership: "",
        through: "",
      },
    ]);
  };

  const handleRemoveUniInput = (input, index) => {
    const dupliUniBased = [...formData?.uniBased];

    const iofub = dupliUniBased?.findIndex(
      (elem) =>
        elem.intake === input.intake &&
        elem.program === input.program &&
        elem.university === input.university &&
        elem.partnership === input.partnership &&
        elem.through === input.through
    );

    dupliUniBased.splice(iofub, 1);

    setFormData((prevFormData) => ({
      ...prevFormData,
      uniBased: [...dupliUniBased],
    }));

    const newArray = dynamicUniInputs.filter((inp, i) => i !== index);
    setDynamicUniInputs([...newArray]);
  };

  // initial-time student fetching
  useEffect(() => {
    axios
      .get(getNamesOfStudentsRoute)
      .then((res) => {
        setData(res?.data?.result);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // On Submit
  const SubmitHandler = async (e) => {
    e.preventDefault();
 
    try {
      setLoader(true)
      const response = await axios.post(createApplicationRoute, formData);
      console.log(response)
      if (response?.status === 200) {
        toast.success(response?.data?.msg);
        cb();
        setModal(false);
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg || "Something Went Wrong");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-auto bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white max-h-screen overflow-y-scroll  mt-60  md:mt-0 md:w-3/4 rounded-lg p-5  md:p-10 md:px-14 m-5">
        <h1 className="font-bold text-center text-xl text-primary_colors">
          Register New Application
        </h1>
        <IoClose
          onClick={() => setModal(false)}
          className="absolute right-3 top-3 rounded bg-primary_colors text-white cursor-pointer"
        />
        <div className="flex flex-col w-full h-full overflow-y-scroll mt-6">
          <form
            onSubmit={SubmitHandler}
            action=""
            className="space-y-3 text-sm text-gray-600"
          >
            <div className="w-full flex flex-col md:flex-row gap-3">
              <select
                name="studentId"
                id=""
                className="w-full border rounded p-2 focus:outline-none capitalize"
                required
                onChange={ChangeHandler}
              >
                <option value="">Choose The Student</option>
                {data?.map((items, i) => (
                  <option className="capitalize" key={i} value={items?._id}>
                    {items?.name}
                  </option>
                ))}
              </select>

              <select
                name="country"
                id=""
                className="w-full border rounded p-2 focus:outline-none capitalize"
                required
                onChange={ChangeHandler}
              >
                <option value="">Choose The Country</option>
                {countries?.map((items, i) => (
                  <option className="capitalize" key={i} value={items?.name}>
                    {items?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full gap-3 max-h-[50vh] overflow-y-scroll">
              {/* Dynamic university inputs */}

              {dynamicUniInputs?.map((input, index) => (
                <div key={index} className="w-full flex flex-col gap-3 pb-3">
                  <div className="w-full flex flex-col md:flex-row gap-3 ">
                    <input
                      type="text"
                      placeholder="University*"
                      name="university"
                      className="w-full p-2 border rounded focus:outline-none"
                      required
                      value={input.university}
                      onChange={(e) => handleDynamicUniChange(index, e)}
                    />

                    <select
                      name="partnership"
                      id=""
                      className="w-full border rounded p-2 focus:outline-none"
                      required
                      value={input.partnership}
                      onChange={(e) => handleDynamicUniChange(index, e)}
                    >
                      <option value="">Choose The Type</option>
                      <option value="partnered">Partnered</option>
                      <option value="non-partnered">Non-partnered</option>
                    </select>

                    <input
                      type="text"
                      name="program"
                      placeholder="Program*"
                      className="w-full p-2 border rounded focus:outline-none"
                      required
                      value={input.program}
                      onChange={(e) => handleDynamicUniChange(index, e)}
                    />

                    <div className="w-full flex flex-col md:flex-row gap-3">
                      <select
                        name="intake"
                        id=""
                        className="w-full border rounded p-2 focus:outline-none"
                        required
                        value={input.intake}
                        onChange={(e) => handleDynamicUniChange(index, e)}
                      >
                        <option value="">Intake</option>
                        {Intake.map((items, i) => (
                          <option key={i} value={items?.name}>
                            {items?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Through"
                      name="through"
                      className="w-full p-2 border rounded focus:outline-none"
                      value={input.through}
                      onChange={(e) => handleDynamicUniChange(index, e)}
                    />

                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUniInput(input, index)}
                        className="bg-red-600 px-3 text-xs text-white rounded p-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Button to add new university inputs */}
              <button
                type="button"
                onClick={handleAddUniInput}
                className="bg-primary_colors px-5 text-white rounded p-2 my-3"
              >
                Add
              </button>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-3">
              <select
                name=""
                id=""
                className="w-full border rounded p-2 focus:outline-none"
                onChange={employeeCataChange}
                required
              >
                <option value="">Select Category</option>
                {EmployeeCards.map((items, i) => (
                  <option key={i} value={items?.path}>
                    {items?.name}
                  </option>
                ))}
              </select>

              <select
                name="assignee"
                id=""
                className="w-full border rounded p-2 focus:outline-none"
                required
                onChange={ChangeHandler}
              >
                <option value="">Select Assignee</option>
                {employee?.length > 0 ? (
                  employee.map((items, i) => (
                    <option key={i} value={items?._id}>
                      {items?.name}
                    </option>
                  ))
                ) : (
                  <option>No Available Data</option>
                )}
              </select>
            </div>

            {/* BUTTON */}
            <div className="text-white text-normal space-x-3 flex items-center justify-end ">
              <button
                type="submit"
                className="bg-primary_colors p-2 px-5 rounded hover:scale-105 ease-in-out duration-200 mt-3"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {loader && <ReqLoader />}
    </div>
  );
};

export default AddModal;
