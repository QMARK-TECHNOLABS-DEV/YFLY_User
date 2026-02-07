import React, { useState, useEffect } from "react";
import DateFormat from "../../utils/DateFormat";

import { useNavigate } from "react-router-dom";
import LoadingData from "../loading/LoadingData";
import { MdDeleteOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { deleteApplicationRoute } from "../../utils/Endpoint";
import DeleteApplication from "../modals/DeleteApplication";
import { FaRegEdit } from "react-icons/fa";
import PhaseChanger from "../modals/PhaseChanger";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  changePhaseOfApplication,
  updateTutionFeeRoute,
} from "../../utils/Endpoint";
import { toast } from "react-toastify";

const CommonTable = ({ data, page, entries, getData }) => {
  const user = useSelector((state) => state.auth.userInfo);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [application, setApplication] = useState({});
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [openOfferDropdown, setOpenOfferDropdown] = useState(null);
  const [updatingOfferId, setUpdatingOfferId] = useState(null);
  const [openTutionDropdown, setOpenTutionDropdown] = useState(null);
  const [updatingTutionId, setUpdatingTutionId] = useState(null);

  // DEBUG: inspect sample row to ensure deadline is present
  useEffect(() => {
    if (data && data.length) {
      console.log("[CommonTable] sample row:", data[0]);
    }
  }, [data]);

  // Close open dropdowns when clicking outside a specific dropdown (offer / tution)
  useEffect(() => {
    const handleDocClick = (e) => {
      const target = e.target;
      const clickedOffer = target.closest && target.closest(".offer-wrapper");
      const clickedTution = target.closest && target.closest(".tution-wrapper");

      if (!clickedOffer && openOfferDropdown !== null)
        setOpenOfferDropdown(null);
      if (!clickedTution && openTutionDropdown !== null)
        setOpenTutionDropdown(null);
    };

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [openOfferDropdown, openTutionDropdown]);

  // Format phase label to Title Case
  const formatPhaseLabel = (p) => {
    if (!p) return "";
    return p
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleDelete = (data) => {
    // console.log("applictn Data", data)
    setApplication(data);
    setDeleteModal(true);
  };

  const handleEdit = (data) => {
    setApplication(data);
    setEditModal(true);
  };

  const handleOfferChange = async (appId, newPhase) => {
    setUpdatingOfferId(appId);
    try {
      await axios.put(`${changePhaseOfApplication}/${appId}`, {
        phase: newPhase,
      });
      toast.success("Phase updated");
      getData();
    } catch (err) {
      console.error("Failed to update phase", err);
      toast.error(err?.response?.data?.msg || "Failed to update phase");
    } finally {
      setUpdatingOfferId(null);
      setOpenOfferDropdown(null);
    }
  };

  const handleTutionChange = async (appId, value) => {
    setUpdatingTutionId(appId);
    try {
      await axios.put(`${updateTutionFeeRoute}/${appId}`, { tutionFee: value });
      toast.success("Tution fee updated");
      getData();
    } catch (err) {
      console.error("Failed to update tution fee", err);
      toast.error(err?.response?.data?.msg || "Failed to update tution fee");
    } finally {
      setUpdatingTutionId(null);
      setOpenTutionDropdown(null);
    }
  };

  return (
    <div className="relative md:min-h-screen shadow-md md:rounded-lg overflow-x-scroll md:overflow-hidden mb-3 w-full">
      <table className="w-full  text-sm text-left ">
        <thead className="text-xs text-white uppercase bg ">
          <tr className="bg-primary_colors border-b  ">
            <th scope="row" className="px-6 py-4 font-bold">
              No.
            </th>
            <th className="px-6 py-4">Date Created</th>
            <th className="px-6 py-4">Student Name</th>
            <th className="px-6 py-4">Offer Letter</th>
            <th className="px-6 py-4">Tution Fee</th>
            <th className="px-6 py-4">Assignee</th>
            <th className="px-6 py-4">Actions</th>
            <th className="px-6 py-4">View</th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data?.map((items, i) => (
              <tr
                key={items?._id}
                className="bg-white border-b  hover:bg-gray-50 text-black cursor-pointer capitalize"
              >
                <td className="px-6 py-4">{(page - 1) * entries + i + 1}</td>
                <td className="px-6 py-4">
                  {DateFormat(items?.createdAt ? items?.createdAt : "NIL")}
                </td>
                <td className="px-6 py-4">
                  {items?.studentName ? items?.studentName : "NIL"}
                </td>

                <td className="px-6 py-4">
                  <div className="relative inline-block offer-wrapper">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenOfferDropdown(
                          openOfferDropdown === items?._id ? null : items?._id
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        items?.phase === "offer letter received"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {items?.phase === "offer letter received"
                        ? "Received"
                        : "Not Received"}
                    </button>

                    {openOfferDropdown === items?._id && (
                      <div className="absolute z-50 mt-2 bg-white border rounded shadow p-2">
                        {items?.phase === "offer letter received" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferChange(items?._id, "pending");
                            }}
                            className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                          >
                            Not Received
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferChange(
                                items?._id,
                                "offer letter received"
                              );
                            }}
                            className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                          >
                            Received
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {updatingOfferId === items?._id && (
                    <span className="text-xs text-gray-500 ml-2">
                      Updating...
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {/* Tution Fee */}
                  <div className="relative inline-block tution-wrapper">
                    {items?.tutionFee === true ||
                    items?.tutionFee === "yes" ||
                    items?.tutionFee === "Yes" ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTutionDropdown(
                              openTutionDropdown === items?._id
                                ? null
                                : items?._id
                            );
                          }}
                          className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800"
                        >
                          Paid
                        </button>

                        {openTutionDropdown === items?._id && (
                          <div className="absolute z-50 mt-2 bg-white border rounded shadow p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTutionChange(items?._id, false);
                              }}
                              className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                            >
                              Not Paid
                            </button>
                          </div>
                        )}
                      </>
                    ) : items?.tutionFee === false ||
                      items?.tutionFee === "no" ||
                      items?.tutionFee === "No" ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTutionDropdown(
                              openTutionDropdown === items?._id
                                ? null
                                : items?._id
                            );
                          }}
                          className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800"
                        >
                          Not Paid
                        </button>

                        {openTutionDropdown === items?._id && (
                          <div className="absolute z-50 mt-2 bg-white border rounded shadow p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTutionChange(items?._id, true);
                              }}
                              className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                            >
                              Paid
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTutionDropdown(
                              openTutionDropdown === items?._id
                                ? null
                                : items?._id
                            );
                          }}
                          className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800"
                        >
                          Not set
                        </button>

                        {openTutionDropdown === items?._id && (
                          <div className="absolute z-50 mt-2 bg-white border rounded shadow p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTutionChange(items?._id, true);
                              }}
                              className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                            >
                              Paid
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTutionChange(items?._id, false);
                              }}
                              className="block px-3 py-1 text-left text-sm hover:bg-gray-100"
                            >
                              Not Paid
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {updatingTutionId === items?._id && (
                    <span className="text-xs text-gray-500 ml-2">
                      Updating...
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {/* {items?.assignee ? items?.assigneeName : "NIL"} */}
                  {items?.assigneeNames?.length > 0
                    ? items?.assigneeNames?.length > 1
                      ? items?.assigneeNames[0] + " +more"
                      : items?.assigneeNames[0]
                    : "NIL"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-start gap-3">
                    {/* <FaRegEdit
                      onClick={() => handleEdit(items)}
                      size={20}
                      className="cursor-pointer text-blue-600 hover:text-blue-800 hover:scale-110 transition-all ease-in-out duration-300"
                    /> */}
                    <MdDeleteOutline
                      onClick={() => handleDelete(items)}
                      size={20}
                      className="cursor-pointer mx-3 text-red-600 hover:text-red-800 hover:scale-110 transition-all ease-in-out duration-300"
                    />
                  </div>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      navigate(`/applications/stepper/${items?._id}`)
                    }
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <div className="w-full top-40 absolute items-center justify-center">
              <LoadingData />
            </div>
          )}
        </tbody>
      </table>

      {editModal && (
        <PhaseChanger
          data={application}
          setData={setApplication}
          getTableData={getData}
          setModal={setEditModal}
        />
      )}

      {deleteModal && (
        <DeleteApplication
          setModal={setDeleteModal}
          data={application}
          setData={setApplication}
          getTableData={getData}
          route={deleteApplicationRoute}
        />
      )}
    </div>
  );
};

export default CommonTable;
