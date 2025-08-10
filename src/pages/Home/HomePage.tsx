import React from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import Article from "./Article"; // Import the Article component
import Videos from "./Videos";

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      {/* Hero Section with Background and Image */}
      <div className="relative w-full overflow-hidden bg-white ">
        {/* Background Image - Now visible on all screen sizes */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mr-4"
          style={{
            backgroundImage: "url('MainMenu.svg')",
            backgroundSize: "100% 100%",
          }}
        />

        {/* Mobile Layout */}
        <div className="sm:hidden relative flex flex-col px-4">
          {/* Front Image for Mobile */}
          <div className="relative w-full">
            <img
              src="frontImage.jpg"
              alt="PLN UPT Bekasi Team"
              className="w-full h-auto object-cover rounded-lg"
              style={{
                aspectRatio: "1341/576",
                minHeight: "200px",
              }}
            />

            {/* Text Overlay for Mobile */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 rounded-b-lg">
              <h1 className="text-2xl font-bold text-yellow-400 mb-2">
                UPT BEKASI
              </h1>
              <p className="text-white text-base leading-relaxed font-light line-clamp-3">
                Best Team, Best Synergy, Best Performance
              </p>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Original centered layout */}
        <div className="hidden sm:flex  items-center justify-center p-4 sm:p-6 md:p-8 lg:px-[50px] lg:pb-[37px] lg:pt-[48px]">
          <div className="relative w-full">
            {/* Front Image */}
            <div className="relative rounded-lg sm:rounded-2xl lg:rounded-3xl overflow-hidden">
              <img
                src="frontImage.jpg"
                alt="PLN UPT Bekasi Team"
                className="w-full h-auto object-cover"
                style={{
                  aspectRatio: "1341/576",
                  minHeight: "200px",
                }}
              />

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 sm:p-4 md:p-5 lg:p-6 rounded-b-lg sm:rounded-2xl lg:rounded-3xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[48px] font-bold text-yellow-400 mb-1 sm:mb-2">
                  UPT BEKASI
                </h1>
                <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-[24px] leading-relaxed font-light line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                  Best Team, Best Synergy, Best Performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Section */}
      <Videos />
      <Article />
    </DefaultLayout>
  );
};

export default HomePage;
