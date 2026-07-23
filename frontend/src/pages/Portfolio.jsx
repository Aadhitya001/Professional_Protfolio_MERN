import React, { useState, useEffect, useContext } from 'react';
import { 
  Sun, Moon, Menu, X, Github, Linkedin, Instagram, Mail, 
  MapPin, Briefcase, GraduationCap, Award, ArrowRight, 
  Code, Server, Wrench, Send, ExternalLink, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim().replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
};

const DEFAULT_PROFILE = {
  name: 'Alex Mercer',
  title: 'Full Stack Engineer & UI/UX Designer',
  bio: 'Crafting responsive, high-performance web applications with modern design systems.',
  bioDetails: 'I am a Software Engineer based in San Francisco, specialized in React, Node.js, and MongoDB. I focus on creating accessible, user-centric experiences, using clean architecture and optimized front-end systems.',
  profileImage: '',
  resumeUrl: '#',
  email: 'alex.mercer@example.com',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  location: 'San Francisco, CA'
};

const DEFAULT_SKILLS = [
  { name: 'React / Next.js', level: 95, category: 'Frontend' },
  { name: 'JavaScript (ES6+)', level: 90, category: 'Frontend' },
  { name: 'Node.js & Express', level: 88, category: 'Backend' },
  { name: 'MongoDB / Mongoose', level: 85, category: 'Backend' },
  { name: 'Git & GitHub', level: 90, category: 'Tools' }
];

const DEFAULT_PROJECTS = [
  {
    _id: '1',
    title: 'Quantum Task Manager',
    description: 'A beautiful collaborative task management app with real-time updates and interactive Kanban boards.',
    longDescription: 'Quantum is a full-featured project collaboration tool. It features secure JWT user authentication, real-time board updates using WebSockets, drag-and-drop workflow task lists, and detailed activity logs. The dashboard is designed with a premium glassmorphic dark theme.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
    category: 'Full Stack',
    link: 'https://example.com',
    github: 'https://github.com',
    image: 'https://images.unsplash.com/photo-1540350390157-86b3509e47cd?w=600&auto=format&fit=crop&q=60',
    featured: true
  }
];

const DEFAULT_EXPERIENCES = [
  {
    _id: '1',
    type: 'work',
    title: 'Senior Software Engineer',
    company: 'Vortex Labs',
    location: 'San Francisco, CA',
    duration: '2024 - Present',
    description: [
      'Lead frontend development of a high-traffic SaaS dashboard, increasing page load speed by 40%.',
      'Architected reusable component libraries using React and custom CSS variables.'
    ]
  }
];

