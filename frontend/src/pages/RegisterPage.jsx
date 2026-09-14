import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError(t('auth.fillAllFields') || 'Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      setError(t('auth.passwordMin') || 'Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsMismatch') || 'Passwords do not match');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('auth.invalidEmail') || 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/register', {
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccess(t('auth.registerSuccess') || 'Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || t('auth.registrationFailed') || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Banner */}
      <section className="page-banner" style={{ minHeight: '200px' }}>
        <div
          className="page-banner-bg bg_cover"
          style={{
            backgroundImage: 'url(/images/register.webp)',
            height: '200px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="container">
            <div className="banner-content text-center">
              <h2 className="title text-white">{t('auth.registerPage')}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Register Form Section Matching Chunk 915 */}
      <section className="login-register pt-70 pb-70">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="login-register-content">
                <h4 className="title">{t('auth.signUp')}</h4>

                <div className="login-register-form">
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger mt-3 mb-0" role="alert" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-exclamation-circle me-2"></i> {error}
                      </div>
                    )}
                    {success && (
                      <div className="alert alert-success mt-3 mb-0" role="alert" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-check-circle me-2"></i> {success}
                      </div>
                    )}

                    <div className="single-form">
                      <label>{t('auth.firstName')} *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.lastName')} *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.emailAddress')} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.username')} *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.password')}</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="single-form">
                      <label>{t('auth.confirmPassword')}</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="single-form">
                      <div className="checkbox">
                        <input type="checkbox" id="offers" />
                        <label htmlFor="offers">
                          <span></span> {t('auth.receiveOffers')}
                        </label>
                      </div>
                    </div>

                    <div className="single-form">
                      <button className="main-btn" type="submit" disabled={loading}>
                        {t(loading ? 'auth.registering' : 'auth.signUp')}
                      </button>
                    </div>

                    <div className="single-form">
                      <label>{t('auth.alreadyAccount')}</label>
                      <Link to="/login" className="main-btn main-btn-2">
                        {t('auth.logInInstead')}
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

export default RegisterPage;
