import React, { useEffect, useState } from "react";
import LoadingData from "../loading/LoadingData";
import DeleteModal from "../modals/DeleteModal";
import { deactivateStudentRoute } from "../../utils/Endpoint";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import EditStudent from "../modals/EditStudent";
import { useSelector } from "react-redux";

const StudentTable = ({ data , getData , page , entries}) => {
  const [student, setStudent] = useState({})
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const user = useSelector((state) => state.auth.userInfo);


  useEffect(()=>{
    window.scrollTo(0,0)
  })

  const handleDelete = (data)=>{
    console.log("studeentData",data)
    setStudent(data)
    setDeleteModal(true)
  }

  const handleEdit = (data)=>{
    setStudent(data)
    setEditModal(true)
  }

  return (
    <div className="relative w-full shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-primary_colors to-blue-600 text-white">
              <th className="px-6 py-4 font-bold">No.</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
              <th className="px-6 py-4 font-semibold">Counsellor</th>
              <th className="px-6 py-4 font-semibold">Enquiry Route</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length > 0 ? (
              data?.map((items, i) => (
                <tr
                  key={items?._id}
                  className="bg-white border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {((page - 1) * entries) + i + 1}
                  </td>
                  <td className="px-6 py-4 capitalize font-medium text-gray-800">
                    {items?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {items?.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {items?.phone || "—"}
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-700">
                    {items?.assigneeName || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {items?.enquiryRoute || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(items)}
                        className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all"
                        title="Edit Student"
                      >
                        <FaRegEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(items)}
                        className="text-red-600 hover:text-red-800 hover:scale-110 transition-all"
                        title="Delete Student"
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12">
                  <LoadingData />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editModal && <EditStudent entityData={student} setData={setStudent} getTableData={getData}  setModal={setEditModal}  />}

      {deleteModal && <DeleteModal setModal={setDeleteModal} data={student} setData={setStudent} getTableData={getData} route={deactivateStudentRoute} />}
      

    </div>
  );
};

export default StudentTable;
