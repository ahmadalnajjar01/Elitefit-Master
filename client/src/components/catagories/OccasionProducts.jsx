import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../Slices/cartSlice";
import { addToFavorite, removeFromFavorite } from "../../Slices/favoriteSlice";

function OccasionProducts() {
  const { occasionName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const favoriteItems = useSelector((state) => state.favorite.favorite);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/occasions/${occasionName}`)
      .then((res) => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Something went wrong");
        setLoading(false);
      });
  }, [occasionName]);

  const displayedItems = showAll ? products : products.slice(0, 8);
  const toggleShowAll = () => setShowAll((prev) => !prev);

  const getImageUrl = (product) => {
    if (product.image) {
      if (product.image.startsWith("http")) return product.image;
      if (product.image.includes("uploads")) {
        return `http://localhost:5000/${product.image.replace(/\\/g, "/")}`;
      }
      return `http://localhost:5000/uploads/${product.image.replace(
        /\\/g,
        "/"
      )}`;
    }
    return "https://via.placeholder.com/300";
  };

  const getDiscountPercentage = (oldPrice, price) =>
    Math.round(((oldPrice - price) / oldPrice) * 100);

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    dispatch(addToCart(item));
    toast.success("Product added to cart", { duration: 3000 });
  };

  const handleFavoriteToggle = (e, item, isFavorite) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorite(item.id));
      toast("Removed from favorites", { icon: "🗑️" });
    } else {
      dispatch(addToFavorite(item));
      toast.success("Added to favorites", { duration: 3000 });
    }
  };

  return (
    <section className="py-24 bg-[#fff] relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#FFFFFF",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderLeft: "4px solid #F0BB78",
          },
          iconTheme: {
            primary: "#F0BB78",
            secondary: "#FFFFFF",
          },
        }}
      />

      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#F0BB78]/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#F0BB78]/5 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-[#F0BB78] text-black rounded-full text-sm font-semibold uppercase shadow-sm">
            Occasion
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-black capitalize">
            {occasionName}
          </h2>
          <div className="mt-4 mx-auto h-1 w-24 bg-[#F0BB78] rounded-full shadow-lg" />
          <p className="mt-8 text-xl black max-w-2xl mx-auto">
            Explore our collection for {occasionName}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F0BB78]" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-center text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedItems.map((item) => {
            const imageUrl = getImageUrl(item);
            const hasDiscount = item.oldPrice > item.price;
            const isFavorite = favoriteItems.some((f) => f.id === item.id);

            return (
              <div 
                key={item.id}
                className="bg-[#181818] text-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer border border-[#F0BB78]/20"
                onClick={() =>
                  navigate(`/product/${item.id}`, { state: { item } })
                }
              >
                <div className="relative">
                  <div className="aspect-[3/4]">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-[#F0BB78] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {getDiscountPercentage(item.oldPrice, item.price)}% OFF
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h5 className="font-bold truncate hover:text-[#F0BB78]">
                    {item.name}
                  </h5>
                  <p className="text-xs sm:text-sm text-white/80 truncate mt-2">
                    {item.description}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-lg font-bold text-[#F0BB78]">
                      {item.price} JD
                    </span>
                    {hasDiscount && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {item.oldPrice} JD
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-colors ${
                        isFavorite
                          ? "bg-[#F0BB78]/20 text-[#F0BB78]"
                          : "bg-[#262626] text-gray-300 hover:bg-[#F0BB78]/20 hover:text-[#F0BB78]"
                      }`}
                      onClick={(e) => handleFavoriteToggle(e, item, isFavorite)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18px"
                        height="18px"
                        fill="currentColor"
                        viewBox="0 0 64 64"
                      >
                        <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4Z" />
                      </svg>
                    </button>

                    <button
                      className="flex-1 bg-[#F0BB78] text-black py-3 rounded shadow-md hover:bg-[#F0BB78]/90 transition flex items-center justify-center gap-2"
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-bag-plus"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z"
                        />
                        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length > 8 && (
          <div className="text-center mt-10">
            <button
              onClick={toggleShowAll}
              className="px-8 py-3 bg-[#F0BB78] text-black rounded shadow hover:bg-[#F0BB78]/90 transition"
            >
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default OccasionProducts;
