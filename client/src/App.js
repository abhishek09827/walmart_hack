import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
  ScrollRestoration,
} from "react-router-dom";
import Footer from "./components/home/Footer/Footer.js";
import FooterBottom from "./components/home/Footer/FooterBottom.js";
import Header from "./components/home/Header/Header.js";
import HeaderBottom from "./components/home/Header/HeaderBottom.js";
import SpecialCase from "./components/SpecialCase/SpecialCase.js";

import Cart from "./pages/Cart/Cart.js";

import Home from "./pages/Home/Home.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Webcam from "./components/Webcam.jsx";

const Layout = () => {
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Header />
      <HeaderBottom />
      <SpecialCase />
      <ScrollRestoration />
      <Outlet />
      <Footer />
      <FooterBottom />
    </div>
  );
};
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        {/* ==================== Header Navlink Start here =================== */}
        <Route index element={<Home />}></Route>

        <Route path="/webcam" element={<Webcam />}></Route>
        {/* ==================== Header Navlink End here ===================== */}

        <Route path="/cart" element={<Cart />}></Route>

      </Route>
    </Route>
  )
);

function App() {
  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
