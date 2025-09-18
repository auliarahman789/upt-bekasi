import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuItems, MenuItem } from "../config/menuItems";
import { useAuth } from "../context/AuthContext";

interface NavbarMobileProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({
  currentRoute,
  onRouteChange,
}) => {
  const navigate = useNavigate(); // Use the hook directly
  const { user, isAuthenticated, logout, login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get visible menu items based on auth state
  const getVisibleMenuItems = () => {
    if (!isAuthenticated) {
      return menuItems.filter((item) => item.id === "home");
    }
    return [
      ...menuItems,
      {
        id: "profile",
        label: "PROFILE",
        icon: "/account.svg",
        hasChildren: true,
      },
    ];
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        const burgerButton = document.querySelector(
          '[aria-label="Toggle menu"]'
        );
        if (burgerButton && !burgerButton.contains(target)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    // Clear login error when opening/closing menu
    setLoginError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      await login(loginData.email, loginData.password);
      setLoginData({ email: "", password: "" });
      setIsMenuOpen(false); // Close menu on successful login
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.id === "profile") {
      setExpandedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.hasChildren) {
      setExpandedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.route) {
      navigate(item.route);
      onRouteChange(item.route);
      setIsMenuOpen(false);
      setExpandedItems([]);
    }
  };

  const isItemExpanded = (itemId: string) => expandedItems.includes(itemId);

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = currentRoute === item.route;
    const hasChildren = item.hasChildren && item.children;
    const isExpanded = isItemExpanded(item.id);

    // Special handling for profile menu
    if (item.id === "profile") {
      return (
        <div key={item.id} className={`${level > 0 ? "ml-4" : ""}`}>
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a6b82] transition-colors duration-200`}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center space-x-3">
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <div>
                <div className="text-white font-medium text-sm">
                  {item.label}
                </div>
                <div className="text-xs text-gray-300">{user?.nama}</div>
              </div>
            </div>
            <div
              className={`transform transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {isExpanded && (
            <div className="bg-[#0f4a5a]">
              {user?.role === "super admin" && (
                <div
                  className="flex items-center px-8 py-3 cursor-pointer hover:bg-[#1a6b82] transition-colors duration-200"
                  onClick={() => {
                    navigate("/admin");
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="text-white font-medium text-sm">
                    Admin Panel
                  </span>
                </div>
              )}
              <div
                className="flex items-center px-8 py-3 cursor-pointer hover:bg-[#1a6b82] transition-colors duration-200"
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
              >
                <span className="text-white font-medium text-sm">Profile</span>
              </div>
              <div
                className="flex items-center px-8 py-3 cursor-pointer hover:bg-red-600 transition-colors duration-200"
                onClick={handleLogout}
              >
                <span className="text-red-400 font-medium text-sm">LOGOUT</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.id} className={`${level > 0 ? "ml-4" : ""}`}>
        <div
          className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a6b82] transition-colors duration-200 ${
            isActive ? "bg-[#1a6b82]" : ""
          }`}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex items-center space-x-3">
            {item.icon && (
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
            )}
            <span className="text-white font-medium text-sm">{item.label}</span>
          </div>
          {hasChildren && (
            <div
              className={`transform transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-[#0f4a5a]">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className="bg-cover bg-center bg-no-repeat h-[56px] backdrop-blur-sm mr-3 relative fixed top-0 left-0 right-0 z-[60]"
        style={{
          backgroundImage: "url('/bgNavMobile.svg')",
        }}
      >
        <div className="flex items-center justify-between h-full px-4">
          {/* Burger Menu Button */}
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-md hover:bg-black/10 transition-colors duration-200 relative z-[70]"
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <div
                className={`w-8 h-1 bg-yellow-400 transition-all duration-300 rounded-2xl ${
                  isMenuOpen ? "transform rotate-45 translate-y-2" : ""
                }`}
              ></div>
              <div
                className={`w-8 h-1 bg-yellow-400 transition-all duration-300 rounded-2xl ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></div>
              <div
                className={`w-6 h-1 bg-yellow-400 transition-all duration-300 rounded-2xl ${
                  isMenuOpen ? "transform -rotate-45 -translate-y-2 w-8" : ""
                }`}
              ></div>
            </div>
          </button>

          {/* Logo or empty space for mobile */}
          <div className="flex items-center">
            {/* You can add a logo here if needed */}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[45] transition-opacity duration-300"
          style={{ top: "67px" }}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Slide-out Menu */}
      <div
        ref={menuRef}
        className={`fixed top-[56px] left-0 h-[calc(100vh-67px)] w-80 bg-[#155C72] z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Login Form for Mobile - Inside Sidebar */}
        {!isAuthenticated && (
          <div className="p-4 border-b border-gray-600 bg-[#134E63]">
            <h3 className="text-white font-semibold mb-3 text-center">LOGIN</h3>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Insert Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                disabled={loginLoading}
              />
              <input
                type="password"
                placeholder="Insert Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                disabled={loginLoading}
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? "LOGGING IN..." : "LOGIN"}
              </button>
              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                  {loginError}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Menu Items */}
        <div className="overflow-y-auto flex-1">
          {visibleMenuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
};

export default NavbarMobile;
