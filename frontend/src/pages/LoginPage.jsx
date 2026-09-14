import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    const token = localStorage.getItem('token');
    if (token && isAuthenticated && user) {
      clearTimeout(timer);
      const role = user?.role;
      if (role === 'admin' || role === 'sub_admin') {
        navigate('/admin-panel');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    }

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.fillAllFields') || 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      localStorage.removeItem('token');
      const data = await login({ email, password });
      const role = data?.user?.role;
      if (role === 'admin' || role === 'sub_admin') {
        navigate('/admin-panel');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      localStorage.removeItem('token');
      let msg = (t('auth.loginFailed') || 'Login failed') + ': ';
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === 'object' && d.msg) msg += d.msg;
        else if (typeof d === 'object' && d.error) msg += d.error;
        else if (typeof d === 'string') msg += d;
        else msg += err.response.statusText || `Error ${err.response.status}`;
      } else if (err.request) {
        msg += 'Network error. Please check your internet connection and try again.';
      } else {
        msg += err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (pageLoading) {
    return (
      <div>
        <section className="page-banner" style={{ minHeight: '200px' }}>
          <div
            className="page-banner-bg bg_cover"
            style={{
              backgroundImage: 'url(/images/login.webp)',
              height: '200px',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="container">
              <div className="banner-content text-center">
                <h2 className="title text-white">{t('common.loading')}</h2>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Page Banner Matching Chunk 121 */}
      <section className="page-banner" style={{ minHeight: '200px' }}>
        <div
          className="page-banner-bg bg_cover"
          style={{
            backgroundImage: 'url(/images/login.webp)',
            height: '200px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="container">
            <div className="banner-content text-center">
              <h2 className="title text-white">{t('auth.loginPage')}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Login Form Section Matching Chunk 121 */}
      <section className="login-register pt-70 pb-70">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="login-register-content">
                <h4 className="title">{t('auth.signIn')}</h4>

                <div className="login-register-form">
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger mt-3 mb-0" role="alert" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-exclamation-circle me-2"></i> {error}
                      </div>
                    )}

                    <div className="single-form">
                      <label>{t('auth.email')} *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder=""
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.password')}</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=""
                      />
                    </div>

                    <div className="single-form">
                      <button className="main-btn" type="submit" disabled={loading}>
                        {t(loading ? 'auth.registering' : 'auth.login')}
                      </button>
                    </div>

                    <div className="single-form d-flex justify-content-between align-items-center">
                      <div className="checkbox">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label
                          htmlFor="remember"
                          style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          ></span>{' '}
                          {t('auth.rememberMe')}
                        </label>
                      </div>
                      <div className="forget">
                        <Link
                          to="/lost-password"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(t('common.contactAdmin') || 'Please contact administrative support at info@rpitssr.edu.kh');
                          }}
                        >
                          {t('auth.forgotPassword')}
                        </Link>
                      </div>
                    </div>

                    {isAuthenticated && (
                      <div className="single-form">
                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            marginRight: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          {t('auth.logout')}
                        </button>
                      </div>
                    )}

                    <div className="single-form">
                      <label>{t('auth.dontHaveAccount')}</label>
                      <Link to="/register" className="main-btn main-btn-2">
                        {t('auth.createAccount')}
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ height: '50px' }}></div>
    </div>
  );
};

export default LoginPage;
