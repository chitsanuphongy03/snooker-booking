import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AlertProvider } from './context/AlertProvider'
import { Loading } from './components/ui/Loading'
import { NotFoundPage } from './pages/NotFoundPage'

// Lazy load customer pages
const CustomerLayout = lazy(() => import('./components/layout/CustomerLayout').then(m => ({ default: m.CustomerLayout })))
const HomePage = lazy(() => import('./pages/customer/HomePage').then(m => ({ default: m.HomePage })))
const TablesPage = lazy(() => import('./pages/customer/TablesPage').then(m => ({ default: m.TablesPage })))
const BookingPage = lazy(() => import('./pages/customer/BookingPage').then(m => ({ default: m.BookingPage })))
const BookingStatusPage = lazy(() => import('./pages/customer/BookingStatusPage').then(m => ({ default: m.BookingStatusPage })))


// Lazy load admin pages
const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })))
const BookingsManagement = lazy(() => import('./pages/admin/BookingsManagement').then(m => ({ default: m.BookingsManagement })))
const TablesManagement = lazy(() => import('./pages/admin/TablesManagement').then(m => ({ default: m.TablesManagement })))
const LoginPage = lazy(() => import('./pages/admin/LoginPage').then(m => ({ default: m.LoginPage })))
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })))

// Lazy load reports page (Phase 3)
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ScanPage = lazy(() => import('./pages/admin/ScanPage').then(m => ({ default: m.ScanPage })))
const AdminBookingDetailPage = lazy(() => import('./pages/admin/AdminBookingDetailPage').then(m => ({ default: m.AdminBookingDetailPage })))

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/check" element={<BookingStatusPage />} />
              <Route path="/check" element={<BookingStatusPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tables" element={<TablesManagement />} />
              <Route path="/admin/bookings" element={<BookingsManagement />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/scan" element={<ScanPage />} />
              <Route path="/admin/bookings/:id" element={<AdminBookingDetailPage />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AlertProvider>
  )
}

export default App
