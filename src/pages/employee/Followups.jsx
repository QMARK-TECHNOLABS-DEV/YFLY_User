import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useSelector } from "react-redux";
import FollowTable from "../../components/Table/FollowTable";
import Pagination from "../../components/Pagination";
import { followupRoute, selectEmployee } from "../../utils/Endpoint";
import SearchData from "../../components/search/SearchData";

const Followups = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [stage, setStage] = useState(null);
  const [assignee, setAssignee] = useState("");
  const [search, setSearch] = useState("");
  const [employeeData, setEmployeeData] = useState([]);


  const adminDefinedData = useSelector((state) => state.data.adminDefinedData);

  const stages = adminDefinedData.find((item) => item.name === "stage")?.list || [];

  const axiosPrivate = useAxiosPrivate();

  const user = useSelector((stage) => stage.auth.userInfo);

  const getData = async () => {
    try {
      const response = await axiosPrivate.get(
        `${followupRoute}?page=${page}&entries=${entries}&search=${search}&stage=${stage}&assignee=${assignee}`
      );

      if (response.status === 200) {
        const data = response?.data?.followups || [];
        setData([...data]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getData();
    }
  };

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
    getData();
    getEmployeeData()
  }, [stage, assignee]);

  return (
    <div className="w-full min-h-screen text-black my-[5vh]">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between">
        <h1 className="text-primary_colors text-2xl font-bold">
          {
            assignee
            ?
            `Follow-up Tasks`
            :
            `Follow-ups`
          }
          </h1>

        {user?.role === "admin"
          ?
          (
            <div className="flex gap-5">
              <select
                className="w-fit border shadow p-2  rounded-lg text-secondary text-normal focus:outline-none"
                onClick={(e) => setAssignee(e.target.value)}
              >
                <option value="">All</option>
                {employeeData.map((data) => (
                  <option key={data?._id} value={data?._id}>
                    {data?.name}
                  </option>
                ))}
              </select>
            </div>
          )
          :
          (
            <div className="flex gap-5">
              <select
                className="w-fit border shadow p-2  rounded-lg text-secondary text-normal focus:outline-none"
                onClick={(e) => setAssignee(e.target.value)}
              >
                <option value="">All</option>
                <option value={user?._id}>Assigned</option>
              </select>
            </div>
          )
        }

        <div className="flex gap-5">
          {/* Select Status option */}
          <select
            // onChange={(e) => setStatus(e.target.value)}
            className="w-fit border shadow p-2  rounded-lg text-secondary text-normal focus:outline-none"
            onClick={(e) => setStage(e.target.value)}
          >
            <option value="">Stages</option>

            {stages?.map((item, index) => (
              <option key={index} value={item?._id}>
                {" "}
                {item?.label}
              </option>
            ))}
          </select>

          <SearchData
            placeholder={"Search Student"}
            searchHandler={getData}
            handleKeyPress={handleKeyPress}
            setSearch={setSearch}
          />

        </div>
      </div>

      <div className="mt-5">
        <FollowTable
          data={data}
          setData={setData}
          getData={getData}
          page={page}
          entries={entries}
        />
      </div>

      <div className="flex justify-end">
        <Pagination
          Data={data}
          page={page}
          setPage={setPage}
          getMethod={getData}
        />
      </div>
    </div>
  );
};

export default Followups;
