import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../Slices/cartSlice";
import { addToFavorite, removeFromFavorite } from "../../Slices/favoriteSlice";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const SuggestedProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const favoriteItems = useSelector((state) => state.favorite.favorite);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/orders/popular-products"
        );
        setProducts(response.data.products || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch popular products:", error);
        setError("Failed to load suggested products. Please try again later.");
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Calculate discount percentage
  const getDiscountPercentage = (oldPrice, currentPrice) => {
    return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  };

  // Handle add to cart with toast
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`, { duration: 3000 });
  };

  // Handle wishlist toggle with toast
  const handleFavoriteToggle = (product, isFavorite) => {
    if (isFavorite) {
      dispatch(removeFromFavorite(product.id));
      toast("Removed from wishlist", { icon: "🗑️" });
    } else {
      dispatch(addToFavorite(product));
      toast.success(`${product.name} added to wishlist!`, { duration: 3000 });
    }
  };

  return (
    <div className="mt-12 bg-[#fff] rounded-2xl shadow-lg p-8 relative overflow-hidden">
      {/* Toast Configuration */}
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

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#F0BB78]/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-[#F0BB78]/5 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <h2 className="text-2xl font-bold mb-8 text-black flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2 text-[#F0BB78]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        You Might Also Like
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F0BB78]"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm2 8a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isFavorite = favoriteItems.some(
              (fav) => fav.id === product.id
            );
            const imageUrl = product.image.startsWith("http")
              ? product.image
              : `http://localhost:5000/${product.image.replace(/\\/g, "/")}`;
            const hasDiscount =
              product.oldPrice && product.oldPrice > product.price;

            return (
              <div
                key={product.id}
                className="bg-[#181818] text-white rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(240,187,120,0.2)] transition duration-500 group border border-[#F0BB78]/20 cursor-pointer transform hover:-translate-y-1"
                onClick={() =>
                  navigate(`/product/${product.id}`, {
                    state: { item: product },
                  })
                }
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700"
                    />
                  </div>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-[#F0BB78] text-[#000000] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {getDiscountPercentage(product.oldPrice, product.price)}%
                      OFF
                    </div>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      className="bg-[#181818] text-white p-3 rounded-full shadow-lg mx-2 hover:bg-[#F0BB78]/20 transition transform hover:scale-105 duration-300"
                      title="Quick view"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`, {
                          state: { item: product },
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3
                    className="text-sm sm:text-base font-bold truncate hover:text-[#F0BB78] transition cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${product.id}`, {
                        state: { item: product },
                      })
                    }
                  >
                    {product.name}
                  </h3>
                  <p className="mt-2 text-white/80 text-xs sm:text-sm truncate">
                    {product.description}
                  </p>

                  <div className="flex items-center mt-3">
                    <h6 className="text-base sm:text-lg font-bold text-[#F0BB78]">
                      {product.price} JD
                    </h6>
                    {hasDiscount && (
                      <h6 className="ml-2 text-sm text-gray-400 line-through">
                        {product.oldPrice} JD
                      </h6>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 shadow-sm ${
                        isFavorite
                          ? "bg-[#F0BB78]/20 text-[#F0BB78]"
                          : "bg-[#262626] text-gray-300 hover:bg-[#F0BB78]/20 hover:text-[#F0BB78]"
                      }`}
                      title={
                        isFavorite ? "Remove from wishlist" : "Add to wishlist"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(product, isFavorite);
                      }}
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
                      type="button"
                      className="flex-1 bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#000000] text-sm font-medium py-3 px-4 rounded transition-colors duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
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
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-[#F0BB78] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-black mb-1">
            No suggested products found
          </h3>
          <p className="text-gray-500">Try refreshing the page</p>
        </div>
      )}
    </div>
  );
};

export default SuggestedProducts;
