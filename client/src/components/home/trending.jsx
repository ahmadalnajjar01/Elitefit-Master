import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrendingItems } from "../../Slices/trendingSlice";
import { addToCart } from "../../Slices/cartSlice";
import { addToFavorite, removeFromFavorite } from "../../Slices/favoriteSlice";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Trending = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { items, loading, error } = useSelector((state) => state.trending);
  const favoriteItems = useSelector((state) => state.favorite.favorite);

  useEffect(() => {
    dispatch(fetchTrendingItems());
  }, [dispatch]);

  // Shuffle items once when they're loaded
  const shuffledItems = useMemo(() => {
    if (!items.length) return [];
    return [...items].sort(() => Math.random() - 0.5);
  }, [items]);

  // Pagination logic
  const totalPages = Math.ceil(shuffledItems.length / itemsPerPage);
  const paginatedItems = shuffledItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-[#fff] relative overflow-hidden">
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
            Collections
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-black">
            Trending
          </h2>
          <div className="mt-4 mx-auto h-1 w-24 bg-[#F0BB78] rounded-full shadow-lg" />
          <p className="mt-8 text-xl black max-w-2xl mx-auto">
            Explore the latest trending products from our exclusive collection.
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

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedItems.map((item) => {
                const isFavorite = favoriteItems.some((f) => f.id === item.id);
                const imageUrl = getImageUrl(item);
                const hasDiscount = item.oldPrice > item.price;

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
                          className="w-full h-full object-fit object-top transition duration-700 group-hover:scale-105"
                        />
                      </div>
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-[#F0BB78] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {getDiscountPercentage(item.oldPrice, item.price)}% OFF
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          className="bg-[#181818] p-3 rounded-full shadow-lg hover:bg-[#F0BB78]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${item.id}`, { state: { item } });
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268
                                  2.943 9.542 7c-1.274 4.057-5.064 7-9.542
                                  7S1.732 14.057.458 10zM14 10a4 4 0 11-8
                                  0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <h5
                        className="font-bold truncate hover:text-[#F0BB78]"
                        onClick={() =>
                          navigate(`/product/${item.id}`, { state: { item } })
                        }
                      >
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
                            ${item.oldPrice}
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
                          onClick={(e) =>
                            handleFavoriteToggle(e, item, isFavorite)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18px"
                            height="18px"
                            fill="currentColor"
                            viewBox="0 0 64 64"
                          >
                            <path
                              d="M45.5 4A18.53 18.53 0 0 0 32 9.86
                              18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59
                              31 59.71a2 2 0 0 0 2.06 0C34.29 59 64
                              40.92 64 22.5A18.52 18.52 0 0 0 45.5 4Z"
                            />
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
                              d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5
                                  0 0 1 0 1H8.5V12a.5.5 0 0 1-1
                                  0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5
                                  0 0 1 .5-.5z"
                            />
                            <path
                              d="M8 1a2.5 2.5 0 0 1 2.5
                              2.5V4h-5v-.5A2.5 2.5 0 0 1 8
                              1zm3.5 3v-.5a3.5 3.5 0 1 0-7
                              0V4H1v10a2 2 0 0 0 2
                              2h10a2 2 0 0 0 2-2V4h-3.5zM2
                              5h12v9a1 1 0 0 1-1
                              1H3a1 1 0 0 1-1-1V5z"
                            />
                          </svg>
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {shuffledItems.length > itemsPerPage && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border border-[#F0BB78] text-[#F0BB78] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border border-[#F0BB78] text-[#F0BB78] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === pageNum
                            ? "bg-[#F0BB78] text-black"
                            : "border border-[#F0BB78] text-[#F0BB78]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md border border-[#F0BB78] text-[#F0BB78] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md border border-[#F0BB78] text-[#F0BB78] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Trending;