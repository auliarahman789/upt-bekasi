import { useState, useRef, useEffect } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  hasChildren?: boolean;
  children?: MenuItem[];
}

interface NavbarMobileProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  navigate: (route: string) => void; // Pass navigate function from parent
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({
  currentRoute,
  onRouteChange,
  navigate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

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
              route: "/monitoring/konstruksi/logistik",
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        // Make sure we're not clicking on the burger button itself
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
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.hasChildren) {
      // Toggle expanded state for items with children
      setExpandedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.route) {
      // Navigate to route and close menu
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

          {/* Logo/Brand - if you have one */}
          <div className="flex items-center">
            {/* Add your logo here if needed */}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0  z-[45] transition-opacity duration-300"
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
        {/* Menu Items */}
        <div className="overflow-y-auto h-full">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
};

export default NavbarMobile;
