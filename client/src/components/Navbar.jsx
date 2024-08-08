import React from "react";
import { FaHome, FaBox, FaList, FaMap } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="bg-slate-200 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">Navbar</div>
        <ul className="flex flex-wrap items-center justify-center lg:justify-between space-x-4 lg:space-x-8">
          <li className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-300">
            <FaHome className="text-lg" />
            <span className=" lg:inline">Home</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-300">
            <FaBox className="text-lg" />
            <span className=" lg:inline">Orders</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-300">
            <FaList className="text-lg" />
            <span className=" lg:inline">Inventory</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors duration-300">
            <FaMap className="text-lg" />
            <span className=" lg:inline">Navigation</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
