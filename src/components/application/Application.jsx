import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnApplicationRoute, getStepper } from "../../utils/Endpoint";

import TrackerVertical from "../stepper/TrackerVertical";
import RightSide from "./tracking/RightSide";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Application = () => {
  const instance = useAxiosPrivate();

  const [loader, setLoader] = useState(false);
  const { id, stepperId } = useParams();
  const [data, setData] = useState({});
  const [application, setApplication] = useState({});
  const [stepper, setStepper] = useState([]);

  const getApplication = async () => {
    try {
      await instance
        .get(`${getAnApplicationRoute}/${id}`)
        .then((res) => {
          setData(res?.data);
          console.log(res?.data);
          setApplication(res?.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const GetStepperData = async () => {
    await instance
      .get(`${getStepper}/${stepperId}`)
      .then((res) => {
        setStepper(res?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    window.scroll(0, 0);
    getApplication();
    GetStepperData();
  }, [id]);

  const fnToCallGetFn = () => {
    getApplication();
    GetStepperData();
  };

  // console.log(application);

  return (
    <div className="container mx-auto w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-32">
      {/* Welcome Card - Enhanced */}
      <div className="bg-gradient-to-r from-primary_colors to-blue-600 p-8 rounded-2xl shadow-lg mb-8">
        <h1 className="text-white text-3xl font-bold mb-6">
          Application of <span className="capitalize text-yellow-300"> {data?.studentName}</span>
        </h1>
        <div className="text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Name</h5>
            <h5 className="text-lg capitalize font-bold">{data?.studentName}</h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Country</h5>
            <h5 className="text-lg capitalize font-bold">{data?.country}</h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Intake</h5>
            <h5 className="text-lg capitalize font-bold">{stepper?.intake}</h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">University</h5>
            <h5 className="text-lg capitalize font-bold">{stepper?.university}</h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Program</h5>
            <h5 className="text-lg capitalize font-bold">{stepper?.program}</h5>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-gray-100 mb-1">Through</h5>
            <h5 className="text-lg capitalize font-bold">{stepper?.through}</h5>
          </div>
        </div>
      </div>

      {/* Tracking process - Enhanced Layout */}
      <div className="w-full p-0 border-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary_colors to-blue-500 p-6">
          <h1 className="text-white text-2xl font-bold">Tracking Progress</h1>
        </div>

        {/* Tracking Container */}
        <div className="w-full min-h-screen flex flex-col lg:flex-row gap-6 p-6">
          {/* Left Sidebar - Steps */}
          <div className="w-full lg:w-1/4 bg-gray-50 rounded-xl p-6 shadow-md lg:shadow-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Application Steps</h2>
            <div className="overflow-y-auto max-h-96 lg:max-h-full pr-2">
              <TrackerVertical data={stepper} />
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="w-full lg:w-3/4 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100">
            <RightSide
              data={stepper}
              cb={fnToCallGetFn}
              application={application}
            />
          </div>
        </div>
      </div>
      {loader && <ReqLoader />}
    </div>
  );
};

export default Application;
