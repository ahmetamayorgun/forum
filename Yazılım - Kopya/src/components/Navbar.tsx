import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMemberEmoji } from '../lib/supabase';
import { checkAdminRole } from '../lib/admin';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await checkAdminRole();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-700' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg transform group-hover:scale-110 transition-transform duration-300 shadow-lg"></div>
              <div className="absolute inset-1 bg-white dark:bg-slate-800 rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">S</span>
              </div>
            </div>
            <span className="text-xl font-bold text-red-600 hidden sm:block">Satıcıyız</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Ana Sayfa
            </Link>
            <Link
              to="/categories"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/categories')
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Kategoriler
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/search')
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Arama
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/create-topic"
                  className="btn-primary hidden sm:inline-flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Yeni Başlık</span>
                </Link>
                
                <NotificationDropdown />
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                        <span>{getMemberEmoji(user.points?.points || 0)} {user.points?.points || 0} puan</span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="py-1">
                      <Link
                        to={`/profile/${user.username}`}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150"
                      >
                        Profil
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150"
                        >
                          Admin Paneli
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-label="Menüyü aç/kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive('/')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                to="/categories"
                className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive('/categories')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kategoriler
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive('/search')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Arama
              </Link>
              {user && (
                <Link
                  to="/create-topic"
                  className="btn-primary mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + Yeni Başlık
                </Link>
              )}
              {!user && (
                <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    to="/login"
                    className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors duration-200 px-3 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 