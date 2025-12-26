import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnApplicationRoute } from "../../utils/Endpoint";
import ApplicationCard from "../../components/application/ApplicationCard";
import DateFormat from "../../utils/DateFormat";
import EmptyData from "../../components/loading/EmptyData";
import ReqLoader from "../../components/loading/ReqLoader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { MdAddCircle } from "react-icons/md";
import AddStepper from "../../components/modals/AddStepper";

const Stepper = () => {
  const axios = useAxiosPrivate();

  const { id } = useParams();
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(false);
  const [modal, setModal] = useState(false);

  // Get Application Data
  const getApplication = async () => {
    try {
      setLoader(true);
      await axios
        .get(`${getAnApplicationRoute}/${id}`)
        .then((res) => {
          setData(res.data);
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

  // DOM Mounting Hook
  useEffect(() => {
    window.scroll(0, 0);
    getApplication();
  }, [id]);

  return (
    <div className="container mx-auto w-full h-full pt-10 pb-28 ">
      {/* page intro */}
      <div className="bg-primary_colors p-5 rounded-xl ">
        <h1 className="text-white md:text-2xl font-bold my-3">
          Welcome To The Application Of{" "}
          <span className="capitalize"> {data?.studentName}</span>
        </h1>
        <div className="text-white mt-5 flex items-center justify-around gap-4">
          <div className="flex  flex-col justify-start w-full">
            <h5 className="font-bold">Name</h5>
            <h5 className="text-sm capitalize">{data?.studentName}</h5>
          </div>
          <div className="flex  flex-col justify-start w-full">
            <h5 className="font-bold">Country</h5>
            <h5 className="text-sm capitalize">{data?.country}</h5>
          </div>
          <div className="flex  flex-col justify-start w-full">
            <h5 className="font-bold">Intake</h5>
            <h5 className="text-sm capitalize">
              {data?.intakes
                ? data?.intakes?.length > 1
                  ? data?.intakes[0] + " +more"
                  : data?.intakes[0]
                : "NIL"}
            </h5>
          </div>

          <div className="flex  flex-col justify-start w-full">
            <h5 className="font-bold">Deadline</h5>
            <h5 className="text-sm capitalize">
              {data?.deadline ? DateFormat(data.deadline) : "Not set"}
            </h5>
          </div>

          <div className="flex  flex-col justify-start w-full">
            <h5 className="font-bold">Created Date</h5>
            <h5 className="text-sm capitalize">
              {data?.createdAt?.split("T")[0]}
            </h5>
          </div>

          <div className="flex  flex-col justify-start items-center w-full">
            <h5 className="font-bold">Add new</h5>
            <h5 className="text-sm capitalize cursor-pointer">
              <MdAddCircle size={23} onClick={() => setModal(true)} />
            </h5>
          </div>
        </div>
      </div>

      {/* cards */}
      <div className="mt-5 w-full flex flex-wrap gap-5">
        {data?.steppers && data?.steppers.length > 0 ? (
          data?.steppers.map((items, i) => (
            <div className="w-full md:w-[310px]">
              <ApplicationCard
                data={items}
                getData={getApplication}
                applicationDeadline={data?.deadline}
              />
            </div>
          ))
        ) : (
          <div>
            <EmptyData data={"No Data Available"} />
          </div>
        )}
      </div>

      {loader && <ReqLoader />}

      {modal && (
        <AddStepper
          application={data}
          setModal={setModal}
          cb={getApplication}
        />
      )}
    </div>
  );
};

export default Stepper;
