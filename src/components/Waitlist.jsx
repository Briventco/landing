import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import './Waitlist.css';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Waitlist = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    businessName: '',
    whatsappNumber: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
    if (!formData.whatsappNumber.trim()) errors.whatsappNumber = 'WhatsApp number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="waitlist-app waitlist-app--dark">
      <button
        className="waitlist-theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="waitlist-container">
        <button onClick={() => navigate('/')} className="waitlist-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </button>

        {!submitted ? (
          <motion.div
            className="waitlist-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="waitlist-title">Join the Waitlist</h1>
            <p className="waitlist-sub">
              Be the first to automate your restaurant orders with Servra.
            </p>

            <form onSubmit={handleSubmit} className="waitlist-form">
              <div className="waitlist-field">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  placeholder="e.g. Mama Put Kitchen"
                  value={formData.businessName}
                  onChange={handleChange}
                />
                {fieldErrors.businessName && (
                  <span className="waitlist-field-error">{fieldErrors.businessName}</span>
                )}
              </div>

              <div className="waitlist-field">
                <label htmlFor="whatsappNumber">WhatsApp Number</label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder="e.g. 08012345678"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                />
                {fieldErrors.whatsappNumber && (
                  <span className="waitlist-field-error">{fieldErrors.whatsappNumber}</span>
                )}
              </div>

              <div className="waitlist-field">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <span className="waitlist-field-error">{fieldErrors.email}</span>
                )}
              </div>

              <button type="submit" className="waitlist-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Joining...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Join Waitlist
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            className="waitlist-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="waitlist-success__icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2>You're on the list!</h2>
            <p>We'll reach out to you on WhatsApp soon. Keep an eye on your email too.</p>
            <button onClick={() => navigate('/')} className="waitlist-submit">
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Waitlist;