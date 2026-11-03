import { Navigate, Route, Routes } from 'react-router-dom'
import { useDirectoryData } from './data/useDirectoryData.js'
import ApplicationLayout from './layouts/ApplicationLayout.jsx'
import SignInPage from './pages/auth/SignInPage.jsx'
import CreateAccountPage from './pages/auth/CreateAccountPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import WorkOrdersLayout from './pages/work-orders/WorkOrdersLayout.jsx'
import WorkOrdersPage from './pages/work-orders/WorkOrdersPage.jsx'
import CreateWorkOrderPage from './pages/work-orders/CreateWorkOrderPage.jsx'
import EditWorkOrderPage from './pages/work-orders/EditWorkOrderPage.jsx'
import WorkOrderDetailsPage from './pages/work-orders/WorkOrderDetailsPage.jsx'
import WorkOrdersKanbanPage from './pages/work-orders/WorkOrdersKanbanPage.jsx'
import CustomersPage from './pages/customers/CustomersPage.jsx'
import CustomerDetailsPage from './pages/customers/CustomerDetailsPage.jsx'
import CustomerFormPage from './pages/customers/CustomerFormPage.jsx'
import SitesPage from './pages/sites/SitesPage.jsx'
import SiteDetailsPage from './pages/sites/SiteDetailsPage.jsx'
import SiteFormPage from './pages/sites/SiteFormPage.jsx'
import TechniciansPage from './pages/technicians/TechniciansPage.jsx'
import TechnicianDetailsPage from './pages/technicians/TechnicianDetailsPage.jsx'
import TechnicianFormPage from './pages/technicians/TechnicianFormPage.jsx'
import TechnicianFieldWorkflowPage from './pages/technicians/TechnicianFieldWorkflowPage.jsx'
import TechnicianFieldJobDetailsPage from './pages/technicians/TechnicianFieldJobDetailsPage.jsx'
import ReportsPage from './pages/reports/ReportsPage.jsx'
import CustomerPortalLayout from './pages/portal/CustomerPortalLayout.jsx'
import PortalHomePage from './pages/portal/PortalHomePage.jsx'
import PortalWorkOrdersPage from './pages/portal/PortalWorkOrdersPage.jsx'
import PortalWorkOrderDetailsPage from './pages/portal/PortalWorkOrderDetailsPage.jsx'
import PortalServiceRequestPage from './pages/portal/PortalServiceRequestPage.jsx'
import PortalProfilePage from './pages/portal/PortalProfilePage.jsx'
import UserManagementPage from './pages/users/UserManagementPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import DirectoryDataProvider from './data/DirectoryDataProvider.jsx'
import './App.css'

function ProtectedRoutes() {
  const { isAuthenticated } = useDirectoryData()

  return (
    <Routes>
      <Route element={isAuthenticated ? <ApplicationLayout /> : <Navigate to="/sign-in" replace />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/work-orders" element={<WorkOrdersLayout />}>
          <Route index element={<WorkOrdersPage />} />
          <Route path="new" element={<CreateWorkOrderPage />} />
          <Route path="kanban" element={<WorkOrdersKanbanPage />} />
          <Route path=":workOrderId/edit" element={<EditWorkOrderPage />} />
          <Route path=":workOrderId" element={<WorkOrderDetailsPage />} />
        </Route>
        <Route path="/customers">
          <Route index element={<CustomersPage />} />
          <Route path="new" element={<CustomerFormPage />} />
          <Route path=":customerId/edit" element={<CustomerFormPage />} />
          <Route path=":customerId" element={<CustomerDetailsPage />} />
        </Route>
        <Route path="/sites">
          <Route index element={<SitesPage />} />
          <Route path="new" element={<SiteFormPage />} />
          <Route path=":siteId/edit" element={<SiteFormPage />} />
          <Route path=":siteId" element={<SiteDetailsPage />} />
        </Route>
        <Route path="/technicians">
          <Route index element={<TechniciansPage />} />
          <Route path="field-workflow" element={<TechnicianFieldWorkflowPage />} />
          <Route path="field-workflow/:workOrderId" element={<TechnicianFieldJobDetailsPage />} />
          <Route path="new" element={<TechnicianFormPage />} />
          <Route path=":technicianId/edit" element={<TechnicianFormPage />} />
          <Route path=":technicianId" element={<TechnicianDetailsPage />} />
        </Route>
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/portal" element={<CustomerPortalLayout />}>
          <Route index element={<PortalHomePage />} />
          <Route path="work-orders" element={<PortalWorkOrdersPage />} />
          <Route path="work-orders/:workOrderId" element={<PortalWorkOrderDetailsPage />} />
          <Route path="new-request" element={<PortalServiceRequestPage />} />
          <Route path="profile" element={<PortalProfilePage />} />
        </Route>
      </Route>
      <Route path="/sign-in" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignInPage />} />
      <Route path="/create-account" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <CreateAccountPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/sign-in'} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <DirectoryDataProvider>
      <ProtectedRoutes />
    </DirectoryDataProvider>
  )
}

export default App
