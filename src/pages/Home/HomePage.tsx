import React from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import Article from "./Article"; // Import the Article component
import Videos from "./Videos";

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      {/* Hero Section with Background and Image */}
      <div className="relative w-full h-screen overflow-hidden bg-white ">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mr-4"
          style={{
            backgroundImage: "url('MainMenu.svg')",
            backgroundSize: "100% 100%",
          }}
        />

        {/* Main Content Image Container */}
        <div className="absolute inset-0 flex rounded-3xl items-center justify-center px-[50px] pb-[37px] pt-[48px]">
          <div className="relative w-full">
            {/* Front Image */}
            <div className="relative rounded-3xl">
              <img
                src="frontImage.jpg"
                alt="PLN UPT Bekasi Team"
                className="w-full h-full rounded-3xl"
                style={{
                  aspectRatio: "1341/576",
                  objectFit: "cover",
                }}
              />

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 rounded-b-3xl">
                <h1 className="text-[48px] font-bold text-yellow-400 mb-1">
                  UPT BEKASI
                </h1>
                <p className="text-white text-[24px] leading-relaxed font-light">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Section */}
      <Article />
      <Videos />
    </DefaultLayout>
  );
};

export default HomePage;
