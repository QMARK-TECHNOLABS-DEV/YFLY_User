import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaUserGraduate } from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  getEmpTaskMetrics,
  getNamesOfStudentsRoute,
} from "../../utils/Endpoint";

import Cards from "../../components/dashboard/Cards";
import StudentLoader from "../../components/loading/StudentLoader";
import RegistrationForm from "../../components/dashboard/RegistrationForm";
import TestExamNotificationModal from "../../components/notification/TestExamNotificationModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

// Reminder box shows upcoming test/exam notifications within next 72 hours
const ReminderBox = () => {
  const notifications = useSelector(
    (state) => state.notify.notifications || []
  );
  const now = new Date();

  const reminders = (notifications || [])
    .filter((n) => n?.notificationType === "test-exam")
    .map((n) => {
      const meta = n?.metadata || {};
      const date = meta?.date;
      const time = meta?.time || "00:00";
      if (!date) return null;
      // build local datetime
      const dateTimeStr = `${date}T${time}:00`;
      const eventDate = new Date(dateTimeStr);
      const diff = eventDate.getTime() - now.getTime();
      const related = n?.relatedStudents || meta?.relatedStudents || [];
      return {
        ...n,
        eventDate,
        diff,
        relatedStudents: related,
      };
    })
    .filter(
      (r) =>
        r &&
        r.eventDate instanceof Date &&
        !isNaN(r.eventDate.getTime()) &&
        r.diff >= 0 &&
        r.diff <= 72 * 3600 * 1000
    )
    .sort((a, b) => a.eventDate - b.eventDate);

  return (
    <div className="border-2 border-primary_colors p-6 rounded hover:shadow-xl bg-white">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-primary_colors mb-2">
        Important Reminders
        <MdNotificationsActive className="text-primary_colors text-lg" />
      </h2>

      {/* Constrain height to show ~4-5 items and allow scrolling for overflow */}
      <div className="max-h-56 overflow-y-auto overflow-x-hidden pr-2 reminder-scroll">
        {reminders.length > 0 ? (
          <ul className="space-y-3">
            {reminders.map((r) => {
              const names =
                (r?.relatedStudents || [])
                  .map((s) => s?.name)
                  .filter(Boolean)
                  .join(", ") || "students";
              const dateStr = r.eventDate.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              });
              return (
                <li key={r._id} className="text-sm text-gray-700">
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-gray-600">
                    Scheduled for {names} on {dateStr}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No upcoming reminders within 72 hours
          </p>
        )}
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const axios = useAxiosPrivate();

  const userData = useSelector((state) => state.auth.userInfo);
  const [dashData, setDashdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [testExamModal, setTestExamModal] = useState(false);
  const [students, setStudents] = useState([]);

  // Fetch students (names) for employee notification selection
  useEffect(() => {
    axios
      .get(getNamesOfStudentsRoute)
      .then((res) => {
        setStudents(res?.data?.result || res.data || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    window.scroll(0, 0);
    setLoading(true);
    axios
      .get(`${getEmpTaskMetrics}/${userData._id}`)
      .then((res) => {
        setDashdata(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {" "}
      <div className="w-full h-full text-black mt-[5vh] pb-28">
        <h1 className="text-primary_colors text-2xl font-bold ">Dashboard</h1>
        <h3 className="text-secondary text-[14px] capitalize">
          <span className="font-bold">{userData?.name}</span> Welcome to the
          dashboard
        </h3>

        <div className="mt-5 md:mt-10 space-y-7">
          <div>{/* <Filter setData={setData} /> */}</div>
          <div className="">
            {loading ? <StudentLoader /> : <Cards data={dashData} />}
          </div>
        </div>
        <div className="flex flex-col md:flex-row w-full mt-8 md:mt-8 gap-5 md:gap-2">
          <div className=" md:w-1/2 ">
            <div className="border-2 border-primary_colors  p-9  rounded hover:shadow-xl cursor-pointer">
              <div className=" ">
                <FaUserGraduate className="text-3xl text-primary_colors" />
              </div>
              <h1 className="text-xl font-semibold text-primary_colors my-2">
                Students
              </h1>
              <div>
                <Link to={"/employee/task"}>
                  <h1 className="hover:underline hover:text-primary_colors">
                    Manage Task
                  </h1>
                </Link>
              </div>
            </div>
          </div>

          <div className=" md:w-1/2 ">
            <div className="flex flex-col justify-center items-center p-9">
              <button
                onClick={() => setModal(!modal)}
                className="me-2 p-2 px-8 text-normal bg-primary_colors text-white rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                Register a New Student
              </button>

              <button
                onClick={() => setTestExamModal(true)}
                className="mt-3 p-2 px-4 text-normal bg-primary_colors text-white rounded-lg hover:scale-105 ease-in-out duration-200"
              >
                📝 Create Exam Notification
              </button>
            </div>
          </div>
        </div>

        {/* Important Reminders: show upcoming test/exam notifications within 72 hours */}
        <div className="mt-8">
          <ReminderBox />
        </div>
      </div>
      {modal && <RegistrationForm setModal={setModal} entity="Student" />}
      {testExamModal && (
        <TestExamNotificationModal
          setModal={setTestExamModal}
          students={students}
          showEmployees={false}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
