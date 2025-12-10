import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { deleteStepper } from "../../utils/Endpoint";


const ApplicationCard = ({ data, getData }) => {
  // console.log(data);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false)
  // const [stepper, setStepper] = useState({})

  const instance = useAxiosPrivate();

  const [loader, setLoader] = useState(false);

  const CancelModal = () => {
    setDeleteModal(false);
  };

  const ConfirmDeletion = async () => {
    try {
      setLoader(true);
      await instance
        .delete(`${deleteStepper}/${data?._id}`)
        .then((res) => {
          toast.success(res?.data?.msg);
          getData();
          CancelModal();
        })
        .catch((error) => {
          console.log(error);
          toast.error(error?.response?.data?.msg);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation()
    setDeleteModal(true)
  }

  // Calculate deadline status
  const getDeadlineStatus = () => {
    // You can add deadline logic here if deadline field exists
    // For now, we'll show a general deadline indicator
    return "Active";
  };

  // Format date if available
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
    <div
      onClick={(e) =>
        navigate(`/applications/${data.applicationId}/${data._id}`)
      }
      className="relative p-5 bg-white rounded-lg shadow-md hover:shadow-lg w-full md:w-[320px] capitalize hover:scale-102 ease-in-out duration-200 cursor-pointer border-l-4 border-primary_colors overflow-hidden"
    >
      {/* Top Bar - Delete and Status */}
      <div className="flex items-center justify-between mb-4">
        <MdDeleteOutline
          onClick={handleDelete}
          size={20}
          className="cursor-pointer text-red-600 hover:text-red-800 hover:scale-110 transition-all"
        />
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
          ACTIVE
        </span>
      </div>

      {/* University */}
      <div className="mb-3">
        <h1 className="font-bold text-sm text-primary_colors truncate">{data?.university}</h1>
      </div>

      {/* Program & Intake */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-gray-600 font-semibold mb-1">Program</p>
          <p className="text-gray-800 font-medium line-clamp-2">{data?.program}</p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold mb-1">Intake</p>
          <p className="text-gray-800 font-medium">{data?.intake}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="pt-3 border-t border-gray-200">
        <span
          className={`inline-block font-bold capitalize px-2 py-1 rounded text-xs ${
            data?.phase === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : data?.phase === "ongoing"
              ? "bg-blue-100 text-blue-700"
              : data?.phase === "completed"
              ? "bg-green-100 text-green-700"
              : data?.phase === "cancelled"
              ? "bg-red-100 text-red-700"
              : data?.phase === "deferred"
              ? "bg-orange-100 text-orange-700"
              : data?.phase === "not-enrolled"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {data?.phase || "NIL"}
        </span>
      </div>
    </div>
      {
        deleteModal
        &&
        <div className="fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white mt-60  md:mt-0 rounded-lg p-5 md:p-10 m-5 flex flex-col gap-7">
            <h1 className="font-bold text-center capitalize text-xl text-primary_colors">
              Do you want to delete ?
            </h1>
            <IoClose
              onClick={CancelModal}
              className="absolute right-3 top-3 rounded bg-primary_colors text-white cursor-pointer bg-primary"
            />
            <div className="w-full flex justify-evenly gap-3">
              <button
                onClick={CancelModal}
                className="p-2 px-5 rounded text-sm text-white bg-primary_colors w-full"
              >
                Cancel
              </button>

              <button
                onClick={ConfirmDeletion}
                className="p-2 px-5 rounded text-sm text-white bg-red-500 w-full"
              >
                Confirm
              </button>
            </div>
          </div>
          {loader && <ReqLoader />}
        </div>
  }
    </>

  );
};

export default ApplicationCard;
