import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import PageTitle from "./components/PageTitle";
import HomePage from "./pages/Home/HomePage";
import DataAssetPage from "./pages/DataAsset/DataAssetPage/DataAssetPage";
import MTUMonitoringPage from "./pages/DataAsset/DataAssetPage/MTUMonitoringPage";
import MTUPenggantiPage from "./pages/DataAsset/DataAssetPage/MTUPenggantiPage";

// Main App Content Component (needs to be inside Router to use hooks)
function AppContent() {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  // Update current route when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <PageTitle title="UPT Bekasi" />
            <HomePage />
          </>
        }
      />
      <Route
        path="/data-asset/dataasset"
        element={
          <>
            <PageTitle title="UPT Bekasi - Data Asset" />
            <DataAssetPage />
          </>
        }
      />
      <Route
        path="/data-asset/datakaryawan"
        element={
          <>
            <PageTitle title="UPT Bekasi - Data Karyawan" />
            {/* <DataKaryawanPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Data Karyawan Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/data-asset/mtu/monitoringkondisi"
        element={
          <>
            <PageTitle title="UPT Bekasi - MTU Monitoring" />
            <MTUMonitoringPage />
          </>
        }
      />
      <Route
        path="/data-asset/mtu/penggantian"
        element={
          <>
            <PageTitle title="UPT Bekasi - MTU Penggantian" />
            <MTUPenggantiPage />
          </>
        }
      />
      <Route
        path="/data-asset/tower/kritis"
        element={
          <>
            <PageTitle title="UPT Bekasi - Tower Kritis" />
            {/* <TowerKritisPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Tower Kritis Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/data-asset/tower/rowkritis"
        element={
          <>
            <PageTitle title="UPT Bekasi - Row Kritis" />
            {/* <RowKritisPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Row Kritis Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/data-asset/sld"
        element={
          <>
            <PageTitle title="UPT Bekasi - SLD" />
            {/* <SLDPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">SLD Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/data-asset/slo"
        element={
          <>
            <PageTitle title="UPT Bekasi - SLO" />
            {/* <SLOPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">SLO Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/performance"
        element={
          <>
            <PageTitle title="UPT Bekasi - Performance" />
            {/* <PerformancePage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Performance Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/performance/rekapanomali"
        element={
          <>
            <PageTitle title="UPT Bekasi - Rekap Anomali" />
            {/* <RekapAnomaliPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Rekap Anomali Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/performance/persentasianimali"
        element={
          <>
            <PageTitle title="UPT Bekasi - Persentasi Anomali" />
            {/* <PersentasiAnomaliPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">
                Persentasi Anomali UPT Page
              </h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/kinerja"
        element={
          <>
            <PageTitle title="UPT Bekasi - Kinerja" />
            {/* <KinerjaPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Kinerja Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/kinerja/upt"
        element={
          <>
            <PageTitle title="UPT Bekasi - Kinerja UPT" />
            {/* <KinerjaUPTPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Kinerja UPT Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/kinerja/ultg"
        element={
          <>
            <PageTitle title="UPT Bekasi - Kinerja ULTG" />
            {/* <KinerjaULTGPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Kinerja ULTG Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/monitoring"
        element={
          <>
            <PageTitle title="UPT Bekasi - Monitoring" />
            {/* <MonitoringPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Monitoring Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/monitoring/lead-measure"
        element={
          <>
            <PageTitle title="UPT Bekasi - Lead Measure" />
            {/* <LeadMeasurePage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Lead Measure Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      <Route
        path="/monitoring/anggaran"
        element={
          <>
            <PageTitle title="UPT Bekasi - Anggaran" />
            {/* <AnggaranPage /> */}
            <div className="p-8">
              <h1 className="text-2xl font-bold">Anggaran Page</h1>
              <p>Current route: {currentRoute}</p>
            </div>
          </>
        }
      />
      {/* Catch-all route for 404 */}
      <Route
        path="*"
        element={
          <div className="p-8">
            <h1 className="text-2xl font-bold text-red-600">
              404 - Page Not Found
            </h1>
            <p>The page you're looking for doesn't exist.</p>
            <p>Current route: {currentRoute}</p>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
