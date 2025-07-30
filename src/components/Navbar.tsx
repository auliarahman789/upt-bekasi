import React, { useState, useEffect } from "react";

// Navbar Component
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  hasChildren?: boolean;
  children?: MenuItem[];
}

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const menuItems: MenuItem[] = [
    {
      id: "home",
      label: "HOME",
      icon: "Home.svg",
      route: "/",
    },
    {
      id: "data-asset",
      label: "DATA ASSET",
      icon: "dataAsset.svg",
      route: "/data-asset",
      hasChildren: true,
      children: [
        {
          id: "data-1",
          label: "Data 1",
          icon: "",
          route: "/data-asset/data-1",
        },
        {
          id: "data-2",
          label: "Data 2",
          icon: "",
          route: "/data-asset/data-2",
        },
      ],
    },
    {
      id: "single-line",
      label: "SINGLE LINE DIAGRAM",
      icon: "singleline.svg",
      route: "/single-line",
    },
    {
      id: "historical",
      label: "HISTORICAL",
      icon: "historycal.svg",
      route: "/historical",
      hasChildren: true,
      children: [
        {
          id: "hist-1",
          label: "History 1",
          icon: "",
          route: "/historical/hist-1",
        },
        {
          id: "hist-2",
          label: "History 2",
          icon: "",
          route: "/historical/hist-2",
        },
      ],
    },
    {
      id: "kinerja",
      label: "KINERJA UPT",
      icon: "kinerja.svg",
      route: "/kinerja",
      hasChildren: true,
      children: [
        {
          id: "kinerja-1",
          label: "Kinerja 1",
          icon: "",
          route: "/kinerja/kinerja-1",
        },
        {
          id: "kinerja-2",
          label: "Kinerja 2",
          icon: "",
          route: "/kinerja/kinerja-2",
        },
      ],
    },
    {
      id: "lead-measure",
      label: "LEAD MEASURE",
      icon: "leadmeasure.svg",
      route: "/lead-measure",
      hasChildren: true,
      children: [
        {
          id: "lead-1",
          label: "Lead 1",
          icon: "",
          route: "/lead-measure/lead-1",
        },
        {
          id: "lead-2",
          label: "Lead 2",
          icon: "",
          route: "/lead-measure/lead-2",
        },
      ],
    },
    {
      id: "statistik",
      label: "STATISTIK GANGGUAN",
      icon: "statistikgangguan.svg",
      route: "/statistik",
      hasChildren: true,
      children: [
        {
          id: "stat-1",
          label: "Statistik 1",
          icon: "",
          route: "/statistik/stat-1",
        },
        {
          id: "stat-2",
          label: "Statistik 2",
          icon: "",
          route: "/statistik/stat-2",
        },
      ],
    },
    {
      id: "pengelola",
      label: "PENGELOLA ANGGARAN",
      icon: "anggaran.svg",
      route: "/pengelola",
      hasChildren: true,
      children: [
        {
          id: "pengelola-1",
          label: "Anggaran 1",
          icon: "",
          route: "/pengelola/anggran-1",
        },
        {
          id: "pengelola-2",
          label: "Anggaran 2",
          icon: "",
          route: "/pengelola/anggaran-2",
        },
      ],
    },
  ];

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down (after scrolling past 100px)
      else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
        setOpenDropdown(null); // Close any open dropdowns when hiding
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
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
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.hasChildren) {
      toggleDropdown(item.id);
    } else {
      onRouteChange(item.route);
      setOpenDropdown(null);
    }
  };

  const isActive = (route: string) => currentRoute === route;

  // Check if any child of a parent menu is active
  const isChildActive = (item: MenuItem) => {
    if (!item.hasChildren || !item.children) return false;
    return item.children.some((child) => currentRoute === child.route);
  };

  // Check if parent or any child is active
  const isParentOrChildActive = (item: MenuItem) => {
    return isActive(item.route) || isChildActive(item);
  };

  return (
    <div
      className={`fixed top-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav
        className="bg-cover bg-center bg-no-repeat h-[67px] backdrop-blur-sm mr-3"
        style={{
          backgroundImage: "url('bgNav.svg')",
        }}
      >
        <div className="w-full px-3">
          <div className="flex items-center h-12">
            {/* Menu Items */}
            <div className="flex space-x-1">
              {menuItems.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`flex flex-col items-center px-3 py-3 text-xs font-bold transition-colors duration-200 h-14 relative ${
                      isParentOrChildActive(item)
                        ? "text-white"
                        : "text-white hover:bg-teal-500/30"
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-1">
                      <img
                        className={`w-5 h-5 ${
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

                    <div className="whitespace-nowrap tracking-wide flex items-center justify-center gap-1">
                      <span
                        className={`text-[10px] font-semibold ${
                          isParentOrChildActive(item)
                            ? "text-yellow-400"
                            : "text-white"
                        }`}
                      >
                        {item.label}
                      </span>

                      {item.hasChildren && (
                        <div className="ml-1">
                          <img
                            className={`w-[7px] h-[7px] transition-transform duration-200 ${
                              openDropdown === item.id ? "rotate-90" : ""
                            } ${
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
                            src="/Polygon 1.svg"
                            alt="dropdown arrow"
                          />
                        </div>
                      )}
                    </div>

                    {/* Active indicator bar */}
                    {isParentOrChildActive(item) && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"></div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.hasChildren && openDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-b-md shadow-lg z-50 border-t-2 border-yellow-400">
                      <div className="py-1">
                        {item.children?.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              onRouteChange(child.route);
                              setOpenDropdown(null);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              isActive(child.route)
                                ? "bg-yellow-400 text-gray-900 font-bold"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Admin Header Section - positioned after menu items */}
            <div className="flex items-center ml-30">
              {/* User Info */}
              <div className="flex flex-col mr-3">
                <span className="text-white font-light text-sm">
                  Aksa Apriyanto
                </span>
                <span className="text-white text-right text-xs font-semibold">
                  ADMIN
                </span>
              </div>

              {/* User Avatar */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
