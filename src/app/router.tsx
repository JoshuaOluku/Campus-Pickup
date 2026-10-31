import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import CampusSelectPage from '../features/campuses/CampusSelectPage'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import VendorListPage from '../features/vendors/VendorListPage'
import VendorDashboard from '../features/vendors/VendorDashboard'
import VendorMenuPage from '../features/catalog/VendorMenuPage'
import CartReviewPage from '../features/cart/CartReviewPage'
import PaymentPage from '../features/checkout/PaymentPage'
import OrderTrackingPage from '../features/orders/OrderTrackingPage'
import AdminDashboard from '../features/admin/AdminDashboard'

export const router = createBrowserRouter([
  { 
    path: '/login', 
    element: <LoginPage /> 
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <CampusSelectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <VendorListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendor',
    element: (
      <ProtectedRoute>
        <VendorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendor/:slug',
    element: (
      <ProtectedRoute>
        <VendorMenuPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute>
        <CartReviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment/:orderId',
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <OrderTrackingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
])