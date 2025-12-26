import React, { useEffect, useState } from "react";
import {
  dashData,
  getEmployeesRoute,
  getNamesOfStudentsRoute,
} from "../../utils/Endpoint";
import { FaUserGraduate } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { Link } from "react-router-dom";

import Filter from "../../components/dashboard/Filter";
import RegistrationForm from "../../components/dashboard/RegistrationForm";
import Cards from "../../components/dashboard/Cards";
import StudentLoader from "../../components/loading/StudentLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import TestExamNotificationModal from "../../components/notification/TestExamNotificationModal";

const Dashboard = () => {
  const axios = useAxiosPrivate();

  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [empModal, setEmpModal] = useState(false);
  const [testExamModal, setTestExamModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // @DCS All Card Data
  useEffect(() => {
    setLoading(true);
    axios
      .get(dashData)
      .then((res) => {
        // console.log(res);
        setData(res.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch employees for notification
  useEffect(() => {
    axios
      .get(getEmployeesRoute)
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch students (names) for selection in notifications
  useEffect(() => {
    axios
      .get(getNamesOfStudentsRoute)
      .then((res) => {
        // API returns names list under result in some endpoints
        setStudents(res?.data?.result || res.data || []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  return (
    <>
      <div className="container mx-auto w-full h-full text-black pt-10 pb-28">
        <h1 className="text-primary_colors text-2xl font-bold">Dashboard</h1>
        <h3 className="text-secondary text-[14px]">
          Welcome to Course Finder Portal
        </h3>

        <div className="mt-5 md:mt-10 space-y-7">
          <div>
            <Filter setData={setData} endPoint={dashData} isDashboard={true} />
          </div>
          <div className="">
            {loading ? <StudentLoader /> : <Cards data={data} />}
          </div>
          <div className="w-full flex items-center justify-end gap-2 flex-wrap">
            <button
              onClick={() => setTestExamModal(true)}
              className="p-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 ease-in-out duration-200 transition-all font-semibold"
            >
              📝 Test/Exam Notification
            </button>

            <button
              onClick={() => setEmpModal(true)}
              className="p-2 px-4 text-sm bg-primary_colors text-white rounded-lg hover:scale-105 ease-in-out duration-200"
            >
              Register a New Employee
            </button>

            <button
              onClick={() => setModal(!modal)}
              className="p-2 px-4 text-sm bg-primary_colors text-white rounded-lg hover:scale-105 ease-in-out duration-200"
            >
              Register a New Student
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full mt-5 md:mt-10 gap-5 md:gap-2">
          <div className=" md:w-1/2 ">
            <div className="border-2 border-primary_colors  p-9  rounded hover:shadow-xl cursor-pointer">
              <div className=" ">
                <FaUserGraduate className="text-3xl text-primary_colors" />
              </div>
              <h1 className="text-xl font-semibold text-primary_colors my-2">
                Students
              </h1>
              <div>
                <Link to={"/admin/student"}>
                  <h1 className="hover:underline hover:text-primary_colors">
                    Track Student
                  </h1>
                </Link>
                <Link to={"/admin/applications"}>
                  <h1 className="hover:underline hover:text-primary_colors">
                    Manage Application
                  </h1>
                </Link>
              </div>
            </div>
          </div>
          <div className=" md:w-1/2 ">
            <div className="border-2 border-primary_colors  p-9  rounded hover:shadow-xl cursor-pointer">
              <div className=" ">
                <MdManageAccounts className="text-5xl text-primary_colors" />
              </div>
              <h1 className="text-xl font-semibold text-primary_colors my-3">
                Track Employee
              </h1>
              <div>
                <Link
                  to={"/admin/employee"}
                  className="hover:underline hover:text-primary_colors"
                >
                  <h1 className="flex-wrap">
                    UnderStand the Workflow of all employees.{" "}
                  </h1>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal && <RegistrationForm setModal={setModal} entity="Student" />}
      {empModal && (
        <RegistrationForm setModal={setEmpModal} entity="Employee" />
      )}
      {testExamModal && (
        <TestExamNotificationModal
          setModal={setTestExamModal}
          employees={employees}
          students={students}
        />
      )}
    </>
  );
};

export default Dashboard;
