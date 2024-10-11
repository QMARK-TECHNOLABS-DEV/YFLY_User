import React, { useEffect, useState } from "react";
import { getAssignedWorksRoute } from "../../utils/Endpoint";
import { useSelector } from "react-redux";

import Applications from "../../components/employee/Profile/Applications";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AssignedWork = () => {
  const instance = useAxiosPrivate();

  const [works, setWorks] = useState([]);
  const userData = useSelector((state) => state.auth.userInfo);

  const statuses = ['completed', 'pending', 'ongoing'];
  const [status, setStatus] = useState("all")

  const getAssignedWorks = async () => {
    await instance
      .get(`${getAssignedWorksRoute}/${userData?._id}?status=${status}`)
      .then((res) => {
        setWorks(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    window.scroll(0, 0)
    getAssignedWorks();
  }, [status]);

  return (
    <div className="w-full min-h-screen text-black mt-[5vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-primary_colors text-2xl font-bold capitalize">{status} Tasks</h1>

        <select
          onChange={(e)=> setStatus(e.target.value)}
          name='status'
          id=""
          className="w-fit border border-primary_colors p-2  rounded-lg 
            text-secondary text-normal focus:outline-none capitalize"
        >
          <option value="all">Select Status</option>
          {statuses?.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>

      </div>
      {
        works?.length > 0
          ?
          <div className="mt-5 w-full flex flex-wrap gap-4">
            <Applications data={works} />
          </div>
          :
          <p className="text-center text-[#777] mt-9">No Tasks Available</p>
      }
    </div>
  );
};

export default AssignedWork;
