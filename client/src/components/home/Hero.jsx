import React from "react";
import { Link } from "react-router-dom";
import heroVideo from "../../assets/heroVedio.mp4";

const Hero = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] bg-black text-white text-center px-4 overflow-hidden w-full">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-100"
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Optional Overlay (darker layer) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto w-full py-8">
        {/* Example of a banner-like text */}
        <div className="inline-block bg-[#F0BB78] py-1 px-4 mb-4 md:mb-8 rounded">
          <p className="font-bold text-sm md:text-base">ELITEFIT</p>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter transition-transform duration-300 hover:scale-105 hover:text-gray-300 cursor-pointer">
            <span className="font-extrabold">ELEVATE</span>
            <span className="font-light">YOUR</span>
            <span className="font-extrabold">STYLE</span>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl mt-2">
            The Ultimate Activewear Destination
          </div>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto px-2">
          Discover premium clothing designed for performance, comfort, and
          standout style. Transform your fitness journey with EliteFit's
          exclusive collections.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {/* Shop Now Button */}
          <Link
            to="/products"
            className="bg-[#F0BB78] text-white px-5 py-2.5 md:px-6 md:py-3 rounded hover:bg-[#F0BB60] transition-colors text-sm md:text-base font-medium"
          >
            Shop Now
          </Link>

          {/* View Sale Button */}
          <Link
            to="/sale"
            className="bg-white text-black px-5 py-2.5 md:px-6 md:py-3 rounded hover:bg-gray-300 transition-colors text-sm md:text-base font-medium"
            onClick={() => console.log("View Collection")}
          >
            View Sale
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