export default function Portfolio() {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (logout) {
      logout();
    }
  }, [logout]);

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [certificates, setCertificates] = useState([]);
  const [certFilter, setCertFilter] = useState('All');
  const [pageLoading, setPageLoading] = useState(true);
  
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', contactNumber: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const scrollToSection = (id, e) => {
    if (e) e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to system theme changes dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch('/api/portfolio-data');
        if (res.ok) {
          const data = await res.json();
          if (data.profile && Object.keys(data.profile).length > 0) {
            setProfile(data.profile);
          }
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          }
          if (data.skills && data.skills.length > 0) {
            setSkills(data.skills);
          }
          if (data.experiences && data.experiences.length > 0) {
            setExperiences(data.experiences);
          }
          if (data.certificates && data.certificates.length > 0) {
            setCertificates(data.certificates);
          }
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
      } finally {
        const elapsed = Date.now() - startTime;
        const minimumDelay = 3000; // 3 seconds minimum loading animation duration
        const remainingDelay = Math.max(0, minimumDelay - elapsed);
        
        setTimeout(() => {
          setPageLoading(false);
        }, remainingDelay);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'certificates', 'experience', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    
    // Validate contact number (must be exactly 10 digits if provided)
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      setFormStatus({ type: 'error', msg: 'Contact number must be exactly 10 digits.' });
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus({ type: 'success', msg: 'Message sent successfully! I will get back to you soon.' });
        setFormData({ name: '', email: '', contactNumber: '', subject: '', message: '' });
      } else {
        const err = await res.json();
        setFormStatus({ type: 'error', msg: err.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setFormStatus({ type: 'error', msg: 'Server error. Please check backend is running.' });
    } finally {
      setFormLoading(false);
    }
  };

  const categories = ['Frontend', 'Backend', 'Tools'];
  const groupedSkills = {};
  categories.forEach(cat => {
    groupedSkills[cat] = skills.filter(s => s.category.toLowerCase().includes(cat.toLowerCase()));
  });

  const projectCategories = ['All', ...new Set(projects.map(p => p.category))];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const certificateCategories = ['All', ...new Set(certificates.map(c => c.category || 'Other'))];

  const filteredCertificates = certFilter === 'All' 
    ? certificates 
    : certificates.filter(c => (c.category || 'Other') === certFilter);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr === 'Present') return 'Present';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    if (/^\d{4}$/.test(dateStr.trim())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (pageLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-container">
          <div className="loading-logo">LOADING PORTFOLIO</div>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-glow-container">
        <div className="bg-glow-orb-1"></div>
        <div className="bg-glow-orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="navbar-container">
          <a href="#home" className="nav-logo" onClick={(e) => scrollToSection('home', e)}>{profile.name}</a>
          
          <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {['home', 'about', 'skills', 'projects', 'certificates', 'experience', 'contact'].map((sec) => (
              <li key={sec}>
                <a 
                  href={`#${sec}`} 
                  className={`nav-link ${activeSection === sec ? 'active' : ''}`}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(sec, e);
                  }}
                >
                  {sec.charAt(0).toUpperCase() + sec.slice(1)}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                localStorage.setItem('theme', nextTheme);
              }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/admin" className="theme-toggle" title="Admin Login" aria-label="Admin Dashboard">
                <Shield size={20} />
              </Link>

            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <header id="home" className="hero-wrapper">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-tagline">Welcome to my space</span>
            <h1 className="hero-title">
              Hi, I'm <span>{profile.name}</span>
            </h1>
            <p className="hero-subtitle">{profile.title}</p>
            <p className="hero-description">{profile.bio}</p>
            
            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary" onClick={(e) => scrollToSection('contact', e)}>
                Get In Touch <ArrowRight size={18} />
              </a>
              {profile.resumeUrl && profile.resumeUrl !== '#' && profile.resumeUrl !== '' && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" download className="btn btn-secondary">
                  Download Resume
                </a>
              )}
              <a href="#projects" className="btn btn-secondary" onClick={(e) => scrollToSection('projects', e)}>
                View Projects
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-avatar-frame">
              <div className="hero-avatar-inner">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} />
                ) : (
                  <span className="hero-avatar-fallback">💻</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="about" className="section">
        <h2 className="section-title">About Me</h2>
        <div className="about-grid glass-card">
          <div className="about-details">
            <h3>Who I Am</h3>
            <p>{profile.bioDetails}</p>
            
            <div className="about-meta">
              <div className="about-meta-item">
                <span className="about-meta-label">Location</span>
                <span className="about-meta-val">{profile.location}</span>
              </div>
              <div className="about-meta-item">
                <span className="about-meta-label">Email</span>
                <span className="about-meta-val">{profile.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div className="social-links">
                {profile.github && (
                  <a href={ensureAbsoluteUrl(profile.github)} target="_blank" rel="noreferrer" className="social-icon">
                    <Github size={20} />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={ensureAbsoluteUrl(profile.linkedin)} target="_blank" rel="noreferrer" className="social-icon">
                    <Linkedin size={20} />
                  </a>
                )}
                {profile.instagram && (
                  <a href={ensureAbsoluteUrl(profile.instagram)} target="_blank" rel="noreferrer" className="social-icon">
                    <Instagram size={20} />
                  </a>
                )}
              </div>
              {profile.resumeUrl && profile.resumeUrl !== '#' && profile.resumeUrl !== '' && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" download className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  Download Resume
                </a>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>My Core Principles</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {(profile.corePrinciples && profile.corePrinciples.length > 0 ? profile.corePrinciples : [
                { title: 'Premium Aesthetics', description: 'Focus on clean alignment, rich micro-animations, and striking visual contrasts.' },
                { title: 'Clean Architecture', description: 'Writing modular components and highly structured backend APIs.' },
                { title: 'Continuous Growth', description: 'Always learning and embracing the latest technologies and best practices.' }
              ]).map((principle, index) => (
                <div key={index} className="glass-card" style={{ padding: '15px', borderRadius: '12px' }}>
                  <h4 style={{ color: ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--text-primary)'][index % 3], marginBottom: '5px' }}>
                    {principle.title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section">
        <h2 className="section-title">My Skills</h2>
        <div className="skills-container">
          {Object.keys(groupedSkills).map((cat) => (
            <div key={cat} className="glass-card">
              <h3 className="skills-category-title">
                {cat.includes('Front') && <Code size={20} className="text-accent" />}
                {cat.includes('Back') && <Server size={20} className="text-accent" />}
                {cat.includes('Tool') && <Wrench size={20} className="text-accent" />}
                {cat}
              </h3>
              
              <div className="skills-list">
                {groupedSkills[cat] && groupedSkills[cat].length > 0 ? (
                  groupedSkills[cat].map((skill) => (
                    <div key={skill._id || skill.name} className="skill-item">
                      <div className="skill-info">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percent">{skill.level}%</span>
                      </div>
                      <div className="skill-bar-outer">
                        <div 
                          className="skill-bar-inner" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No skills in this category yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="section-title">Projects</h2>
        
        {projectCategories.length > 1 && (
          <div className="projects-filter">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project._id} className="project-card glass-card">
                <div className="project-card-image">
                  {project.image ? (
                    <img src={project.image} alt={project.title} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      No Project Image
                    </div>
                  )}
                </div>
                <div className="project-card-content">
                  <div className="project-card-tags">
                    {project.tags.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-desc">{project.description}</p>
                  
                  <div className="project-card-actions">
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={() => setSelectedProject(project)}
                    >
                      Details
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer" className="project-link-icon">
                          <Github size={18} />
                        </a>
                      )}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="project-link-icon">
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)' }}>
              No projects added yet. Run the seeder script to populate default projects!
            </p>
          )}
        </div>
      </section>

      {certificates.length > 0 && (
        <section id="certificates" className="section">
          <h2 className="section-title">Certificates</h2>
          
          {certificateCategories.length > 1 && (
            <div className="projects-filter">
              {certificateCategories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${certFilter === cat ? 'active' : ''}`}
                  onClick={() => setCertFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="projects-grid">
            {filteredCertificates.map((cert) => (
              <div key={cert._id} className="project-card glass-card" onClick={() => setSelectedCertificate(cert)} style={{ cursor: 'pointer' }}>
                <div className="project-card-image" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.4)' }}>
                  {cert.image ? (
                    <img src={cert.image} alt={cert.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                  ) : (
                    <div style={{ fontSize: '3rem' }}>🏆</div>
                  )}
                </div>
                <div className="project-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cert.issuer}
                  </span>
                  <h3 className="project-card-title" style={{ fontSize: '1.2rem', margin: 0 }}>{cert.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Earned: {cert.date}
                  </p>
                  
                  {cert.verificationUrl && (
                    <a 
                      href={cert.verificationUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary" 
                      style={{ marginTop: 'auto', padding: '8px 16px', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      Verify Credential <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificate Modal */}
{selectedCertificate && (
  <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
    <div className="modal-container glass-card" onClick={e => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={() => setSelectedCertificate(null)}>
        <X size={20} />
      </button>
      <div className="modal-image" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {selectedCertificate.image ? (
          <img src={selectedCertificate.image} alt={selectedCertificate.name} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
        ) : (
          <div style={{ fontSize: '3rem' }}>🏆</div>
        )}
      </div>
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>{selectedCertificate.name}</h3>
        <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>{selectedCertificate.issuer} - {selectedCertificate.date}</p>
        {selectedCertificate.verificationUrl && (
          <a href={selectedCertificate.verificationUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ marginTop: '10px' }}>
            Verify Credential <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  </div>
)}
      

      <section id="experience" className="section">
        <h2 className="section-title">My Journey</h2>
        <div className="experience-timeline">
          {experiences.length > 0 ? (
            experiences.map((exp) => (
              <div key={exp._id} className="timeline-item">
                <div className="timeline-badge">
                  {exp.type === 'work' ? <Briefcase size={16} /> : exp.type === 'internship' ? <Award size={16} /> : <GraduationCap size={16} />}
                </div>
                <div className="timeline-card glass-card">
                  <div className="timeline-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 className="timeline-title">{exp.title}</h3>
                        {exp.type && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            background: exp.type === 'work' ? 'rgba(59, 130, 246, 0.15)' : exp.type === 'internship' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: exp.type === 'work' ? '#3b82f6' : exp.type === 'internship' ? '#a855f7' : '#10b981'
                          }}>
                            {exp.type}
                          </span>
                        )}
                      </div>
                      <p className="timeline-org">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    </div>
                    <span className="timeline-duration">
                      {exp.fromDate 
                        ? `${formatDate(exp.fromDate)} - ${exp.toDate ? formatDate(exp.toDate) : 'Present'}` 
                        : exp.duration}
                    </span>
                  </div>
                  <ul className="timeline-desc">
                    {exp.description.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No journey timeline recorded yet.</p>
          )}
        </div>
      </section>

      <section id="contact" className="section">
        <h2 className="section-title">Contact Me</h2>
        <div className="contact-grid glass-card">
          <div className="contact-info">
            <h3>Get in touch</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Have an exciting project idea, a position open, or just want to chat? Send me a message!</p>
            
            <div className="contact-info-card">
              <div className="contact-info-icon"><Mail size={20} /></div>
              <div className="contact-info-details">
                <h4>Email</h4>
                <p>{profile.email}</p>
              </div>
            </div>
            
            <div className="contact-info-card">
              <div className="contact-info-icon"><MapPin size={20} /></div>
              <div className="contact-info-details">
                <h4>Location</h4>
                <p>{profile.location}</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="form-name">Name</label>
                  <input 
                    type="text" 
                    id="form-name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-email">Email</label>
                  <input 
                    type="email" 
                    id="form-email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-contact">Contact No</label>
                <input 
                  type="number" 
                  id="form-contact" 
                  min="0" 
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-subject">Subject</label>
                <input 
                  type="text" 
                  id="form-subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-message">Message</label>
                <textarea 
                  id="form-message" 
                  rows="5" 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={formLoading}>
                {formLoading ? 'Sending...' : 'Send Message'} <Send size={16} />
              </button>

              {formStatus && (
                <div className={`form-alert ${formStatus.type === 'success' ? 'form-alert-success' : 'form-alert-error'}`}>
                  {formStatus.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <span className="footer-logo">{profile.name}</span>
          <span className="footer-copy">© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        </div>
      </footer>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProject(null)}>
              <X size={20} />
            </button>
            
            {selectedProject.image && (
              <div className="modal-image">
                <img src={selectedProject.image} alt={selectedProject.title} />
              </div>
            )}
            
            <div className="modal-content">
              <div className="modal-tags">
                {selectedProject.tags.map((t) => (
                  <span key={t} className="project-tag">{t}</span>
                ))}
              </div>
              <h2 className="modal-title">{selectedProject.title}</h2>
              <div className="modal-desc">
                {selectedProject.longDescription || selectedProject.description}
              </div>
              
              <div className="modal-footer">
                {selectedProject.github && (
                  <a href={selectedProject.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
                    <Github size={18} /> GitHub
                  </a>
                )}
                {selectedProject.link && (
                  <a href={selectedProject.link} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <ExternalLink size={18} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
