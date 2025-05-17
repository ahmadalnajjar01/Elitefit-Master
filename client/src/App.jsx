// App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./store"; // 🔁 Make sure this matches
import store from "./store";

// Layout
import NavBar from "./layout/NavBar";
import Footer from "./layout/Footer";

// Pages
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SearchResults from "./pages/SearchResults";
import Favorite from "./pages/Favorite";
import Profile from "./pages/Profile";

// Categories
import NewArrivals from "./components/catagories/NewArrivals";
import MenCategory from "./components/catagories/Men";
import Women from "./components/catagories/Women";
import Kids from "./components/catagories/Kids";
import Sale from "./components/catagories/Sale";
import OccasionProducts from "./components/catagories/OccasionProducts";
import AllProducts from "./components/catagories/AllProducts";

// Theme
import { ThemeProvider } from "./components/home/ThemeProvider";

// Async fetch actions from slices
import { fetchMenProducts } from "./Slices/menSlice";
import { fetchKidsProducts } from "./Slices/kidsSlice";
import { fetchTrendingItems } from "./Slices/trendingSlice";
import BodySizeEstimator from "./pages/BodySizeEstimator";
// import { fetchWomenProducts } from "./Slices/womenSlice"; // Uncomment if available

// Layout component: renders NavBar, Routes, and Footer
function Layout() {
  const location = useLocation();

  // Hide Navbar and Footer on specific pages
  const hideNavAndFooter = [
    "/login",
    "/signup",
    "/checkout",
    "/verify-email",
    "/cart",
  ].includes(location.pathname);

  function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scroll({ behavior: "smooth", top: 0 });
    }, [pathname]);
    return null;
  }

  return (
    <>
      {!hideNavAndFooter && <NavBar />}

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/occasion/:occasionName" element={<OccasionProducts />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/new" element={<NewArrivals />} />
        <Route path="/men" element={<MenCategory />} />
        <Route path="/women" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/ai" element={<BodySizeEstimator />} />
      </Routes>

      {!hideNavAndFooter && <Footer />}

      <button
        className="fixed bottom-6 right-6 bg-[#F0BB78] text-white rounded-full p-3 shadow-lg hover:bg-[#F0BB78]  z-10 hover:scale-110 transition-transform"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </>
  );
}

// Main App component: dispatches fetch actions and renders Layout
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch asynchronous actions to load product data
    dispatch(fetchMenProducts());
    dispatch(fetchKidsProducts());
    dispatch(fetchTrendingItems());
    // dispatch(fetchWomenProducts()); // Uncomment if you have a women slice
  }, [dispatch]);

  return <Layout />;
}

// Wrap App with Redux Provider, ThemeProvider, and Router
function AppWrapper() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <Router>
            <App />
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default AppWrapper;
