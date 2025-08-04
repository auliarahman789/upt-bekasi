import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  // Update current route when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />

      {/* Main Content Area */}
      <main className="pt-[67px]">
        {" "}
        {/* Add padding-top to account for fixed navbar */}
        {/* Content Container */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

export default DefaultLayout;
