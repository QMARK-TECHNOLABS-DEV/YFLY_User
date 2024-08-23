import React, { useEffect, useState } from "react";
import { Address, Office } from "../../data/Dashboard";
import { IoClose } from "react-icons/io5";

import Input from "../formField/Input";

import { getEmployeesRoute, updateStudentRoute } from "../../utils/Endpoint";
import { toast } from "react-toastify";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const EditStudent = ({ entityData, setData, getTableData, setModal }) => {
  const axios = useAxiosPrivate();

  const [loader, setLoader] = useState(false);
  const [stdFormData, setStdFormData] = useState(entityData);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    if (["houseName", "city", "state", "pin"].includes(name)) {
      setStdFormData((prevFormData) => ({
        ...prevFormData,
        address: {
          ...prevFormData.address,
          [name]: value,
        },
      }));
    } else {
      setStdFormData({
        ...stdFormData,
        [name]: value,
      });
    }
  };

  // Submit Handler
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!(stdFormData?.name || stdFormData?.email)) return;

    try {
      setLoader(true)
      await axios
        .put(`${updateStudentRoute}/${entityData._id}`, stdFormData)
        .then((res) => {
          setModal(false);
          toast.success(res?.data?.msg);
          setData({});
          getTableData();
        })
        .catch((error) => {
          console.log(error);
          toast.error(error?.response?.data?.msg);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false)
    }
  };

  const [employeeData, setEmployeeData] = useState([]);

  const getEmployeeData = async () => {
    try {
      const result = await axios.get(`${getEmployeesRoute}?department=counselling`);
      if (result.status === 200) {
        setEmployeeData(result?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, []);

  console.log("efd", stdFormData);
  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-auto bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white mt-60  md:mt-0 md:w-1/2 rounded-lg p-5  md:p-10 md:px-14 m-5">
        <h1 className="font-bold text-center text-xl text-primary_colors">
          Update Student
        </h1>
        <IoClose
          onClick={() => setModal(false)}
          className="absolute right-3 top-3 rounded bg-primary_colors text-white cursor-pointer"
        />
        <div className="flex flex-col w-full mt-5">
          <form action="" onSubmit={submitHandler}>
            <div className="w-full flex flex-wrap">
              <>
                {
                  <>
                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="name"
                        type="text"
                        changeHandler={changeHandler}
                        value={stdFormData?.name}
                        placeholder="Name"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="email"
                        type="email"
                        changeHandler={changeHandler}
                        value={stdFormData?.email}
                        placeholder="Email"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="phone"
                        type="text"
                        changeHandler={changeHandler}
                        value={stdFormData?.phone}
                        placeholder="Phone"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="password"
                        type="text"
                        changeHandler={changeHandler}
                        placeholder="New Password"
                      />
                    </div>

                    {/* <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="qualification"
                        type="text"
                        changeHandler={changeHandler}
                        value={stdFormData?.qualification}
                        placeholder="Qualification"
                      />
                    </div> */}

                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="birthDate"
                        type="date"
                        changeHandler={changeHandler}
                        value={stdFormData?.birthDate?.split("T")[0]}
                        placeholder="Birth Date"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-1 py-2">
                      <Input
                        name="enquiryRoute"
                        type="text"
                        changeHandler={changeHandler}
                        value={stdFormData?.enquiryRoute}
                        placeholder="Enquiry route"
                      />
                    </div>

                    <div className="w-full md:w-1/2 p-1 py-2">
                      <select
                        value={stdFormData?.office}
                        className={`border border-primary_colors/50 text-gray-400 text-xs p-3 focus:outline-none w-full rounded-lg`}
                        name="office"
                        id=""
                        onChange={changeHandler}
                      >
                        <option className="" value="">
                          Select A office
                        </option>
                        {Office.map((items, index) => (
                          <option key={index} className="" value={items?.name}>
                            {items?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-1/2 p-1 py-2">
                      <select
                        value={stdFormData?.assigneeId}
                        className={`border border-primary_colors/50 text-gray-400 text-xs p-3 focus:outline-none w-full rounded-lg`}
                        name="assigneeId"
                        id=""
                        onChange={changeHandler}
                      >
                        <option className="" value="">
                          Select a Counsellor
                        </option>
                        { employeeData.map((items, index) => (
                          <option key={index} className="" value={items?._id}>
                            {items?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                  </>
                }

                {Address.map((data) => (
                  <div key={data?.id} className="w-full md:w-1/2 p-1 py-2">
                    <Input
                      name={data?.name}
                      placeholder={data?.placeholder}
                      type={data?.type}
                      changeHandler={changeHandler}
                      value={stdFormData?.address?.[data?.name]}
                    />
                  </div>
                ))}
              </>
            </div>

            {/* BUTTON */}
            <div className="text-white text-normal space-x-3 flex items-center justify-end mt-10">
              <button
                type="submit"
                className="bg-primary_colors p-2 px-5 rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                Submit
              </button>
              {/* )} */}
            </div>
          </form>
        </div>
      </div>
      {loader && <ReqLoader />}
    </div>
  );
};

export default EditStudent;
