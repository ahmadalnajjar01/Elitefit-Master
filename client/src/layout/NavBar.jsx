import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Heart,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Logo from "../assets/elitefit-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setSearchQuery, setIsSearching } from "../Slices/searchSlice";
import { clearCart } from "../Slices/cartSlice";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const searchPopupRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux
  const cartItemsCount = useSelector((state) => state.cart.cartItems.length);
  const favoriteItemsCount = useSelector(
    (state) => state.favorite.favorite.length
  );
  const searchQuery = useSelector((state) => state.search.query);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchPopupRef.current &&
        !searchPopupRef.current.contains(event.target) &&
        !event.target.closest("[data-search-trigger]")
      ) {
        setIsSearchPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close shop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target) &&
        !event.target.closest("[data-shop-dropdown-trigger]")
      ) {
        setIsShopDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("[data-menu-trigger]")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on resize if moving to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearchPopup = () => setIsSearchPopupOpen(!isSearchPopupOpen);
  const toggleShopDropdown = () => setIsShopDropdownOpen(!isShopDropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("persist:root");
    dispatch(clearCart());
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
  };

  const handleSearchSubmit = (e) => {
    if ((e.key === "Enter" || e.type === "click") && searchQuery.trim()) {
      navigate("/search");
      setIsSearchPopupOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleMobileNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    // Fetch ads from API
    const fetchAds = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ads");
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    // Rotate through ads every few seconds if there are multiple
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000); // Change ad every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ads]);

  if (ads.length === 0) {
    // Fallback if no ads are loaded
    return (
      <section className="py-3 bg-[#F0BB78] text-black text-center px-4 sm:px-10">
        <p className="text-sm">Get free delivery for first order over 100 JD</p>
      </section>
    );
  }

  // Shop dropdown categories
  const shopCategories = [
    { name: "New Arrivals", path: "/new" },
    { name: "Men", path: "/men" },
    { name: "Women", path: "/women" },
    { name: "Kids", path: "/kids" },
    { name: "Sale", path: "/sale" },
  ];

  return (
    <>
      <section className="py-3 bg-[#F0BB78] text-black text-center px-4 sm:px-10">
        <p className="text-sm">{ads[currentAdIndex]?.description}</p>
      </section>

      <header className="shadow-lg font-[sans-serif] tracking-wide relative z-50">
        <section className="flex items-center relative py-3 px-4 lg:px-10 border-gray-200 border-b bg-white lg:min-h-[70px] max-lg:min-h-[60px]">
          <Link to="/" className="shrink-0 mr-auto">
            <img
              src={Logo}
              alt="EliteFit logo"
              className="w-[130px] sm:w-[180px]"
            />
          </Link>

          <div className="flex items-center">
            <ul className="flex items-center">
              {/* Search Icon */}
              <li className="py-2 px-2 sm:px-4 cursor-pointer relative">
                <button
                  onClick={toggleSearchPopup}
                  className="flex items-center justify-center"
                  aria-label="Search"
                  data-search-trigger
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </button>

                {/* Search Popup */}
                {isSearchPopupOpen && (
                  <div
                    ref={searchPopupRef}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Search for clothes..."
                        className="w-full bg-gray-100 border px-4 pl-10 rounded h-10 outline-none text-sm transition-all"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchSubmit}
                        autoFocus
                      />
                      <Search className="w-5 h-5 absolute left-3 text-gray-500" />
                      <button
                        className="absolute right-3 bg-[#F0BB78] rounded-full h-6 w-6 flex items-center justify-center hover:bg-[#e0ab68] transition-colors"
                        onClick={handleSearchSubmit}
                      >
                        <Search className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </li>

              <li className="py-2 px-2 sm:px-4 cursor-pointer">
                <Link to="/favorite" className="relative flex items-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 inline text-[#F0BB78]" />
                  {favoriteItemsCount > 0 && (
                    <span className="absolute left-auto -ml-1 -top-2 rounded-full bg-red-500 px-1.5 py-0 text-xs text-white">
                      {favoriteItemsCount}
                    </span>
                  )}
                </Link>
              </li>

              <li className="py-2 px-2 sm:px-4 cursor-pointer">
                <Link to="/cart" className="relative flex items-center">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 inline" />
                  {cartItemsCount > 0 && (
                    <span className="absolute left-auto -ml-1 -top-2 rounded-full bg-red-500 px-1.5 py-0 text-xs text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </li>

              {isLoggedIn && (
                <li className="py-2 px-2 sm:px-4 cursor-pointer">
                  <Link to="/profile" className="relative flex items-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 inline text-gray-800" />
                  </Link>
                </li>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center px-3 sm:px-4 py-1.5 sm:py-2 ml-2 text-xs sm:text-sm font-semibold text-white bg-red-500 border border-red-600 rounded-lg hover:bg-red-600 transition-all"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              ) : (
                <Link
                  to="/signup"
                  className="hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 ml-2 text-xs sm:text-sm font-semibold text-gray-800 border border-[#333] bg-transparent rounded-lg"
                >
                  Sign Up
                </Link>
              )}

              <li className="lg:hidden cursor-pointer ml-2">
                <button
                  onClick={toggleMenu}
                  data-menu-trigger
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </li>
            </ul>
          </div>
        </section>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:block">
          <ul className="flex items-center justify-center px-10 py-3 bg-[#fff] min-h-[46px] gap-4">
            <li className="px-3">
              <Link to="/" className="text-black text-[15px] font-medium block">
                Home
              </Link>
            </li>

            <li className="px-3">
              <Link
                to="/products"
                className="text-black text-[15px] font-medium block"
              >
                All Products
              </Link>
            </li>

            {/* Shop Dropdown */}
            <li className="px-3 relative">
              <button
                className="text-black text-[15px] font-medium flex items-center gap-1"
                onClick={toggleShopDropdown}
                data-shop-dropdown-trigger
              >
                Shop
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Shop Dropdown Menu */}
              {isShopDropdownOpen && (
                <div
                  ref={shopDropdownRef}
                  className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2"
                >
                  {shopCategories.map((category, index) => (
                    <Link
                      key={index}
                      to={category.path}
                      className="block px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li className="px-3">
              <Link
                to="/contact"
                className="text-black text-[15px] font-medium block"
              >
                Contact
              </Link>
            </li>
            <li className="px-3">
              <Link
                to="/about"
                className="text-black text-[15px] font-medium block"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMenu}
          ></div>
        )}

        {/* Mobile Menu - Fixed Position with Full Height and Improved Scrolling */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Menu Header - Sticky Position */}
          <div className="sticky top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
            <Link
              to="/"
              className="shrink-0"
              onClick={handleMobileNavLinkClick}
            >
              <img src={Logo} alt="EliteFit logo" className="w-[130px]" />
            </Link>
            <button
              className="rounded-full bg-gray-100 w-8 h-8 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Menu User Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center text-sm font-medium"
                    onClick={handleMobileNavLinkClick}
                  >
                    <User className="w-5 h-5 mr-2" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-red-500 border border-red-600 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-gray-800 border border-[#333] bg-transparent rounded-lg"
                  onClick={handleMobileNavLinkClick}
                >
                  Sign Up
                </Link>
              )}
            </div>

            {/* Mobile Search Bar */}
            <div className="p-4 border-b">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for clothes..."
                  className="w-full bg-gray-100 border px-4 pl-10 rounded h-10 outline-none text-sm transition-all"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchSubmit}
                />
                <Search className="w-5 h-5 absolute left-3 text-gray-500" />
                <button
                  className="absolute right-3 bg-[#F0BB78] rounded-full h-6 w-6 flex items-center justify-center"
                  onClick={handleSearchSubmit}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="p-4 pb-24">
              <ul className="space-y-1">
                <li className="border-b py-3">
                  <Link
                    to="/"
                    className="text-black text-[15px] font-medium block"
                    onClick={handleMobileNavLinkClick}
                  >
                    Home
                  </Link>
                </li>

                {/* All Products link outside dropdown in mobile menu */}
                <li className="border-b py-3">
                  <Link
                    to="/products"
                    className="text-black text-[15px] font-medium block"
                    onClick={handleMobileNavLinkClick}
                  >
                    All Products
                  </Link>
                </li>

                {/* Mobile Shop Categories */}
                {shopCategories.map((category, index) => (
                  <li key={index} className="border-b py-3">
                    <Link
                      to={category.path}
                      className="text-black text-[15px] font-medium block"
                      onClick={handleMobileNavLinkClick}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

                <li className="border-b py-3">
                  <Link
                    to="/contact"
                    className="text-black text-[15px] font-medium block"
                    onClick={handleMobileNavLinkClick}
                  >
                    Contact
                  </Link>
                </li>
                <li className="py-3">
                  <Link
                    to="/about"
                    className="text-black text-[15px] font-medium block"
                    onClick={handleMobileNavLinkClick}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
