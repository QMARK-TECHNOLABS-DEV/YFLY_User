import React, { useEffect, useState } from "react";
import Carousel from "../../components/student/Carousel";
import StudentStepper from "../../components/student/StudentStepper";
import DateFormat from "../../utils/DateFormat";
import DocModal from "../../components/student/DocModal";

import { Banner } from "../../data/Banner";
import { useSelector, useDispatch } from "react-redux";
import {
  getAnApplicationRoute,
  getMyApplicationsRoute,
  notifyRoute,
  notifyStudentRoute,
} from "../../utils/Endpoint";
import { Link, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { MdNotificationsActive } from "react-icons/md";
import { setNotifications } from "../../redux/slices/NotifyReducer";

// Reminder box for students: shows upcoming test/exam notifications (within 72 hours)
const ReminderBox = ({ studentId }) => {
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
      const dateTimeStr = `${date}T${time}:00`;
      const eventDate = new Date(dateTimeStr);
      const diff = eventDate.getTime() - now.getTime();
      const related = n?.relatedStudents || meta?.relatedStudents || [];
      const relatedIds = (related || []).map((s) => String(s?.id || s?._id));
      const isForStudent =
        String(n?.userId) === String(studentId) ||
        relatedIds.includes(String(studentId));
      return {
        ...n,
        eventDate,
        diff,
        relatedStudents: related,
        isForStudent,
      };
    })
    .filter(
      (r) =>
        r &&
        r.isForStudent &&
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

const StudentDashboard = () => {
  const axios = useAxiosPrivate();

  const navigate = useNavigate();
  const [state, setState] = useState([]);
  const [docModal, setDocModal] = useState(false);
  const user = useSelector((state) => state.auth.userInfo);

  const [currStepper, setCurrStepper] = useState(null);
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notify.notifications || []
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;
      try {
        // Use student notification route mounted under /api/student
        const res = await axios.get(`${notifyStudentRoute}/all/${user._id}`);
        const notifs = res?.data?.notification || [];
        dispatch(setNotifications(notifs));
      } catch (error) {
        console.log("Failed to fetch student notifications:", error);
      }
    };

    // Fetch notifications for the student
    fetchNotifications();
  }, [user?._id]);

  useEffect(() => {
    window.scroll(0, 0);
    axios
      .get(`${getMyApplicationsRoute}/${user?._id}`)
      .then((res) => {
        setState(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [docModal, user?.applicationId]);

  const fnToCallGetFn = () => {
    console.log("Doc upload");
  };

  console.log(state);
  return (
    <>
      <div className=" w-full mb-20">
        <Carousel banner={Banner} />

        {state?.length ? (
          <h1 className="text-[#0061B2] font-bold text-xl mt-10">
            Select an Application
          </h1>
        ) : (
          <div className=" flex items-center justify-center mt-8 shadow-lg rounded-lg border border-primary_colors ">
            <p className="py-4 text-center">No Applications Available</p>
          </div>
        )}

        <div className="w-full mt-5 flex gap-5 flex-wrap">
          {state?.map((data, i) => (
            <div
              key={i}
              onClick={() => navigate(`/student/application/${data._id}`)}
              className="flex flex-col p-5 bg-white rounded-lg shadow-xl w-full md:w-[210px] cursor-pointer"
            >
              <h1 className="text-primary_colors">
                Application <span className="text-black">{i + 1}</span>{" "}
              </h1>
              <h1 className="text-primary_colors">
                Country: <span className="text-black">{data?.country}</span>{" "}
              </h1>
            </div>
          ))}
        </div>

        {/* Important Reminders at bottom (for this student) */}
        <div className="mt-8">
          <ReminderBox studentId={user?._id} />
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
