// PRODUCTION BASE URL
export const baseUrl = "https://yflyserver.qmarkdesk.com" 
// export const baseUrl = "https://server.emtsolutions.online" 

// DEVELOPMENT BASE URL
// export const baseUrl = "http://localhost:8800"
// export const baseUrl = "https://yflydevserver.qmarkdesk.com"

// Login page
export const loginPost = '/api/auth/login'

// Logout
export const userLogout = '/api/auth/logout'

// employee Dashboard data
export const dashData = '/api/admin/get-application-metrics'

// Register Student
export const studentRegisterRoute = '/api/student/create'

//Register Employee
export const employeeRegisterRoute = '/api/employee/create'

// Get Employee list by department;
export const getEmployeesRoute = '/api/employee/get-all';

//Get an Employee;
export const getAnEmployeeRoute = '/api/employee/get';

//Get an Application;
export const getAnApplicationRoute = '/api/application/get';

// Get all Applications;
export const getAllApplications ='/api/application/get-all';

// Get all StudentData;
export const getAllStudent ='/api/student/get-all';

// Get an employee data;
export const getAEmployeeData ='/api/employee/get'

//Get Assigned works;
export const getAssignedWorksRoute = '/api/employee/get-assigned-works'

// Get Route to refresh token;
export const refreshTokenRoute = '/api/auth/refresh-token';

// Post Route to Send Otp;
export const sendOtpRoute = '/api/auth/send-otp'

// Post Route to verify email;
export const verifyOtpRoute = '/api/auth/verify-mail'

//Put Update employee
export const updateEmployeeRoute = '/api/employee/update'

//Put change-Password of Employee
export const changeEmpPwdRoute = '/api/employee/change-password'

//Put Deactivate-Employee
export const deactivateEmployeeRoute = '/api/employee/deactivate';

//Put Deactivate-Student
export const deactivateStudentRoute = '/api/student/deactivate';

//Get A Student
export const getAStudentRoute = '/api/student/get';

//Put Update-Student
export const updateStudentRoute = '/api/student/update';

//Put Change-Password of Student
export const changeStdtPwdRoute = '/api/student/change-password';

//Put Change-Password of Admin
export const changeAdmnPwdRoute = '/api/admin/change-password';

//Get Admin;
export const getAdminRoute = '/api/admin/get'; //<== + AdminId

//Put Update Admin;
export const updateAdminRoute = '/api/admin/update';

//Put Assign Work;
export const workAssignRoute = '/api/admin/assign-work';

//Put Assign Work;
export const workEmployeeAssignRoute = '/api/employee/assign-work';

//Put Remove Assignee;
export const removeAssigneeRoute = '/api/admin/remove-assignee';

//Post Create application
export const createApplicationRoute = '/api/application/create';

//Delete Delete Application
export const deleteApplicationRoute = '/api/application/delete'; //<== + ApplicationId

//Put Update Application;
export const updateApplicationRoute = '/api/application/update';

//Post Upload Documents of an Application;
export const uploadDocumentRoute = '/api/application/upload-document'; //<== + ApplicationId

//Get All comments in an Application;
export const getAllComments = '/api/comment/get-all'; //<== + /resourceType + /resourceId;

//Post a Comment;
export const postComment = '/api/comment/add';

// Get Employee Task Metrics;
export const getEmpTaskMetrics = "/api/employee/get-task-metrics"; //<== + EmployeeId

// Create task
export const createTask = '/api/project/add-task'; 

// Update  task
export const updateTask = '/api/project/update-task'; 

// Get All task from a project
export const getAllTask = '/api/project/get-all-tasks'; //<== + ProjectId

// Put Update Stepper;
export const changeStepStatus = "/api/stepper/update"

// Create Project
export const createProject = "/api/project/create";

// Get all Projects
export const getAllProjects = "/api/project/get-all";

// Get Project
export const getProject = "/api/project/get"; //<== + Projectid

// Delete Project
export const deleteProject = "/api/project/delete"; //<== + Projectid

// Update Project Status
export const updateProjectStatus = "/api/project/update-status";

// Create a stepper
export const createStepper = "/api/stepper/create";

// Get a stepper
export const getStepper = "/api/stepper/get"; //<== + stepperid

// Get all steppers
export const getAllSteppers = "/api/stepper/get-all"; //<== + applicationid

// Delete a stepper
export const deleteStepper = "/api/stepper/delete"; //<== + stepperid

// get All Members From Project
export const getAllMembersFromProject = "/api/project/get-members"; //<== + project id

export const changePhaseOfApplication = "/api/application/phase-change"; //<== + application id

// To get all applications of a student in student side dashboard
export const getMyApplicationsRoute = "/api/student/get-my-applications"; //<== + student Id


// followups

export const followupRoute = "/api/student/followup";

export const dataRoute = "/api/data";

export const adminDataRoute = "/api/admin/data";

export const selectEmployee = "/api/employee/select-employee"
export const getStages = "/api/data/single?name=stage"
export const getFollowUp = "/api/data/single?name=followup method"

export const notifyRoute = "/api/notification"
export const notifyEmployeeRoute = "/api/employee/notification"

export const notification = "/api/notification/send"