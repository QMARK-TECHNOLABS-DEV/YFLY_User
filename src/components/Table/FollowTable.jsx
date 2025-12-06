import React, { useEffect, useState } from "react";
import EmptyData from "../loading/EmptyData";
import SingleFollow from "../SingleFollow";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getFollowUp, getStages, selectEmployee } from "../../utils/Endpoint";
import { useSelector } from "react-redux";
import { MdOutlineOpenInNew } from "react-icons/md";

const FollowTable = ({ data, setData, page, entries, getData }) => {
  const [followupModal, setFollowupModal] = useState(false);
  const [studentData, setStudentData] = useState({});
  const [employeeData, setEmployeeData] = useState([]);
  const adminDefinedData = useSelector((state) => state.data.adminDefinedData);
  const stagesData = adminDefinedData?.find((item) => item.name === "stage");
  const comMethods = adminDefinedData?.find(
    (item) => item.name === "followup method"
  );

  const axiosPrivate = useAxiosPrivate();

  // Get color and styling for status tags
  const getStatusStyles = (status) => {
    const statusStyles = {
      Lead: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
        badge: "bg-blue-500",
      },
      Hot: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        badge: "bg-red-500",
      },
      Warm: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-300",
        badge: "bg-orange-500",
      },
    };
    return statusStyles[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      badge: "bg-gray-500",
    };
  };

  // getting the Employee data
  const getEmployeeData = async () => {
    try {
      const result = await axiosPrivate.get(selectEmployee);
      if (result.status === 200) {
        setEmployeeData(result?.data?.employee);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, []);

  const openModal = (student) => {
    setStudentData(student);
    setFollowupModal(true);
  };

  return (
    <>
      <div className="relative md:h-full w-full shadow-md md:rounded-lg overflow-x-scroll md:overflow-hidden mb-3">
        <table className="w-full  text-sm text-left ">
          <thead className="text-xs text-white capitalize bg ">
            <tr className="bg-primary_colors border-b ">
              <th scope="row" className="pl-4 py-4 font-bold  text-white">
                No.
              </th>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Email</th>
              <th className="px-2 py-4">Phone</th>
              <th className="px-2 py-4">Assignee</th>
              <th className="px-2 py-4">Stage</th>
              <th className="px-2 py-4">Status</th>
              {/* <th className="px-2 py-4">followup method</th> */}
              <th className="px-2 py-4">View</th>
            </tr>
          </thead>
          <tbody>
            {data?.length > 0 ? (
              data?.map((item, i) => (
                <tr
                  key={i}
                  className="bg-white border-b  hover:bg-gray-50 text-black  text-xs"
                >
                  <td className="pl-4 py-4 ">{(page - 1) * entries + i + 1}</td>
                  <td className="px-2 py-4 capitalize">
                    {item?.name ? item?.name : "NIL"}
                  </td>
                  <td className="px-2 py-4">
                    {item?.email ? item?.email : "NIL"}
                  </td>
                  <td className="px-2 py-4">
                    {item?.phone ? item?.phone : "NIL"}
                  </td>

                  {/* Employee Assignee */}
                  <td className="px-2 py-4 capitalize">
                    {item?.assigneeName ?? "NIL"}
                  </td>

                  {/* Stages */}
                  <td className="px-2 py-4 capitalize">
                    {item?.stageName ?? "NIL"}
                  </td>

                  {/* Status Tag */}
                  <td className="px-2 py-4">
                    {item?.status ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          getStatusStyles(item.status).bg
                        } ${getStatusStyles(item.status).text} ${
                          getStatusStyles(item.status).border
                        } border`}
                      >
                        {item?.status}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not Set</span>
                    )}
                  </td>

                  {/* View Button */}
                  <td className="px-2 py-4">
                    {/* <button
                      onClick={() => openModal(item)}
                      className="bg-primary_colors p-2 px-4 text-white text-xs rounded">
                      View
                    </button> */}

                    <MdOutlineOpenInNew
                      onClick={() => openModal(item)}
                      size={22}
                      className="text-primary_colors cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-white border-b  hover:bg-gray-50 text-black cursor-pointer">
                <div className="w-full h-full absolute justify-center">
                  <EmptyData data={"No Available Data "} />
                </div>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {followupModal && (
        <SingleFollow
          setModal={setFollowupModal}
          getData={getData}
          studentData={studentData}
          employeeData={employeeData}
          stagesData={stagesData}
          comMethods={comMethods}
        />
      )}
    </>
  );
};

export default FollowTable;
