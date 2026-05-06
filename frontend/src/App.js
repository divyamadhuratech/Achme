import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider,useAuth } from "./auth/AuthContext";

/* AUTH */
import Login from "./auth/login";
import Register from "./auth/register";

/* LAYOUT */
import DashboardLayout from "./layout/dashboarlayout";

/* DASHBOARDS */
import AdminDashboard from "./dashboards/admindashboard";
import UserDashboard from "./dashboards/userdashboard";

/* PAGES */
import Telecall from "./pages/telecalling";
import Walkins from "./pages/walkins";
import Fields from "./pages/field";
import Proposals from "./pages/proposal";
import Task from "./pages/task";
import Invoicepage from "./pages/invoice";
import Payments from "./pages/payment";
import Estimate  from "./pages/estimate";
import EstimateInvoice from "./pages/estimateinvoice";
import ServiceEstimation from "./pages/serviceestimation";
import CallReport from "./pages/callreport";
import Contracts from "./pages/contract";
import Team from "./pages/teammember";
import Products from "./pages/products";
import FollowupList from "./components/followuplist";
import Clients from "./pages/clients";
import PerformaInvoice from "./pages/performainvoice";
import Reports from "./pages/reports";
import InvoicePreview from "./pages/invoicepreview";
import AdminNotifications from "./pages/adminnotifications";

export default function App() {
  return (
    <AuthProvider> {/*  CRITICAL: Must wrap everything */}
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PDF PREVIEW — no auth, no layout, used by Puppeteer */}
          <Route path="/invoice-preview/:type/:id" element={<InvoicePreview />} />

          {/* PROTECTED */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRouter />} />
            
            <Route path="telecalling" element={<Telecall />} />
            <Route path="walkins" element={<Walkins />} />
            <Route path="field" element={<Fields />} />
               <Route path="products" element={<Products />} />
            <Route path="proposal" element={<Proposals />} />
            <Route path="task" element={<Task />} />
           <Route path="invoice" element={<Invoicepage/>} />
          <Route path="payments" element={< Payments/>} />
          <Route path="estimates" element={< Estimate/>} />
          <Route path="contracts" element={< Contracts/>} />
          <Route path="team" element={< Team/>} />
           <Route path="followupslist" element={<FollowupList />} />
           <Route path="clients" element={<Clients />} />
           <Route path="performainvoice" element={<PerformaInvoice />} />
           <Route path="estimateinvoice" element={<EstimateInvoice />} />
           <Route path="serviceestimation" element={<ServiceEstimation />} />
           <Route path="call-report" element={<CallReport />} />
           <Route path="reports" element={<Reports />} />
           <Route path="notifications" element={<AdminNotifications />} />
           
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard />;
}
