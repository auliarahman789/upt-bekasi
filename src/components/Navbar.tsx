import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Navbar Component
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  hasChildren?: boolean;
  children?: MenuItem[];
}

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [openSubSubDropdown, setOpenSubSubDropdown] = useState<string | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const menuItems: MenuItem[] = [
    {
      id: "home",
      label: "HOME",
      icon: "/Home.svg",
      route: "/",
    },
    {
      id: "data-asset",
      label: "DATA ASSET",
      icon: "/dataAsset.svg",
      hasChildren: true,
      children: [
        {
          id: "data-karyawan",
          label: "DATA KARYAWAN",
          icon: "",
          route: "/data-asset/datakaryawan",
        },
        {
          id: "data-asset-main",
          label: "DATA ASSET",
          icon: "",
          route: "/data-asset/dataasset",
        },
        {
          id: "mtu",
          label: "MTU",
          icon: "",
          hasChildren: true,
          children: [
            {
              id: "mtu-1",
              label: "MONITORING KONDISI",
              icon: "",
              route: "/data-asset/mtu/monitoringkondisi",
            },
            {
              id: "mtu-2",
              label: "PENGGANTIAN",
              icon: "",
              route: "/data-asset/mtu/penggantian",
            },
          ],
        },
        {
          id: "tower",
          label: "TOWER",
          icon: "",
          hasChildren: true,
          children: [
            {
              id: "tower-1",
              label: "KRITIS",
              icon: "",
              route: "/data-asset/tower/kritis",
            },
            {
              id: "tower-2",
              label: "ROW KRITIS",
              icon: "",
              route: "/data-asset/tower/rowkritis",
            },
          ],
        },
        {
          id: "sld",
          label: "SLD",
          icon: "",
          route: "/data-asset/sld",
        },
        {
          id: "slo",
          label: "SLO",
          icon: "",
          route: "/data-asset/slo",
        },
      ],
    },
    {
      id: "performance",
      label: "PERFORMANCE",
      icon: "/kinerja.svg",
      route: "/performance",
      hasChildren: true,
      children: [
        {
          id: "performance-1",
          label: "REKAP ANOMALI",
          icon: "",
          route: "/performance/rekapanomali",
        },
        {
          id: "performance-2",
          label: "PERSENTASI ANOMALI UPT",
          icon: "",
          route: "/performance/persentasianimali",
        },
      ],
    },
    {
      id: "kinerja",
      label: "KINERJA",
      icon: "/Time_progress_fill.svg",
      route: "/kinerja",
      hasChildren: true,
      children: [
        {
          id: "kinerja-1",
          label: "UPT",
          icon: "",
          route: "/kinerja/upt",
        },
        {
          id: "kinerja-2",
          label: "ULTG",
          icon: "",
          route: "/kinerja/ultg",
        },
      ],
    },
    {
      id: "monitoring",
      label: "MONITORING",
      icon: "/monitoring.svg",
      route: "/monitoring",
      hasChildren: true,
      children: [
        {
          id: "monitoring-1",
          label: "LEAD MEASURE",
          icon: "",
          route: "/monitoring/lead-measure",
        },
        {
          id: "monitoring-2",
          label: "ANGGARAN",
          icon: "",
          route: "/monitoring/anggaran",
        },
        {
          id: "monitoring-3",
          label: "KONSTRUKSI",
          icon: "",
          hasChildren: true,
          children: [
            {
              id: "konstruksi-1",
              label: "ADKON DALKON",
              icon: "",
              route: "/monitoring/konstruksi/adkondalkon",
            },
            {
              id: "konstruksi-2",
              label: "LOGISTIK",
              icon: "",
              hasChildren: true,
              children: [
                {
                  id: "konstruksi-2-1",
                  label: "MONITORING GUDANG",
                  icon: "",
                  route: "/monitoring/konstruksi/logistik/monitoringgudang",
                },
                {
                  id: "konstruksi-2-2",
                  label: "SIGESIT",
                  icon: "",
                  route: "/monitoring/konstruksi/logistik/sigesit",
                },
              ],
            },
          ],
        },
        {
          id: "monitoring-4",
          label: "HSSE PERFORMANCE",
          icon: "",
          hasChildren: true,
          children: [
            {
              id: "hsse-1",
              label: "JADWAL PEKERJAAN K3",
              icon: "",
              route: "/monitoring/hsse/jadwalk3",
            },
            {
              id: "hsse-2",
              label: "PERALATAN DAN SARANA",
              icon: "",
              route: "/monitoring/hsse/perandsar",
            },
            {
              id: "hsse-3",
              label: "MATURING LEVEL HSSE",
              icon: "",
              route: "/monitoring/hsse/levelhsse",
            },
            {
              id: "hsse-4",
              label: "MATURING LEVEL SUSTAINABILITY",
              icon: "",
              route: "/monitoring/hsse/sustainability",
            },
          ],
        },
      ],
    },
    {
      id: "akun",
      label: "ACCOUNT",
      icon: "/account.svg",
    },
  ];

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

  const handleMenuClick = (item: MenuItem) => {
    console.log("Menu clicked:", item.label, "Route:", item.route);

    if (item.hasChildren) {
      toggleDropdown(item.id);
    } else if (item.route && item.route.trim() !== "") {
      console.log("Navigating to:", item.route);
      navigate(item.route);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
    }
  };

  const handleChildClick = (child: MenuItem) => {
    console.log("Child menu clicked:", child.label, "Route:", child.route);

    if (child.hasChildren) {
      toggleSubDropdown(child.id);
    } else if (child.route && child.route.trim() !== "") {
      console.log("Navigating to child route:", child.route);
      navigate(child.route);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      setOpenSubSubDropdown(null);
    }
  };

  const handleSubChildClick = (subChild: MenuItem) => {
    console.log("Sub-child clicked:", subChild.label, "Route:", subChild.route);

    if (subChild.hasChildren) {
      toggleSubSubDropdown(subChild.id);
    } else if (subChild.route && subChild.route.trim() !== "") {
      console.log("Navigating to sub-child route:", subChild.route);
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
          <div className="flex items-center justify-center h-12 lg:justify-center">
            <div className="flex space-x-[36px] items-center">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group ">
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
                        className={` font-semibold ${
                          isParentOrChildActive(item)
                            ? "text-yellow-400"
                            : "text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </button>

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
                                                        console.log(
                                                          "Sub-sub-child clicked:",
                                                          subSubChild.label,
                                                          "Route:",
                                                          subSubChild.route
                                                        );
                                                        if (
                                                          subSubChild.route &&
                                                          subSubChild.route.trim() !==
                                                            ""
                                                        ) {
                                                          console.log(
                                                            "Navigating to sub-sub-child route:",
                                                            subSubChild.route
                                                          );
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
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
