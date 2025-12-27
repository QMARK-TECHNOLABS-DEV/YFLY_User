import React, { useEffect, useState } from "react";
import { getAllStudent } from "../../utils/Endpoint";

import StudentTable from "../../components/Table/StudentTable";
import Pagination from "../../components/Pagination";
import SearchData from "../../components/search/SearchData";
import { toast } from "react-toastify";
import { Office } from "../../data/Dashboard";
import { useSelector } from "react-redux";
import ReqLoader from "../../components/loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FaSearch, FaFilter } from "react-icons/fa";

const Student = () => {
  const instance = useAxiosPrivate();

  const [loader, setLoader] = useState(false);
  const [data, setData] = useState();
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [office, setOffice] = useState("");
  const [appstatus, setAppstatus] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const user = useSelector((state) => state?.auth?.userInfo)

  // Table initial api call
  const studentTable = async () => {
    try {
      setLoader(true)
      const res = await instance.get(
        `${getAllStudent}?page=${page}&entries=${entries}&office=${office}&appstatus=${appstatus}`
      );
      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false)
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    studentTable();
  }, [office, appstatus]);

  // Search Student
  const searchHandler = async () => {
    try {
      setLoader(true)
      const response = await instance.get(`${getAllStudent}?search=${search}`);
      setData(response.data)
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong...");
    } finally {
      setLoader(false)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchHandler();
    }
  };

  return (
    <div className="w-full min-h-screen text-black pt-10 pb-28">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👥 Track Student
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-primary_colors to-blue-400 rounded-full"></div>
        <p className="text-gray-600 text-sm mt-2">Manage and track student information</p>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Search Bar */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 Search Student
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter student name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
            />
            <button
              onClick={searchHandler}
              className="px-6 py-2 bg-primary_colors text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2"
            >
              <FaSearch size={16} /> Search
            </button>
          </div>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-primary_colors font-semibold text-sm hover:text-blue-700 transition-all"
        >
          <FaFilter size={16} /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Application Status
              </label>
              <select
                value={appstatus}
                onChange={(e) => setAppstatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
              >
                <option value="">All Students</option>
                <option value="present">With Application</option>
                <option value="absent">Without Application</option>
              </select>
            </div>

            {user?.role === "admin" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Office Location
                </label>
                <select
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary_colors focus:ring-1 focus:ring-primary_colors"
                >
                  <option value="">All Offices</option>
                  {Office.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(office || appstatus || search) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-700 font-medium">
            📌 Filters Applied: {[office && `Office: ${office}`, appstatus && `Status: ${appstatus === 'present' ? 'With Application' : 'Without Application'}`, search && `Search: "${search}"`].filter(Boolean).join(" • ")}
          </p>
          <button
            onClick={() => {
              setOffice("");
              setAppstatus("");
              setSearch("");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <StudentTable data={data} getData={studentTable} page={page} entries={entries} />
      </div>

      {/* Pagination */}
      <div className="w-full flex justify-end mt-6">
        <Pagination
          Data={data}
          page={page}
          setPage={setPage}
          getMethod={studentTable}
        />
      </div>

    </div>
  );
};

export default Student;
