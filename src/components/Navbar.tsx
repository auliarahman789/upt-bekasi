import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuItems, MenuItem } from "../config/menuItems";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, login } = useAuth(); // Move useAuth to top level
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [openSubSubDropdown, setOpenSubSubDropdown] = useState<string | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get visible menu items based on auth state
  const getVisibleMenuItems = () => {
    if (!isAuthenticated) {
      return menuItems.filter((item) => item.id === "home");
    }
    return menuItems;
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
        setOpenDropdown(null);
        setOpenSubDropdown(null);
        setOpenSubSubDropdown(null);
        setShowProfileDropdown(false);
      }

      setLastScrollY(currentScrollY);
    };

    let timeoutId: number;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  const toggleDropdown = (menuId: string) => {
    setOpenDropdown((prev) => (prev === menuId ? null : menuId));
    setOpenSubDropdown(null);
    setOpenSubSubDropdown(null);
    setShowProfileDropdown(false);
  };

  const toggleSubDropdown = (subMenuId: string) => {
    setOpenSubDropdown((prev) => (prev === subMenuId ? null : subMenuId));
    setOpenSubSubDropdown(null);
  };

  const toggleSubSubDropdown = (subSubMenuId: string) => {
    setOpenSubSubDropdown((prev) =>
      prev === subSubMenuId ? null : subSubMenuId
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      await login(loginData.email, loginData.password);
      // If we get here, login was successful
      setShowLoginForm(false);
      setLoginData({ email: "", password: "" });
    } catch (error: any) {
      console.error("Login error:", error);

      // Only set error if it's actually an error (not a success message)
      if (error?.message && !error.message.toLowerCase().includes("success")) {
        setLoginError(error.message);
      } else {
        // Login might have succeeded despite the error
        setShowLoginForm(false);
        setLoginData({ email: "", password: "" });
      }
    } finally {
      setLoginLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.hasChildren) {
      toggleDropdown(item.id);
    } else if (item.route && item.route.trim() !== "") {
      navigate(item.route);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
    }
  };

  const handleChildClick = (child: MenuItem) => {
    if (child.hasChildren) {
      toggleSubDropdown(child.id);
    } else if (child.route && child.route.trim() !== "") {
      navigate(child.route);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
    }
  };

  const handleSubChildClick = (subChild: MenuItem) => {
    if (subChild.hasChildren) {
      toggleSubSubDropdown(subChild.id);
    } else if (subChild.route && subChild.route.trim() !== "") {
      navigate(subChild.route);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
    }
  };

  const isActive = (route?: string) =>
    route && route.trim() !== "" && currentRoute === route;

  const isChildActive = (item: MenuItem): boolean => {
    if (!item.hasChildren || !item.children) return false;
    return item.children.some((child) => {
      if (child.route && currentRoute === child.route) return true;
      return isChildActive(child);
    });
  };

  const isParentOrChildActive = (item: MenuItem) => {
    return isActive(item.route) || isChildActive(item);
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <div
      className={`fixed top-0 z-[1000] w-full transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav
        className="bg-cover bg-center bg-no-repeat h-[67px] backdrop-blur-sm mr-3 relative"
        style={{
          backgroundImage: "url('/bgNav.svg')",
        }}
      >
        {/* Logo - Only visible on desktop */}
        <div className="hidden lg:flex absolute left-4 top-1/3 transform -translate-y-1/2 z-10">
          <img
            src="/danantara.svg"
            alt="Danantara Indonesia"
            className="pl-4"
          />
        </div>

        <div className="w-full px-3">
          <div className="flex items-center justify-between h-12 lg:justify-center">
            {/* Menu Items */}
            <div className="flex space-x-[36px] items-center">
              {visibleMenuItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`flex items-center justify-center py-3 text-xs font-bold transition-all duration-300 h-14 relative overflow-hidden
                      w-12
                      group-hover:w-auto group-hover:px-3 group-hover:justify-start
                      ${
                        openDropdown === item.id
                          ? "w-auto px-3 justify-start"
                          : ""
                      }
                      ${
                        isParentOrChildActive(item)
                          ? "text-white"
                          : "text-white hover:bg-[#155C72]"
                      }`}
                  >
                    {isParentOrChildActive(item) && (
                      <div className="absolute top-0 left-0 right-0 h-[6px] bg-yellow-400"></div>
                    )}

                    <div className="flex items-center justify-center flex-shrink-0">
                      <img
                        className={`w-6 h-6 ${
                          isParentOrChildActive(item)
                            ? "filter brightness-0 saturate-100"
                            : ""
                        }`}
                        style={
                          isParentOrChildActive(item)
                            ? {
                                filter:
                                  "brightness(0) saturate(100%) invert(84%) sepia(68%) saturate(346%) hue-rotate(1deg) brightness(106%) contrast(106%)",
                              }
                            : {}
                        }
                        src={item.icon}
                        alt={item.label}
                      />
                    </div>

                    <div
                      className={`whitespace-nowrap tracking-wide flex items-center ml-2 transition-all duration-300
                      ${
                        openDropdown === item.id || false
                          ? "block"
                          : "hidden group-hover:block"
                      }
                    `}
                    >
                      <span
                        className={`font-semibold ${
                          isParentOrChildActive(item)
                            ? "text-yellow-400"
                            : "text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown menus (same as before) */}
                  {item.hasChildren && openDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-0 w-56 bg-[#145C72] rounded-b-md shadow-lg z-50 border-t-2 border-yellow-400">
                      <div className="py-1">
                        {item.children?.map((child) => (
                          <div key={child.id} className="relative">
                            <button
                              onClick={() => handleChildClick(child)}
                              className={`flex items-center justify-between w-full text-left px-4 py-3 text-[16px] font-bold transition-colors duration-200 ${
                                isActive(child.route)
                                  ? "bg-yellow-400 text-white"
                                  : "text-white hover:bg-yellow-300 hover:text-black"
                              }`}
                            >
                              <span>{child.label}</span>
                              {child.hasChildren && (
                                <svg
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    openSubDropdown === child.id
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              )}
                            </button>

                            {child.hasChildren &&
                              openSubDropdown === child.id && (
                                <div className="absolute left-full top-0 w-56 bg-[#145C72] rounded-r-md shadow-lg border-l-2 border-yellow-400">
                                  <div className="py-1">
                                    {child.children?.map((subChild) => (
                                      <div
                                        key={subChild.id}
                                        className="relative"
                                      >
                                        <button
                                          onClick={() =>
                                            handleSubChildClick(subChild)
                                          }
                                          className={`flex items-center justify-between w-full text-left px-4 py-3 text-[16px] font-bold transition-colors duration-200 ${
                                            isActive(subChild.route)
                                              ? "bg-yellow-400 text-white"
                                              : "text-white hover:bg-yellow-300 hover:text-black"
                                          }`}
                                        >
                                          <span>{subChild.label}</span>
                                          {subChild.hasChildren && (
                                            <svg
                                              className={`w-4 h-4 transition-transform duration-200 ${
                                                openSubSubDropdown ===
                                                subChild.id
                                                  ? "rotate-90"
                                                  : ""
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                              />
                                            </svg>
                                          )}
                                        </button>

                                        {subChild.hasChildren &&
                                          openSubSubDropdown ===
                                            subChild.id && (
                                            <div className="absolute left-full top-0 w-52 bg-[#145C72] rounded-r-md shadow-lg border-l-2 border-yellow-400">
                                              <div className="py-1">
                                                {subChild.children?.map(
                                                  (subSubChild) => (
                                                    <button
                                                      key={subSubChild.id}
                                                      onClick={() => {
                                                        if (
                                                          subSubChild.route &&
                                                          subSubChild.route.trim() !==
                                                            ""
                                                        ) {
                                                          navigate(
                                                            subSubChild.route
                                                          );
                                                          setOpenDropdown(null);
                                                          setOpenSubDropdown(
                                                            null
                                                          );
                                                          setOpenSubSubDropdown(
                                                            null
                                                          );
                                                        }
                                                      }}
                                                      className={`block w-full text-left px-4 py-3 text-[16px] font-bold transition-colors duration-200 ${
                                                        isActive(
                                                          subSubChild.route
                                                        )
                                                          ? "bg-yellow-400 text-white"
                                                          : "text-white hover:bg-yellow-300 hover:text-black"
                                                      }`}
                                                    >
                                                      {subSubChild.label}
                                                    </button>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side - Login/Profile */}
            <div className="flex items-center space-x-4 px-8">
              {!isAuthenticated ? (
                // Login Section
                <div className="flex items-center space-x-2 relative">
                  {showLoginForm ? (
                    <form
                      onSubmit={handleLogin}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="email"
                        placeholder="Insert Email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        className="px-4 py-2 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                        disabled={loginLoading}
                      />
                      <input
                        type="password"
                        placeholder="Insert Password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        className="px-4 py-2 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                        disabled={loginLoading}
                      />
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loginLoading ? "LOGIN..." : "LOGIN"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginForm(false);
                          setLoginError(null);
                        }}
                        disabled={loginLoading}
                        className="px-4 py-2 text-white hover:text-yellow-400 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-full bg-yellow-300">
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                          showLoginForm
                            ? "bg-yellow-400 text-white"
                            : "bg-transparent text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 transform rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Error message */}
                  {loginError && showLoginForm && (
                    <div className="absolute top-full right-0 mt-2 p-2 bg-red-500 text-white text-sm rounded shadow-lg z-50">
                      {loginError}
                    </div>
                  )}
                </div>
              ) : (
                // Profile Section
                <div className="relative p-4">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 px-4 py-2  text-white font-bold rounded transition-colors duration-200 hover:bg-[#1a6b82]"
                  >
                    <img src="/account.svg" alt="Account" className="w-6 h-6" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#155C72] rounded-md shadow-lg z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-white border-b border-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white rounded-full"></div>
                            <div>
                              <div className="font-semibold">{user?.nama}</div>
                              <div className="text-sm text-gray-300">
                                {user?.role?.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {user?.role === "super admin" && (
                          <button
                            onClick={() => {
                              navigate("/admin");
                              setShowProfileDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200"
                          >
                            Admin Panel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowProfileDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200"
                        >
                          Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-400 hover:text-white transition-colors duration-200"
                        >
                          LOGOUT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
