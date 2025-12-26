import React, { useEffect, useState } from "react";
import { getAllApplications } from "../../utils/Endpoint";
import { Intake } from "../../data/Dashboard";

import CommonTable from "../Table/Commontable";
import AddModal from "./AddModal";
import Pagination from "../Pagination";
import { useSelector } from "react-redux";
import Filter from "../dashboard/Filter";
import LoadingData from "../loading/LoadingData";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AllApplications = () => {
  const instance = useAxiosPrivate();

  const [data, setData] = useState();
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [modal, setModal] = useState(false);

  const user = useSelector((state) => state?.auth?.userInfo);

  // Table loading Data
  const GetApplications = async () => {
    try {
      setLoader(true);
      const response = await instance.get(
        `${getAllApplications}?page=${page}&entries=${entries}`
      );
      console.log(
        "[GetApplications] response.data sample:",
        response?.data?.[0]
      );
      setData(response?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    GetApplications();
  }, [setPage]);

  return (
    <>
      <div className="w-full h-full text-black pt-10 pb-28">
        <div className="flex justify-between">
          <h1 className="text-primary_colors text-2xl font-bold">
            Applications
          </h1>
          <div>
            {/* {user?.role === "admin" && ( */}
            <button
              onClick={() => setModal(true)}
              className="p-2 px-5 text-normal bg-primary_colors text-white rounded hover:scale-105 ease-in-out duration-200 md:w-[170px]"
            >
              New Application
            </button>
            {/* )} */}
          </div>
        </div>
        <div className="flex flex-col md:flex-row mt-[5vh] justify-between">
          {/* filter & Application */}
          <div className="flex flex-col md:flex-row justify-between gap-3 mt-5 md:mt-0 w-full ">
            <Filter
              setData={setData}
              endPoint={getAllApplications}
              isDashboard={false}
              page={page}
              entries={entries}
            />
          </div>
        </div>

        {/* Common Table */}
        <div className="flex flex-wrap mt-5 w-full ">
          <CommonTable
            data={data}
            page={page}
            entries={entries}
            getData={GetApplications}
          />
        </div>

        {/* Pagination */}
        <div className="w-full flex justify-end">
          <Pagination
            Data={data}
            page={page}
            setPage={setPage}
            getMethod={GetApplications}
          />
        </div>
      </div>
      {modal && <AddModal setModal={setModal} cb={GetApplications} />}
      {loader && <ReqLoader />}
    </>
  );
};

export default AllApplications;
