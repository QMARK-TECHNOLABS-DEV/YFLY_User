import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()
    const user = useSelector((state) => state?.auth?.userInfo)

    const goback = ()=>{
        if(user?.role === "admin"){
            navigate('/admin/dashboard')
        }
        if(user?.role === "employee"){
            navigate('/employee/dashboard')
        }
        if(user?.role === "student"){
            navigate('/student/dashboard')
        }
        else{
            navigate('/')
        }
    }

  return (
    <div className='w-full h-screen bg-white text-primary_colors flex flex-col items-center justify-center gap-5'>
        <h1 className='text-2xl'>404 Page Not Found !</h1>
        <h3 onClick={goback} className='text-md cursor-pointer' >Back to Dashboard</h3>
    </div>
  )
}

export default NotFound