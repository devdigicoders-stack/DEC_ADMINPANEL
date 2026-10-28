import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import AdminShell from './components/layout/AdminShell.jsx'
import { VIEW_TO_PATH } from './constants/navigation.js'
import DashboardView from './pages/DashboardView.jsx'
import ServicesManagement from './pages/ServicesManagement.jsx'
import AddServicePage from './pages/AddServicePage.jsx'
import ProjectsManagement from './pages/ProjectsManagement.jsx'
import AddProjectPage from './pages/AddProjectPage.jsx'
import GalleryManagement from './pages/GalleryManagement.jsx'
import UploadImagesPage from './pages/UploadImagesPage.jsx'
import BlogManagement from './pages/BlogManagement.jsx'
import CreateBlogPage from './pages/CreateBlogPage.jsx'
import ContactEnquiries from './pages/ContactEnquiries.jsx'
import CareerApplications from './pages/CareerApplications.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import WebsiteContent from './pages/WebsiteContent.jsx'
import SiteSettingsPage from './pages/SiteSettingsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'

function AdminRoutes() {
  const navigate = useNavigate()

  const handleNavigateView = (view) => {
    const targetPath = VIEW_TO_PATH[view] || `/${view}`
    navigate(targetPath)
  }

  return (
    <AdminShell>
      <Routes>
        {/* 1. Dashboard View */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={<DashboardView onNavigate={handleNavigateView} />}
        />

        {/* 2. Services Management */}
        <Route
          path="/services"
          element={
            <ServicesManagement
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToAdd={() => navigate('/services/add')}
            />
          }
        />
        <Route
          path="/services/add"
          element={
            <AddServicePage
              onNavigateToServices={() => navigate('/services')}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />

        {/* 3. Projects Management */}
        <Route
          path="/projects"
          element={
            <ProjectsManagement
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToAddProject={() => navigate('/projects/add')}
            />
          }
        />
        <Route
          path="/projects/add"
          element={
            <AddProjectPage
              onNavigateToProjects={() => navigate('/projects')}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />

        {/* 4. Gallery Management */}
        <Route
          path="/gallery"
          element={
            <GalleryManagement
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToUpload={() => navigate('/gallery/upload')}
            />
          }
        />
        <Route
          path="/gallery/upload"
          element={
            <UploadImagesPage
              onNavigateToGallery={() => navigate('/gallery')}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />

        {/* 5. Blog Management */}
        <Route
          path="/blog"
          element={
            <BlogManagement
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToCreateBlog={() => navigate('/blog/create')}
              onNavigateToEditBlog={(id) => navigate(`/blog/edit/${id}`)}
            />
          }
        />
        <Route
          path="/blog/create"
          element={
            <CreateBlogPage
              onNavigateToBlog={() => navigate('/blog')}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <CreateBlogPage
              onNavigateToBlog={() => navigate('/blog')}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />

        {/* 6. Contact Enquiries & Messages */}
        <Route
          path="/contact"
          element={
            <ContactEnquiries
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToMessages={() => navigate('/messages')}
              onNavigateToCareers={() => navigate('/careers')}
            />
          }
        />
        <Route path="/enquiries" element={<Navigate to="/contact" replace />} />
        <Route
          path="/careers"
          element={
            <CareerApplications
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          }
        />
        <Route path="/applications" element={<Navigate to="/careers" replace />} />
        <Route
          path="/messages"
          element={
            <MessagesPage
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToEnquiries={() => navigate('/contact')}
            />
          }
        />

        {/* 7. Website Content & Site Settings */}
        <Route
          path="/website-content"
          element={
            <WebsiteContent
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToServices={() => navigate('/services')}
              onNavigateToProjects={() => navigate('/projects')}
              onNavigateToContact={() => navigate('/contact')}
              onNavigateToSiteSettings={() => navigate('/site-settings')}
            />
          }
        />
        <Route path="/content" element={<Navigate to="/website-content" replace />} />
        <Route
          path="/site-settings"
          element={
            <SiteSettingsPage
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToContent={() => navigate('/website-content')}
            />
          }
        />

        {/* 8. Settings */}
        <Route
          path="/settings"
          element={<SettingsPage onNavigateToDashboard={() => navigate('/dashboard')} />}
        />

        {/* 9. Notifications */}
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              onNavigateToDashboard={() => navigate('/dashboard')}
              onNavigateToView={handleNavigateView}
            />
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Protected Admin Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
