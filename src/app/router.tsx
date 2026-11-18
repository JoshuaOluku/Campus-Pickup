import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import CampusSelectPage from '../features/campuses/CampusSelectPage'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import VendorListPage from '../features/vendors/VendorListPage'
import VendorDashboard from '../features/vendors/VendorDashboard'
import VendorMenuPage from '../features/catalog/VendorMenuPage'
import CartReviewPage from '../features/cart/CartReviewPage'
import OrderTrackingPage from '../features/orders/OrderTrackingPage'
import AdminDashboard from '../features/admin/AdminDashboard'

export const router = createBrowserRouter([

  {
    path: '/vendor-portal',
    lazy: async () => {
      const module = await import('../features/vendors/VendorPortal')
      return { Component: module.VendorPortalEntry }
    },
  },
  {
    path: '/vendor-portal/dashboard',
    lazy: async () => {
      const module = await import('../features/vendors/VendorPortal')
      return { Component: module.VendorPortalDashboard }
    },
  },

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