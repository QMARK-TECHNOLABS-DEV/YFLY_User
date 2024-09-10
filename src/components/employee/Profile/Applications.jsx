import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Applications = ({ data }) => {
  const user = useSelector((state) => state?.auth?.userInfo);

  return (
    <>
      {user?.role === "admin" && (
        <h1 className="mt-10 mb-5 text-xl font-bold text-primary_colors">
          Applications
        </h1>
      )}

      {data?.map((work, i) => (
        <div
          key={i}
          // bg-gradient-to-r from-[#52C3FF] to-[#D0EAFF]
          className="bg-white p-5 flex flex-wrap w-full md:w-[450px] justify-around rounded-xl shadow-xl relative text-black hover:scale-105 ease-in-out duration-300 mb-4"
        >
          <img
            src={require("../../../assets/icon/application_ban.png")}
            alt="ban"
            className="w-10 absolute -top-2 right-3 object-contain"
          />

          {/* Application Details */}
          <div className="p-5 flex flex-col w-full capitalize border rounded border-primary_colors/30">
            {/* <h1 className="font-semibold text-primary_colors mb-2 text-sm">
              ID:{" "}
              <span className="font-thin ps-2">{work?.applicationId}</span>
            </h1> */}
            <h1 className="font-semibold text-sm">
              Student Name :{" "}
              <span className="font-thin ps-2">{work?.studentName}</span>
            </h1>
            <h1 className="font-semibold text-sm">
              Country : <span className="font-thin ps-2">{work?.country}</span>
            </h1>
            <h1 className="font-semibold text-sm">
              Program : <span className="font-thin ps-2">{work?.program}</span>
            </h1>
            <h1 className="font-semibold text-sm">
              University :{" "}
              <span className="font-thin ps-2">{work?.university}</span>
            </h1>
            <h1 className="font-semibold text-sm">
              Step :{" "}
              <span className="font-thin ps-2">{work?.step?.name ?? 'NA'}</span>
            </h1>
          </div>

          {/* Button part */}
          <div className="py-3 w-full flex flex-col md:flex-row gap-3">
            {user?.role === "admin" ? (
              <Link to={`/applications/${work?.applicationId}/${work?.stepperId}`}>
                <button className="p-2 px-10 h-10 text-white rounded bg-primary_colors w-full hover:scale-105 ease-in-out duration-200">
                  View
                </button>
              </Link>
            ) : (
              <Link to={`/employee/application/${work?.applicationId}/${work?.stepperId}`}>
                <button className="p-2 px-10 h-10 text-sm text-white rounded bg-primary_colors w-full hover:scale-105 ease-in-out duration-200">
                  View
                </button>
              </Link>
            )}
            <div
              className={`p-2 px-10 h-10 text-sm rounded ${
                work?.stepStatus === "completed"
                  ? " text-green-800 border border-green-800"
                  : "text-[#E87D00] border border-[#E87D00]"
              } capitalize w-full text-center`}
            >
              {work?.stepStatus}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Applications;
