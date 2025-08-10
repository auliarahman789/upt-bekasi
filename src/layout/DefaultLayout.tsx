import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NavbarMobile from "../components/NavbarMobile";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

// Enhanced mobile detection utility
const detectMobile = (): boolean => {
  // Check if running in browser environment
  if (typeof window === "undefined") return false;

  // 1. User Agent Detection (most reliable for actual mobile devices)
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const isUserAgentMobile = mobileRegex.test(userAgent);

  // 2. Touch capability detection
  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // 3. Screen size detection with more nuanced breakpoints
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isSmallScreen = screenWidth < 768;

  // 4. Device orientation consideration
  const isPortrait = screenHeight > screenWidth;

  // 6. Check for specific mobile features
  const hasOrientationAPI = "orientation" in window;

  // Combined logic for mobile detection
  if (isUserAgentMobile) {
    return true; // Definitely a mobile device based on user agent
  }

  // For tablets and edge cases
  if (isSmallScreen && hasTouchScreen) {
    return true; // Small screen with touch - likely mobile
  }

  // Additional checks for borderline cases
  if (screenWidth < 480) {
    return true; // Very small screen - definitely mobile
  }

  // Tablet-sized devices with touch (you might want to treat these as mobile too)
  if (
    screenWidth < 1024 &&
    hasTouchScreen &&
    (isPortrait || hasOrientationAPI)
  ) {
    return true;
  }

  return false;
};

// Custom hook for mobile detection with debouncing
const useMobileDetection = (debounceMs: number = 150) => {
  const [isMobile, setIsMobile] = useState(() => detectMobile());

  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      // Debounce the resize event to avoid too many re-renders
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(detectMobile());
      }, debounceMs);
    };

    // Check on initial load
    setIsMobile(detectMobile());

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [debounceMs]);

  return isMobile;
};

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  // Use the improved mobile detection hook
  const isMobile = useMobileDetection();

  // Update current route when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <div className=" ">
      {/* Conditional Navbar Rendering */}
      {isMobile ? (
        <NavbarMobile
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          navigate={navigate}
        />
      ) : (
        <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />
      )}

      {/* Main Content Area */}
      <main className="pt-[67px]">
        {/* Add padding-top to account for fixed navbar */}
        {/* Content Container */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

export default DefaultLayout;
