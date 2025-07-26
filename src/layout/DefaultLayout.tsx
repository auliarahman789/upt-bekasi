import { useState } from "react";
import Navbar from "../components/Navbar";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState("/");

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
    // Here you can add actual routing logic
    console.log("Navigating to:", route);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Content Container */}
        <div className="max-w-screen mx-auto  py-4">{children}</div>
      </main>
    </div>
  );
};

export default DefaultLayout;
