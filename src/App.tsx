import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PageTitle from "./components/PageTitle";

// Import your existing pages
import HomePage from "./pages/Home/HomePage";
import DataAssetPage from "./pages/DataAsset/DataAssetPage/DataAssetPage";
import MTUMonitoringPage from "./pages/DataAsset/DataAssetPage/MTUMonitoringPage";
import MTUPenggantiPage from "./pages/DataAsset/DataAssetPage/MTUPenggantiPage";
import KinerjaUptPage from "./pages/Kinerja/KinerjaUptPage";
import RekapAnomaliPage from "./pages/Performance/RekapAnomaliPage";
import LevelHSSEPage from "./pages/Monitoring/HSSE/LevelHSSEPage";
import PeralatanDanSaranaPage from "./pages/Monitoring/HSSE/PeralatanDanSaranaPage";
import PersentasiAnomaliPage from "./pages/Performance/PersentasiAnomaliPage";
import AdkonPage from "./pages/Monitoring/Konstruksi/AdkonPage";
import AnggaranPage from "./pages/Monitoring/AnggaranPage";
import DataKaryawanPage from "./pages/DataAsset/DataKaryawan/DataKaryawanPage";
import SLDPage from "./pages/DataAsset/SLD/SLDPage";
import JadwalK3 from "./pages/Monitoring/HSSE/JadwalK3";
import SLOPage from "./pages/DataAsset/SLO/SLOPage";
import Logistik from "./pages/Monitoring/Konstruksi/Logistik";
import TowerKritisPage from "./pages/DataAsset/Tower/TowerKritisPage";
import SustainabilityPage from "./pages/Monitoring/HSSE/Sustainability";

// New pages for auth system
import ProfilePage from "../src/pages/Profile/ProfilePage";
import AdminPanel from "../src/pages/Admin/AdminPanel";
import LoginPage from "../src/pages/Auth/LoginPage";
import ROWKritisPage from "./pages/DataAsset/Tower/ROWKritisPage";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page or home, preserving the intended destination
      navigate("/", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      // User doesn't have required role, redirect to home
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

// Main App Content Component
function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <>
            <PageTitle title="UPT Bekasi" />
            <HomePage />
          </>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <>
            <PageTitle title="UPT Bekasi - Login" />
            <LoginPage />
          </>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Profile" />
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="super admin">
            <PageTitle title="UPT Bekasi - Admin Panel" />
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Protected Data Asset Routes */}
      <Route
        path="/data-asset/dataasset"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Data Asset" />
            <DataAssetPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/datakaryawan"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Data Karyawan" />
            <DataKaryawanPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/mtu/monitoringkondisi"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - MTU Monitoring" />
            <MTUMonitoringPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/mtu/penggantian"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - MTU Penggantian" />
            <MTUPenggantiPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/tower/kritis"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Tower Kritis" />
            <TowerKritisPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/tower/rowkritis"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Row Kritis" />
            <ROWKritisPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/sld"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - SLD" />
            <SLDPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-asset/slo"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - SLO" />
            <SLOPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Performance Routes */}
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Performance" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">Performance Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance/rekapanomali"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Rekap Anomali" />
            <RekapAnomaliPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance/persentasianimali"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Persentasi Anomali" />
            <PersentasiAnomaliPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Kinerja Routes */}
      <Route
        path="/kinerja"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Kinerja" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">Kinerja Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kinerja/upt"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Kinerja UPT" />
            <KinerjaUptPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kinerja/ultg"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Kinerja ULTG" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">Kinerja ULTG Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Protected Monitoring Routes */}
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Monitoring" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">Monitoring Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/lead-measure"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Lead Measure" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">Lead Measure Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/anggaran"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Anggaran" />
            <AnggaranPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/konstruksi/adkondalkon"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Adkon Dalkon" />
            <AdkonPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/konstruksi/logistik/monitoringgudang"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Logistik" />
            <Logistik />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/konstruksi/logistik/sigesit"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - SIGESIT" />
            <div className="p-8">
              <h1 className="text-2xl font-bold">SIGESIT Page</h1>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/hsse/jadwalk3"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Jadwal Pekerjaan K3" />
            <JadwalK3 />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/hsse/perandsar"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Peralatan Dan Sarana" />
            <PeralatanDanSaranaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/hsse/levelhsse"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Maturing Level HSSE" />
            <LevelHSSEPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring/hsse/sustainability"
        element={
          <ProtectedRoute>
            <PageTitle title="UPT Bekasi - Maturing Level Sustainability" />
            <SustainabilityPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <>
            <PageTitle title="UPT Bekasi - Page Not Found" />
            <div className="p-8 min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
