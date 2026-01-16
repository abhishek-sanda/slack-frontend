import React from "react";
import {Outlet} from "react-router-dom";
import Navbar from "./Navbar.jsx";

const PrivateLayout =({setIsAuthenticated})=>{
    return(
        <>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <Outlet/>
        </>
    );
};


export default PrivateLayout;

