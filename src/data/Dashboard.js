import { Statuses } from "./Statuses";


export const FormData = [
    {
        id: 1,
        name: "name",
        placeholder: "Name",
        type: "text"
    },
    {
        id: 2,
        name: "phone",
        placeholder: "Phone",
        type: "text"
    },
    {
        id: 3,
        name: "email",
        placeholder: "Email",
        type: "email"
    },
    {
        id: 4,
        name: "password",
        placeholder: "Password",
        type: "text"
    },
    {
        id: 5,
        name: "birthDate",
        placeholder: "Date Of Birth",
        type: "date"
    },
    // {
    //     id: 6,
    //     name: "qualification",
    //     placeholder: "Qualification",
    //     type: "text"
    // },
    {
        id: 7,
        name: "enquiryRoute",
        placeholder: "Enquiry route",
        type: "text"
    },
]


export const Office =[
    {
        id:1,
        name:"Head Office"
    },
    {
        id:2,
        name:"Branch A"
    },
    {
        id:3,
        name:"Branch B"
    },
    {
        id:4,
        name:"Branch C"
    },
]

export const EmpFormData = [
    {
        id: 1,
        name: "name",
        placeholder: "Name",
        type: "text"
    },
    {
        id: 2,
        name: "phone",
        placeholder: "Phone",
        type: "text"
    },
    {
        id: 3,
        name: "email",
        placeholder: "Email",
        type: "email"
    },
    {
        id: 4,
        name: "password",
        placeholder: "Password",
        type: "text"
    },
    {
        id: 5,
        name: "birthDate",
        placeholder: "Date Of Birth",
        type: "date"
    },
    {
        id: 6,
        name: "education",
        placeholder: "Education",
        type: "text"
    },
   

]


export const Address = [
    {
        id: 1,
        name: "houseName",
        placeholder: "House Name",
        type: "text"
    },
    {
        id: 2,
        name: "city",
        placeholder: "City",
        type: "text"
    },
    {
        id: 3,
        name: "state",
        placeholder: "State",
        type: "test"
    },
    {
        id: 4,
        name: "pin",
        placeholder: "PIN",
        type: "text"
    },
]

export const countries = [
    { id: 1, name: "United States of America" },
    { id: 2, name: "Australia" },
    { id: 3, name: "Canada" },
    { id: 4, name: "United Kingdom" },
    { id: 5, name: "New Zealand" },
    { id: 6, name: "Singapore" },
    { id: 7, name: "Dubai" },
    { id: 8, name: "Ireland" },
    { id: 9, name: "Germany" },
    { id: 10, name: "France" },
    { id: 11, name: "Sweden" },
    { id: 12, name: "Netherlands" },
    { id: 13, name: "Austria" },
    { id: 14, name: "Denmark" },
    { id: 15, name: "Finland" },
    { id: 16, name: "Italy" },
    { id: 17, name: "Hungary" },
    { id: 18, name: "Switzerland" },
    { id: 19, name: "Spain" },
    { id: 20, name: "Lithuania" },
    { id: 21, name: "Cyprus" },
    { id: 22, name: "Poland" },
    { id: 23, name: "Malaysia" },
    { id: 24, name: "Mauritius" },
    { id: 25, name: "China" },
    { id: 26, name: "Vietnam" },
    { id: 27, name: "Malta" },
    { id: 28, name: "Japan" },
    { id: 29, name: "Belgium" },
    { id: 30, name: "Russia" },
    { id: 31, name: "South Korea" },
    { id: 32, name: "India" },
    { id: 33, name: "Georgia" },
    { id: 34, name: "Latvia" },
  ];
  

export const Intake = [
    { id: 1, name: "Fall" },
    { id: 2, name: "Spring" },
    { id: 3, name: "Winter" },
    { id: 4, name: "Summer" },
    { id: 5, name: "January" },
    { id: 6, name: "February" },
    { id: 7, name: "March" },
    { id: 8, name: "April" },
    { id: 9, name: "May" },
    { id: 10, name: "June" },
    { id: 11, name: "July" },
    { id: 12, name: "August" },
    { id: 13, name: "September" },
    { id: 14, name: "October" },
    { id: 15, name: "November" },
    { id: 16, name: "December" },
];


export const FilterData = [
    {
        id: 1,
        type: "",
        name: "country",
        options: [...countries],
        placeholder: "",
        icon: ""
    },
    {
        id: 2,
        type: "",
        name: "intake",
        options: [...Intake],
        placeholder: "",
        icon: ""
    },
    {
        id: 3,
        type: "",
        name: "status",
        options: [...Statuses],
        placeholder: "",
        icon: ""
    },
]

export const FilterDataDash = [
    {
        id: 1,
        type: "",
        name: "country",
        options: [...countries],
        placeholder: "",
        icon: ""
    },
    {
        id: 2,
        type: "",
        name: "intake",
        options: [...Intake],
        placeholder: "",
        icon: ""
    },
    
]


export const Phases = [
    {id:1, name:"pending"},
    {id:2, name:"ongoing"},
    {id:3, name:"completed"},
    {id:4, name:"deffered"},
    {id:5, name:"cancelled"},
    {id:6, name:"not-enrolled"},
]