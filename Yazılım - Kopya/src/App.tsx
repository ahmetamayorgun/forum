import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ThreeBackground from './components/ThreeBackground';
import { initializeCookieHandling } from './utils/cookieUtils';

// Lazy loading for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const TopicDetail = React.lazy(() => import('./pages/TopicDetail'));
const CreateTopic = React.lazy(() => import('./pages/CreateTopic'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const NotificationSettings = React.lazy(() => import('./pages/NotificationSettings'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Debug = React.lazy(() => import('./pages/Debug'));

function App() {
  useEffect(() => {
    // Initialize cookie handling to resolve Cloudflare issues
    initializeCookieHandling();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
            <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <Navbar />
              <main className="pt-16">
                <Suspense fallback={
                  <ThreeBackground className="min-h-screen">
                    <div className="flex items-center justify-center min-h-[80vh]">
                      <LoadingSpinner />
                    </div>
                  </ThreeBackground>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/topic/:id" element={<TopicDetail />} />
                    <Route path="/create-topic" element={<CreateTopic />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/notification-settings" element={<NotificationSettings />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/debug" element={<Debug />} />
                    <Route path="*" element={
                      <ThreeBackground className="min-h-screen">
                        <div className="flex items-center justify-center min-h-[80vh]">
                          <div className="text-center">
                            <div className="text-6xl mb-4">🚫</div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                              404 - Sayfa Bulunamadı
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                              Aradığınız sayfa mevcut değil.
                            </p>
                            <a 
                              href="/" 
                              className="btn-primary"
                            >
                              Ana Sayfaya Dön
                            </a>
                          </div>
                        </div>
                      </ThreeBackground>
                    } />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App; 