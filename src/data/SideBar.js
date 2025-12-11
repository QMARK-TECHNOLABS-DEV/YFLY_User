import { RxDashboard } from "react-icons/rx";
import { MdCall, MdOutlinePeople } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { TbBrowserCheck } from "react-icons/tb";
import { AiOutlineLogin } from "react-icons/ai";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { MdChecklistRtl } from "react-icons/md";


export const Sidebar = [
    {
        id: 1,
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <RxDashboard size={25} />
    },
    {
        id: 2,
        name: "Manage Team",
        path: "/admin/employee",
        icon: <MdOutlinePeople size={25} />
    },
    {
        id: 3,
        name: "Follow-ups",
        path: "/admin/followups",
        icon: <MdCall size={25} />
    },
    {
        id: 4,
        name: "Applications",
        path: "/admin/applications",
        icon: <PiStudentFill size={25} />
    },
    {
        id: 5,
        name: "Track Student",
        path: "/admin/student",
        icon: <TbBrowserCheck size={25} />
    },
    {
        id: 6,
        name: "Project",
        path: "/admin/project",
        icon: <AiOutlineFundProjectionScreen size={25} />
    },
    {
        id: 7,
        name: "Settings",
        path: "/admin/settings",
        icon: <CiSettings size={25}/>
    },
]

export const SidebarE = [
    {
        id: 1,
        name: "Dashboard",
        path: "/employee/dashboard",
        icon: <RxDashboard size={25} />
    },
    {
        id: 2,
        name: "Tasks",
        path: "/employee/task",
        icon: <MdOutlinePeople size={25} />
    },
    {
        id: 3,
        name: "Daily Tasks",
        path: "/employee/daily-tasks",
        icon: <MdChecklistRtl size={25} />
    },
    {
        id: 4,
        name: "Follow-ups",
        path: "/employee/followups",
        icon: <MdCall size={25} />
    },
    {
        id: 5,
        name: "Applications",
        path: "/employee/applications",
        icon: <PiStudentFill size={25} />
    },
    {
        id: 6,
        name: "Track Student",
        path: "/employee/students",
        icon: <TbBrowserCheck size={25} />
    },
    {
        id: 7,
        name: "Project",
        path: "/employee/projects",
        icon: <AiOutlineFundProjectionScreen size={25} />
    },

]
