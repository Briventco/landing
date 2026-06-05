import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faTimes, 
  faArrowRight, 
  faClock,
  faBell,
  faChartLine,
  faTruck,
  faRobot,
  faCloudUpload,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';
import { useWhatsAppChat } from '../hooks/useWhatsAppChat';
import { useTheme } from '../contexts/ThemeContext';
import PhoneMock from '../ui/phoneMock.jsx';
import Footer from './Footer';
import { navItems, stepsData, featuresList, statsData } from '../data/landingPageData.js';
import logoImg from '/images/logo.jpg';
import './LandingPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 0.9, 0.36, 1], delay },
  }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.9, 0.36, 1] } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40, scale: 0.96 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 0.9, 0.36, 1], delay: 0.3 },
  },
};

const RevealSection = ({ children, className, style, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={fadeUp}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const resize = () => {
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || 600;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 160;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      velocities[i * 3] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptMat = new THREE.PointsMaterial({ color: 0x25d366, size: 0.045, transparent: true, opacity: 0.65 });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x25d366, transparent: true, opacity: 0.07 });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    let mouseX = 0;
    let mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
    };
    window.addEventListener('mousemove', onMouse);

    let frame = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        if (positions[i * 3] > 8 || positions[i * 3] < -8) velocities[i * 3] *= -1;
        if (positions[i * 3 + 1] > 5 || positions[i * 3 + 1] < -5) velocities[i * 3 + 1] *= -1;
      }
      ptGeo.attributes.position.needsUpdate = true;

      if (frame % 2 === 0) {
        const linePositions = [];
        for (let i = 0; i < COUNT; i++) {
          for (let j = i + 1; j < COUNT; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            if (Math.sqrt(dx * dx + dy * dy) < 2.2) {
              linePositions.push(
                positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
              );
            }
          }
        }
        lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      }

      points.rotation.y += 0.0006;
      lineSegments.rotation.y += 0.0006;
      camera.position.x += (mouseX - camera.position.x) * 0.04;
      camera.position.y += (-mouseY - camera.position.y) * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
};

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

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [loading, setLoading] = useState(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav?.type === 'reload') return true;
    return !sessionStorage.getItem('splashShown');
  });
  const menuRef = useRef(null);

  const {
    chatMessages, inputMessage, setInputMessage,
    botTyping, orderStep, chatEndRef,
    handleSendMessage, handleKeyPress, getStatusText,
  } = useWhatsAppChat();

  useEffect(() => {
    if (!loading) return;
    sessionStorage.setItem('splashShown', '1');
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
      const sections = ['home', 'about', 'how-it-works', 'pricing'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) { setActiveNavItem(id); break; }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || loading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const pricingPlans = [
    {
      name: 'Starter', price: '₦15,000', period: '/mo', orders: '900',
      overage: '+₦10 per order above limit', popular: false,
      features: ['AI order parsing & confirmation', 'Menu management', 'Order notifications', 'Email support'],
    },
    {
      name: 'Growth', price: '₦35,000', period: '/mo', orders: '2,000', staff: '5',
      overage: '+₦10 per order above limit', popular: true,
      features: ['Everything in Starter', 'Delivery tracking', 'Analytics dashboard', 'Priority support'],
    },
    {
      name: 'Pro', price: '₦75,000', period: '/mo', orders: 'Unlimited', staff: 'Unlimited',
      popular: false,
      features: ['Everything in Growth', 'Custom branding', 'Multi-location support', 'Dedicated account manager'],
    },
  ];

  return (
    <div className="lp-app lp-app--dark">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="lp-preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.div
              className="lp-preloader__content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.img src={logoImg} alt="Servra" className="lp-preloader__logo" />
              <motion.p
                className="lp-preloader__version"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Version 1.0
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={`lp-nav lp-nav--dark ${isNavScrolled ? 'lp-nav--scrolled' : ''}`}
        ref={menuRef}
      >
        <div className="lp-nav__container">
          <div className="lp-nav__logo">
            <img src={logoImg} alt="Servra" className="lp-nav__logo-img" />
          </div>

          <div className="lp-nav__right">
            <div className="lp-nav__links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`lp-nav__link lp-nav__link--dark ${activeNavItem === item.id ? 'lp-nav__link--active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              className="lp-nav__theme-btn lp-nav__theme-btn--dark"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => navigate('/waitlist')}
              className="lp-btn lp-btn--wa lp-nav__cta"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              Join Waitlist
            </button>
            <button
              className="lp-nav__hamburger lp-nav__hamburger--dark"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lp-nav__mobile lp-nav__mobile--dark"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="lp-nav__mobile-inner">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`lp-nav__mobile-link lp-nav__mobile-link--dark ${activeNavItem === item.id ? 'lp-nav__mobile-link--active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { navigate('/waitlist'); setMobileMenuOpen(false); }}
                  className="lp-btn lp-btn--wa lp-btn--full"
                >
                  <FontAwesomeIcon icon={faWhatsapp} /> Join Waitlist
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="home" className="lp-hero lp-hero--dark" style={{ position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas />

        <div className="lp-hero__orb lp-hero__orb--1" />
        <div className="lp-hero__orb lp-hero__orb--2" />

        <div className="lp-hero__container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="lp-hero__left">
            <motion.div
              className="lp-badge lp-badge--dark"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
            >
              <div className="lp-badge__dot" />
              <FontAwesomeIcon icon={faWhatsapp} className="lp-badge__icon" />
              <span>For restaurants & food vendors</span>
            </motion.div>

            <motion.h1
              className="lp-hero__title lp-hero__title--dark"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.22}
            >
              Automate Orders<br />
              via <span className="lp-hero__title-accent">WhatsApp</span>
            </motion.h1>

            <motion.p
              className="lp-hero__desc lp-hero__desc--dark"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.36}
            >
              Let customers order from you automatically via WhatsApp — no apps,
              no extra staff, no missed orders. Servra handles everything while
              you focus on making great food.
            </motion.p>

            <motion.div
              className="lp-hero__buttons"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.5}
            >
              <button
                onClick={() => navigate('/waitlist')}
                className="lp-btn lp-btn--wa"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                Start Automating Orders
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="lp-btn lp-btn--ghost"
              >
                See how it works <FontAwesomeIcon icon={faArrowRight} className="lp-icon--xs" />
              </button>
            </motion.div>

            <motion.div
              className="lp-stats lp-stats--dark"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              custom={0.64}
            >
              {statsData.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="lp-stats__item"
                  variants={fadeUp}
                >
                  <p className="lp-stats__value">{stat.value}</p>
                  <p className="lp-stats__label">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="lp-hero__right"
            variants={slideInRight}
            initial="hidden"
            animate="show"
          >
            <PhoneMock
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              botTyping={botTyping}
              orderStep={orderStep}
              chatEndRef={chatEndRef}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
              getStatusText={getStatusText}
            />
          </motion.div>
        </div>
      </section>

      <section id="about" className="lp-about lp-about--dark">
        <div className="lp-about__container">
          <RevealSection className="lp-about__visual">
            <div className="lp-about__cards-stack">
              {[
                { icon: faClock, title: '24/7 automated ordering', sub: 'Takes orders while you sleep' },
                { icon: faBell, title: 'Instant order alerts', sub: 'Notified every new sale' },
                { icon: faChartLine, title: 'Sales analytics', sub: 'Revenue, orders & peak hours' },
                { icon: faTruck, title: 'Delivery tracking', sub: 'Keep customers updated' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="lp-about__card"
                  whileHover={{ x: 6, borderColor: 'rgba(37,211,102,0.35)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lp-about__card-icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <div>
                    <p className="lp-about__card-title">{item.title}</p>
                    <p className="lp-about__card-sub">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          <div className="lp-about__right">
            <RevealSection delay={0.1}>
              <p className="lp-tag lp-tag--green">About</p>
              <h2 className="lp-heading lp-heading--dark">
                Your WhatsApp.<br />Automated.
              </h2>
              <p className="lp-about__text lp-about__text--dark">
                Servra turns your WhatsApp into a 24/7 automated ordering system.
                Customers message your number, browse your menu, place orders, and
                confirm delivery — all without you touching your phone.
              </p>
              <p className="lp-about__text lp-about__text--dark">
                No extra apps to download. No complex setup. Just connect your
                WhatsApp and let Servra handle orders, send confirmations, and
                notify you when a sale comes in. You cook. We handle the rest.
              </p>
            </RevealSection>
          </div>
        </div>

        <motion.div
          className="lp-features lp-features--dark"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {featuresList.map((feature, idx) => (
            <motion.div
              key={idx}
              className="lp-features__card lp-features__card--dark"
              variants={cardVariant}
              whileHover={{ y: -6, borderColor: 'rgba(37,211,102,0.3)' }}
              transition={{ duration: 0.25 }}
            >
              <div className="lp-features__icon lp-features__icon--dark">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <p className="lp-features__title">{feature.title}</p>
              <p className="lp-features__desc lp-features__desc--dark">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="how-it-works" className="lp-steps lp-steps--dark">
        <div className="lp-steps__container">
          <RevealSection className="lp-steps__header">
            <p className="lp-tag lp-tag--green">How It Works</p>
            <h2 className="lp-heading lp-heading--dark">
              Set up in minutes.<br />Sell 24/7.
            </h2>
            <p className="lp-steps__sub lp-steps__sub--dark">
              From connecting your WhatsApp to receiving your first automated
              order — everything is built for busy restaurant owners.
            </p>
          </RevealSection>

          <motion.div
            className="lp-steps__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {stepsData.map((step, idx) => (
              <motion.div
                key={idx}
                className="lp-steps__card lp-steps__card--dark"
                variants={cardVariant}
                whileHover={{ y: -6, borderColor: 'rgba(37,211,102,0.3)' }}
              >
                <div className="lp-steps__card-top">
                  <div className="lp-steps__icon lp-steps__icon--dark">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span className="lp-steps__num lp-steps__num--dark">{step.number}</span>
                </div>
                <p className="lp-steps__title">{step.title}</p>
                <p className="lp-steps__desc lp-steps__desc--dark">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="lp-pricing lp-pricing--dark">
        <div className="lp-pricing__container">
          <RevealSection className="lp-pricing__header">
            <p className="lp-tag lp-tag--green">Pricing</p>
            <h2 className="lp-heading lp-heading--dark">Simple, transparent pricing.</h2>
            <p className="lp-pricing__sub lp-pricing__sub--dark">
              Start small, scale as you grow. No hidden fees, no long-term contracts.
            </p>
          </RevealSection>

          <motion.div
            className="lp-pricing__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                className={`lp-pricing__card lp-pricing__card--dark ${plan.popular ? 'lp-pricing__card--popular' : ''}`}
                variants={cardVariant}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {plan.popular && (
                  <span className="lp-pricing__badge lp-pricing__badge--dark">Most Popular</span>
                )}
                <p className="lp-pricing__name">{plan.name}</p>
                <div className="lp-pricing__price-row">
                  <span className="lp-pricing__price">{plan.price}</span>
                  <span className="lp-pricing__period">{plan.period}</span>
                </div>
                <div className="lp-pricing__meta">
                  <span>
                    <strong>{plan.orders}</strong> orders/mo
                    {plan.overage && (
                      <small className="lp-pricing__overage">{plan.overage}</small>
                    )}
                  </span>
                  {plan.staff && <span><strong>{plan.staff}</strong> staff</span>}
                </div>
                <ul className="lp-pricing__features lp-pricing__features--dark">
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      <span className="lp-pricing__check">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/waitlist')}
                  className={`lp-btn lp-btn--full ${plan.popular ? 'lp-btn--wa' : 'lp-btn--ghost'}`}
                >
                  Join Waitlist
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <RevealSection className="lp-cta lp-cta--dark">
        <div className="lp-cta__glow" />
        <div className="lp-cta__container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            className="lp-cta__icon"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </motion.div>
          <h2 className="lp-cta__title">Ready to automate your orders?</h2>
          <p className="lp-cta__text">
            Join the waitlist today and be the first to turn your WhatsApp into
            a 24/7 order-taking machine.
          </p>
          <button
            onClick={() => navigate('/waitlist')}
            className="lp-btn lp-btn--wa lp-btn--lg"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="lp-icon--md" />
            Join the Waitlist
          </button>
          <p className="lp-cta__note">Free during early access · No credit card required</p>
        </div>
      </RevealSection>

      <Footer />
    </div>
  );
};

export default LandingPage;