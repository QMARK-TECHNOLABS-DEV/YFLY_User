import React, { useEffect, useState } from "react";
import Carousel from "../../components/student/Carousel";
import StudentStepper from "../../components/student/StudentStepper";
import DateFormat from "../../utils/DateFormat";
import DocModal from "../../components/student/DocModal";

import { Banner } from "../../data/Banner";
import { useSelector } from "react-redux";
import { getAnApplicationRoute, getMyApplicationsRoute } from "../../utils/Endpoint";
import { Link, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const StudentDashboard = () => {
  const axios = useAxiosPrivate();

  const navigate = useNavigate()
  const [state, setState] = useState([]);
  const [docModal, setDocModal] = useState(false);
  const user = useSelector((state) => state.auth.userInfo);

  const [currStepper, setCurrStepper] = useState(null);

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

        {
          state?.length
            ?
            <h1 className="text-[#0061B2] font-bold text-xl mt-10">
              Select an Application
            </h1>
            :
            <div className=" flex items-center justify-center mt-8 shadow-lg rounded-lg border border-primary_colors ">
              <p className="py-4 text-center">No Applications Available</p>
            </div>
        }

        <div className="w-full mt-5 flex gap-5 flex-wrap">
          {
            state?.map((data, i) => (
              <div
                key={i}
                onClick={() => navigate(`/student/application/${data._id}`)}
                className="flex flex-col p-5 bg-white rounded-lg shadow-xl w-full md:w-[210px] cursor-pointer"
              >
                <h1 className="text-primary_colors">Application <span className="text-black">{i + 1}</span> </h1>
                <h1 className="text-primary_colors">Country: <span className="text-black">{data?.country}</span> </h1>


              </div>
            ))
          }


        </div>
      </div>

    </>
  );
};

export default StudentDashboard;
