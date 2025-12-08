import React, { useEffect, useState } from "react";
import { FilterData, FilterDataDash } from "../../data/Dashboard";

import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import ReqLoader from "../loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Filter = ({ setData, endPoint, isDashboard, page, entries }) => {
  const axios = useAxiosPrivate();

  const [loader, setLoader] = useState(false);
  const TheDataToFilter = isDashboard ? FilterDataDash : FilterData;

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
  });

  //   @DCS updating the form data
  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  //   @DCS Submitting the data
  const submitData = async (e) => {
    e.preventDefault();
    const { start_date, end_date } = form;
    try {
      setLoader(true);
      const res = await axios.get(
        `${endPoint}?page=${page}&entries=${entries}&start_date=${start_date}&end_date=${end_date}`
      );
      // console.log(res);
      setData(res.data);
    } catch (error) {
      // console.error(error);
      toast.error(error.response.data.msg);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={submitData}
        action=""
        className="flex flex-col justify-between md:flex-row gap-5 md:gap-5 items-end"
      >
        <div className="relative flex-1">
          <label htmlFor="" className="absolute top-[-20px] left-0 text-xs ">
            Starting Date
          </label>
          <input
            onChange={changeHandler}
            type="date"
            name="start_date"
            placeholder=""
            className="border border-primary_colors p-3 rounded-lg text-secondary text-normal focus:outline-none w-full"
          />
        </div>

        <div className="relative flex-1">
          <label htmlFor="" className="absolute top-[-20px] left-0 text-xs ">
            Ending Date
          </label>
          <input
            onChange={changeHandler}
            type="date"
            name="end_date"
            placeholder=""
            className="border border-primary_colors p-3 rounded-lg text-secondary text-normal focus:outline-none w-full"
          />
        </div>

        {TheDataToFilter.map((data) => (
          <select
            key={data?.id}
            onChange={changeHandler}
            name={data?.name}
            id=""
            className="border border-primary_colors p-3 rounded-lg text-secondary text-normal focus:outline-none w-full flex-1"
          >
            <option value="">Select {data.name}</option>
            {data?.options?.map((data) => (
              <option key={data?.id} value={data?.name}>
                {data?.name}
              </option>
            ))}
          </select>
        ))}
        <button
          type="submit"
          className="bg-primary_colors p-3 px-8 rounded-lg text-white text-normal font-medium hover:scale-105 ease-in-out duration-200 whitespace-nowrap"
        >
          Filter
        </button>
      </form>
      {loader && <ReqLoader />}
    </div>
  );
};

export default Filter;
