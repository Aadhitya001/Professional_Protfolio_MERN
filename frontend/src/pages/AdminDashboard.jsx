import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Briefcase, Code, Mail, LayoutDashboard, Plus, 
  Trash2, LogOut, Check, ArrowLeft, Edit2, Award, Lock, Link as LinkIcon, ShieldCheck, Users, Eye, Sun, Moon
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, login, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Theme support
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [user]);

  const handleCredentialsUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return triggerFeedback('Username cannot be empty', 'error');
    try {
      const res = await fetch('/api/auth/update-username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          newUsername: newUsername.trim(),
          newEmail: newEmail.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Update user state inside AuthContext
        login(data.user);
        triggerFeedback('Admin account settings updated successfully!');
      } else {
        triggerFeedback(data.message || 'Failed to update credentials', 'error');
      }
    } catch {
      triggerFeedback('Error updating credentials', 'error');
    }
  };

  // Backend data state
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [profile, setProfile] = useState({
    name: '', title: '', bio: '', bioDetails: '',
    profileImage: '', resumeUrl: '', email: '',
    github: '', linkedin: '', instagram: '', location: ''
  });

  const [certificates, setCertificates] = useState([]);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificateForm, setCertificateForm] = useState({ name: '', issuer: '', date: '', image: '', verificationUrl: '', category: 'Cloud' });

  // Private Vault state
  const [privateDocs, setPrivateDocs] = useState([]);
  const [accessTokens, setAccessTokens] = useState([]);
  const [vaultDocForm, setVaultDocForm] = useState({ title: '', category: 'Other', file: null });
  const [vaultAccessForm, setVaultAccessForm] = useState({ label: '', expiresAt: '', documentIds: [], allowDownload: true });
  const [copiedToken, setCopiedToken] = useState(null);
  const [selectedViewersToken, setSelectedViewersToken] = useState(null);
  const [showAllViewersModal, setShowAllViewersModal] = useState(false);
  const [editingVaultDoc, setEditingVaultDoc] = useState(null);

  // Edit/Form states
  const [editingProject, setEditingProject] = useState(null); // null means adding or not editing
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', longDescription: '',
    tags: '', category: 'Frontend', link: '', github: '', image: '', featured: false
  });

  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', level: 80, category: 'Frontend' });

  const [editingExperience, setEditingExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    type: 'work', title: '', company: '', location: '', duration: '', fromDate: '', toDate: '', description: '', isCurrent: false
  });

  const [feedback, setFeedback] = useState(null);
  const [dbMode, setDbMode] = useState('');

  // Authenticate Admin
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch all dashboard data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      
      try {
        const pRes = await fetch('/api/profile');
        if (pRes.ok) setProfile(await pRes.json());
        
        const projRes = await fetch('/api/projects');
        if (projRes.ok) setProjects(await projRes.json());

        const skRes = await fetch('/api/skills');
        if (skRes.ok) setSkills(await skRes.json());

        const expRes = await fetch('/api/experience');
        if (expRes.ok) setExperiences(await expRes.json());

        const msgRes = await fetch('/api/messages', { headers });
        if (msgRes.ok) setMessages(await msgRes.json());

        const certRes = await fetch('/api/certificates');
        if (certRes.ok) setCertificates(await certRes.json());

        // Fetch private vault data
        const pvDocRes = await fetch('/api/private-docs', { headers });
        if (pvDocRes.ok) setPrivateDocs(await pvDocRes.json());

        const pvAccessRes = await fetch('/api/private-docs/access', { headers });
        if (pvAccessRes.ok) setAccessTokens(await pvAccessRes.json());

        try {
          const healthRes = await fetch('/api/health');
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            setDbMode(healthData.databaseMode || '');
          }
        } catch (healthErr) {
          console.error('Error fetching health status:', healthErr);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [user]);

  // Show status feedback
  const triggerFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- Core Principles Helpers ---
  const getPrincipleTitle = (index) => {
    return profile.corePrinciples && profile.corePrinciples[index]
      ? profile.corePrinciples[index].title
      : '';
  };

  const getPrincipleDesc = (index) => {
    return profile.corePrinciples && profile.corePrinciples[index]
      ? profile.corePrinciples[index].description
      : '';
  };

  const handlePrincipleChange = (index, field, value) => {
    const updatedPrinciples = [...(profile.corePrinciples || [])];
    
    if (!updatedPrinciples[index]) {
      updatedPrinciples[index] = { title: '', description: '' };
    }
    
    updatedPrinciples[index][field] = value;
    setProfile({ ...profile, corePrinciples: updatedPrinciples });
  };

  const handleAddPrinciple = () => {
    const updatedPrinciples = [...(profile.corePrinciples || [])];
    updatedPrinciples.push({ title: '', description: '' });
    setProfile({ ...profile, corePrinciples: updatedPrinciples });
  };

  const handleRemovePrinciple = (index) => {
    const updatedPrinciples = [...(profile.corePrinciples || [])];
    updatedPrinciples.splice(index, 1);
    setProfile({ ...profile, corePrinciples: updatedPrinciples });
  };

  // --- Profile Handler ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setProfile(await res.json());
        triggerFeedback('Profile settings updated successfully!');
      }
    } catch (err) {
      triggerFeedback('Failed to update profile details', 'error');
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      triggerFeedback('Uploading file...', 'success');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, [field]: data.fileUrl });
        triggerFeedback('File uploaded successfully! Remember to click Save Settings.', 'success');
      } else {
        triggerFeedback(data.message || 'Failed to upload file', 'error');
      }
    } catch (err) {
      triggerFeedback('Error uploading file', 'error');
    }
  };

  const handleProjectImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      triggerFeedback('Uploading project image...', 'success');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProjectForm({ ...projectForm, image: data.fileUrl });
        triggerFeedback('Project image uploaded successfully!', 'success');
      } else {
        triggerFeedback(data.message || 'Failed to upload image', 'error');
      }
    } catch (err) {
      triggerFeedback('Error uploading image', 'error');
    }
  };

  const handleCertificateSubmit = async (e) => {
    e.preventDefault();
    const url = editingCertificate ? `/api/certificates/${editingCertificate._id}` : '/api/certificates';
    const method = editingCertificate ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(certificateForm)
      });

      if (res.ok) {
        const savedCert = await res.json();
        if (editingCertificate) {
          setCertificates(certificates.map(c => c._id === savedCert._id ? savedCert : c));
          triggerFeedback('Certificate updated successfully.');
        } else {
          setCertificates([savedCert, ...certificates]);
          triggerFeedback('New certificate added successfully.');
        }
        resetCertificateForm();
      }
    } catch (err) {
      triggerFeedback('Failed to save certificate', 'error');
    }
  };

  const startEditCertificate = (cert) => {
    setEditingCertificate(cert);
    setCertificateForm({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      image: cert.image || '',
      verificationUrl: cert.verificationUrl || '',
      category: cert.category || 'Cloud'
    });
  };

  const deleteCertificate = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setCertificates(certificates.filter(c => c._id !== id));
        triggerFeedback('Certificate deleted.');
      }
    } catch (err) {
      triggerFeedback('Error deleting certificate.', 'error');
    }
  };

  const resetCertificateForm = () => {
    setEditingCertificate(null);
    setCertificateForm({ name: '', issuer: '', date: '', image: '', verificationUrl: '', category: 'Cloud' });
  };

  const handleCertificateImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      triggerFeedback('Uploading certificate image...', 'success');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCertificateForm({ ...certificateForm, image: data.fileUrl });
        triggerFeedback('Certificate image uploaded successfully!', 'success');
      } else {
        triggerFeedback(data.message || 'Failed to upload image', 'error');
      }
    } catch (err) {
      triggerFeedback('Error uploading image', 'error');
    }
  };

  // --- Projects Handler ---
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      tags: typeof projectForm.tags === 'string' ? projectForm.tags.split(',').map(t => t.trim()) : projectForm.tags
    };

    const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedProject = await res.json();
        if (editingProject) {
          setProjects(projects.map(p => p._id === savedProject._id ? savedProject : p));
          triggerFeedback('Project updated successfully.');
        } else {
          setProjects([savedProject, ...projects]);
          triggerFeedback('New project added successfully.');
        }
        resetProjectForm();
      }
    } catch (err) {
      triggerFeedback('Failed to save project', 'error');
    }
  };

  const startEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      longDescription: project.longDescription || '',
      tags: project.tags.join(', '),
      category: project.category,
      link: project.link || '',
      github: project.github || '',
      image: project.image || '',
      featured: project.featured || false
    });
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
        triggerFeedback('Project deleted.');
      }
    } catch (err) {
      triggerFeedback('Error deleting project.', 'error');
    }
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectForm({
      title: '', description: '', longDescription: '',
      tags: '', category: 'Frontend', link: '', github: '', image: '', featured: false
    });
  };

  // --- Skills Handler ---
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    const url = editingSkill ? `/api/skills/${editingSkill._id}` : '/api/skills';
    const method = editingSkill ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(skillForm)
      });
      if (res.ok) {
        const savedSkill = await res.json();
        if (editingSkill) {
          setSkills(skills.map(s => s._id === savedSkill._id ? savedSkill : s));
          triggerFeedback('Skill updated.');
        } else {
          setSkills([...skills, savedSkill]);
          triggerFeedback('New skill added.');
        }
        resetSkillForm();
      }
    } catch (err) {
      triggerFeedback('Error saving skill', 'error');
    }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSkills(skills.filter(s => s._id !== id));
        triggerFeedback('Skill removed.');
      }
    } catch (err) {
      triggerFeedback('Error deleting skill.', 'error');
    }
  };

  const startEditSkill = (skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, level: skill.level, category: skill.category });
  };

  const resetSkillForm = () => {
    setEditingSkill(null);
    setSkillForm({ name: '', level: 80, category: 'Frontend' });
  };

  // --- Experiences Handler ---
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...experienceForm,
      toDate: experienceForm.isCurrent ? 'Present' : experienceForm.toDate,
      description: typeof experienceForm.description === 'string' ? experienceForm.description.split('\n').filter(line => line.trim()) : experienceForm.description
    };
    
    const url = editingExperience ? `/api/experience/${editingExperience._id}` : '/api/experience';
    const method = editingExperience ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedExp = await res.json();
        if (editingExperience) {
          setExperiences(experiences.map(e => e._id === savedExp._id ? savedExp : e));
          triggerFeedback('Experience modified.');
        } else {
          setExperiences([savedExp, ...experiences]);
          triggerFeedback('New experience item added.');
        }
        resetExperienceForm();
      }
    } catch (err) {
      triggerFeedback('Error saving experience item.', 'error');
    }
  };

  const startEditExperience = (exp) => {
    setEditingExperience(exp);
    setExperienceForm({
      type: exp.type,
      title: exp.title,
      company: exp.company,
      location: exp.location || '',
      duration: exp.duration || '',
      fromDate: exp.fromDate || '',
      toDate: exp.toDate || '',
      isCurrent: exp.toDate === 'Present',
      description: exp.description.join('\n')
    });
  };

  const deleteExperience = async (id) => {
    if (!window.confirm('Delete this experience timeline?')) return;
    try {
      const res = await fetch(`/api/experience/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setExperiences(experiences.filter(e => e._id !== id));
        triggerFeedback('Experience record deleted.');
      }
    } catch (err) {
      triggerFeedback('Error deleting experience.', 'error');
    }
  };

  const resetExperienceForm = () => {
    setEditingExperience(null);
    setExperienceForm({ type: 'work', title: '', company: '', location: '', duration: '', fromDate: '', toDate: '', description: '', isCurrent: false });
  };

  // --- Messages Handler ---
  const markMessageRead = async (id) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(messages.map(m => m._id === id ? updatedMsg : m));
        triggerFeedback('Message marked as read.');
      }
    } catch (err) {
      triggerFeedback('Failed to update message state.', 'error');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        triggerFeedback('Message deleted.');
      }
    } catch (err) {
      triggerFeedback('Error deleting message.', 'error');
    }
  };

  // Helper stats
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  // ── Private Vault Handlers ──────────────────────────
  const handleVaultDocSubmit = async (e) => {
    e.preventDefault();
    if (!editingVaultDoc && !vaultDocForm.file) {
      return triggerFeedback('File is required', 'error');
    }
    if (!vaultDocForm.title) {
      return triggerFeedback('Title is required', 'error');
    }

    const formData = new FormData();
    if (vaultDocForm.file) {
      formData.append('file', vaultDocForm.file);
    }
    formData.append('title', vaultDocForm.title);
    formData.append('category', vaultDocForm.category);

    try {
      const url = editingVaultDoc 
        ? `/api/private-docs/${editingVaultDoc._id}`
        : '/api/private-docs';
      const method = editingVaultDoc ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingVaultDoc) {
          setPrivateDocs(privateDocs.map(d => d._id === editingVaultDoc._id ? saved : d));
          triggerFeedback('Document updated successfully!');
        } else {
          setPrivateDocs([saved, ...privateDocs]);
          triggerFeedback('Document uploaded to vault successfully!');
        }
        resetVaultDocForm();
      } else {
        const d = await res.json();
        triggerFeedback(d.message || (editingVaultDoc ? 'Update failed' : 'Upload failed'), 'error');
      }
    } catch { 
      triggerFeedback(editingVaultDoc ? 'Update error' : 'Upload error', 'error'); 
    }
  };

  const startEditVaultDoc = (doc) => {
    setEditingVaultDoc(doc);
    setVaultDocForm({
      title: doc.title || '',
      category: doc.category || 'Other',
      file: null
    });
  };

  const resetVaultDocForm = () => {
    setEditingVaultDoc(null);
    setVaultDocForm({ title: '', category: 'Other', file: null });
  };

  const handleDeleteVaultDoc = async (id) => {
    if (!window.confirm('Delete this document from the vault?')) return;
    try {
      const res = await fetch(`/api/private-docs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setPrivateDocs(privateDocs.filter(d => d._id !== id));
        triggerFeedback('Document deleted.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        triggerFeedback(errorData.message || 'Failed to delete document.', 'error');
      }
    } catch (err) {
      console.error('Delete document error:', err);
      triggerFeedback('Delete error', 'error');
    }
  };

  const handleCreateAccessToken = async (e) => {
    e.preventDefault();
    if (!vaultAccessForm.label || !vaultAccessForm.expiresAt) return triggerFeedback('Label and expiry required', 'error');
    if (!vaultAccessForm.documentIds || vaultAccessForm.documentIds.length === 0) {
      return triggerFeedback('Please select at least one document to share', 'error');
    }
    try {
      const res = await fetch('/api/private-docs/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(vaultAccessForm)
      });
      if (res.ok) {
        const saved = await res.json();
        setAccessTokens([saved, ...accessTokens]);
        setVaultAccessForm({ label: '', expiresAt: '', documentIds: [], allowDownload: true });
        triggerFeedback('Access link created successfully!');
      } else {
        const d = await res.json();
        triggerFeedback(d.message || 'Failed', 'error');
      }
    } catch { triggerFeedback('Error creating access link', 'error'); }
  };

  const handleRevokeToken = async (id) => {
    if (!window.confirm('Revoke this access link?')) return;
    try {
      const res = await fetch(`/api/private-docs/access/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setAccessTokens(accessTokens.filter(t => t._id !== id));
        triggerFeedback('Access link revoked.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        triggerFeedback(errorData.message || 'Failed to revoke access link.', 'error');
      }
    } catch (err) {
      console.error('Revoke token error:', err);
      triggerFeedback('Revoke error', 'error');
    }
  };

  const copyAccessLink = (token) => {
    const url = `${window.location.origin}/docs/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
    triggerFeedback('Access link copied to clipboard!');
  };

  if (loading || !user) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>Loading authentication...</div>;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <div className="admin-logo-wrapper">
          <span className="admin-title-panel">Portfolio Panel</span>
        </div>

        <ul className="admin-menu">
          <li 
            className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} /> Overview
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile Setting
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Code size={18} /> Projects
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <Briefcase size={18} /> Experience
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Code size={18} /> Tech Skills
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={18} /> Certificates
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <Mail size={18} /> Inbox ({unreadMessagesCount})
          </li>
          <li
            className={`admin-menu-item ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
            style={{ color: activeTab === 'vault' ? '#a78bfa' : undefined }}
          >
            <Lock size={18} /> Private Vault
          </li>
        </ul>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" className="btn btn-secondary" style={{ padding: '10px' }}><ArrowLeft size={16} /> Portfolio</Link>
          <button className="btn btn-primary" onClick={logout} style={{ padding: '10px', justifyContent: 'center' }}><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <header className="admin-header">
          <h2>Dashboard / {activeTab.toUpperCase()}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title="Toggle Theme"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome, {user.username}</span>
          </div>
        </header>

        {feedback && (
          <div className={`form-alert ${feedback.type === 'success' ? 'form-alert-success' : 'form-alert-error'}`} style={{ marginBottom: '25px' }}>
            {feedback.msg}
          </div>
        )}

        {dbMode.includes('Fallback JSON') && (
          <div className="form-alert form-alert-error" style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> Ephemeral Database Fallback Active
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'left' }}>
              Your application is currently running in local fallback database mode because it failed to connect to MongoDB. 
              <br />
              <strong>Warning:</strong> Because Vercel serverless containers are temporary and stateless, <strong>all changes and updates you make here will be lost</strong> when the serverless function restarts or scales down.
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.9, textAlign: 'left' }}>
              To ensure all data is safely stored and updated:
              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                <li>Configure the <code>MONGO_URI</code> environment variable on your Vercel Dashboard.</li>
                <li>Ensure you have whitelisted <code>0.0.0.0/0</code> (Allow Access from Anywhere) in your MongoDB Atlas Network Access settings.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="admin-stat-card glass-card">
                <div className="admin-stat-header">Total Projects</div>
                <div className="admin-stat-val">{projects.length}</div>
              </div>
              <div className="admin-stat-card glass-card">
                <div className="admin-stat-header">Total Skills</div>
                <div className="admin-stat-val">{skills.length}</div>
              </div>
              <div className="admin-stat-card glass-card">
                <div className="admin-stat-header">Certificates</div>
                <div className="admin-stat-val">{certificates.length}</div>
              </div>
              <div className="admin-stat-card glass-card">
                <div className="admin-stat-header">Unread Messages</div>
                <div className="admin-stat-val" style={{ color: unreadMessagesCount > 0 ? 'var(--accent-primary)' : 'inherit' }}>{unreadMessagesCount}</div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Recent Contact Messages</h3>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.slice(0, 5).map(msg => (
                        <tr key={msg._id} style={{ fontWeight: !msg.read ? 'bold' : 'normal' }}>
                          <td>{msg.name}</td>
                          <td>{msg.email}</td>
                          <td>{msg.subject || '(No Subject)'}</td>
                          <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</td>
                          <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                          <td className="admin-actions-cell">
                            {!msg.read && (
                              <button className="admin-action-btn admin-action-btn-edit" onClick={() => markMessageRead(msg._id)} title="Mark as read">
                                <Check size={16} />
                              </button>
                            )}
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteMessage(msg._id)} title="Delete message">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Update Profile Information</h3>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Title / Headline</label>
                  <input type="text" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Intro Bio (Short summary for hero)</label>
                <input type="text" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Bio Details (For About Me)</label>
                <textarea rows="4" value={profile.bioDetails} onChange={e => setProfile({ ...profile, bioDetails: e.target.value })}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input type="text" value={profile.github} onChange={e => setProfile({ ...profile, github: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="text" value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Instagram URL</label>
                  <input type="text" value={profile.instagram || ''} onChange={e => setProfile({ ...profile, instagram: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Profile Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={profile.profileImage} onChange={e => setProfile({ ...profile, profileImage: e.target.value })} placeholder="Image URL or upload file" style={{ flexGrow: 1 }} />
                    <label className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      Upload Photo
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'profileImage')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Resume</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={profile.resumeUrl} onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })} placeholder="Resume URL or upload file" style={{ flexGrow: 1 }} />
                    <label className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      Upload Resume
                      <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileUpload(e, 'resumeUrl')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: 'var(--accent-primary)', margin: 0 }}>Core Principles Settings</h4>
                  <button type="button" className="btn btn-secondary" onClick={handleAddPrinciple} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Plus size={14} /> Add Principle
                  </button>
                </div>
                
                {(profile.corePrinciples || []).map((principle, index) => (
                  <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px dashed var(--border-glass)', borderRadius: '8px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Principle {index + 1}</span>
                      <button type="button" onClick={() => handleRemovePrinciple(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Remove Principle">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title</label>
                        <input 
                          type="text" 
                          value={getPrincipleTitle(index)} 
                          onChange={e => handlePrincipleChange(index, 'title', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <input 
                          type="text" 
                          value={getPrincipleDesc(index)} 
                          onChange={e => handlePrincipleChange(index, 'description', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Settings</button>
            </form>
          </div>

          {/* Account Credentials Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--accent-primary)" /> Admin Account Settings
            </h3>
            <form onSubmit={handleCredentialsUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>Admin Name (Username)</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  placeholder="New admin username" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Admin Email (For OTP Password Reset)</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  placeholder="New admin email" 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Account Settings</button>
            </form>
          </div>
        </div>
      )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Projects List</h3>
              {projects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(proj => (
                        <tr key={proj._id}>
                          <td>{proj.title}</td>
                          <td>{proj.category}</td>
                          <td>{proj.featured ? 'Yes' : 'No'}</td>
                          <td className="admin-actions-cell">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => startEditProject(proj)} title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteProject(proj._id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
              <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label>Project Title</label>
                  <input type="text" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <input type="text" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Long Detailed Description</label>
                  <textarea rows="3" value={projectForm.longDescription} onChange={e => setProjectForm({ ...projectForm, longDescription: e.target.value })}></textarea>
                </div>
                <div className="form-group">
                  <label>Tags (Comma separated)</label>
                  <input type="text" value={projectForm.tags} onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="React, Express, MongoDB" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={projectForm.category} 
                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: '10px', color: 'var(--text-primary)', borderRadius: '4px' }}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} placeholder="Image URL or upload file" style={{ flexGrow: 1 }} />
                    <label className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleProjectImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Live Link</label>
                    <input type="text" value={projectForm.link} onChange={e => setProjectForm({ ...projectForm, link: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>GitHub Code Link</label>
                    <input type="text" value={projectForm.github} onChange={e => setProjectForm({ ...projectForm, github: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="chk-feat" checked={projectForm.featured} onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })} />
                  <label htmlFor="chk-feat">Featured Project</label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">{editingProject ? 'Save Changes' : 'Add Project'}</button>
                  {editingProject && <button type="button" className="btn btn-secondary" onClick={resetProjectForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Journey Timeline</h3>
              {experiences.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No journey elements loaded.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Title</th>
                        <th>Organization</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences.map(exp => (
                        <tr key={exp._id}>
                          <td>
                            <span style={{ 
                              textTransform: 'capitalize',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: exp.type === 'work' ? 'rgba(59, 130, 246, 0.15)' : exp.type === 'internship' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: exp.type === 'work' 
                                ? (theme === 'light' ? '#1d4ed8' : '#3b82f6') 
                                : exp.type === 'internship' 
                                  ? (theme === 'light' ? '#7c3aed' : '#a855f7') 
                                  : (theme === 'light' ? '#047857' : '#10b981')
                            }}>
                              {exp.type || 'work'}
                            </span>
                          </td>
                          <td>{exp.title}</td>
                          <td>{exp.company}</td>
                          <td>{exp.fromDate && exp.toDate ? `${exp.fromDate} - ${exp.toDate}` : exp.duration}</td>
                          <td className="admin-actions-cell">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => startEditExperience(exp)} title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteExperience(exp._id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3>{editingExperience ? 'Edit Experience' : 'Add Experience'}</h3>
              <form onSubmit={handleExperienceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={experienceForm.type} 
                    onChange={e => setExperienceForm({ ...experienceForm, type: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: '10px', color: 'var(--text-primary)', borderRadius: '4px' }}
                  >
                    <option value="work">Work History</option>
                    <option value="internship">Internship</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Title (e.g. Senior Software Engineer)</label>
                  <input type="text" value={experienceForm.title} onChange={e => setExperienceForm({ ...experienceForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Company / Institution</label>
                  <input type="text" value={experienceForm.company} onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={experienceForm.location} onChange={e => setExperienceForm({ ...experienceForm, location: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>From Date (e.g. Oct 2023)</label>
                    <input type="text" value={experienceForm.fromDate} onChange={e => setExperienceForm({ ...experienceForm, fromDate: e.target.value })} placeholder="e.g. Oct 2023" required />
                  </div>
                  <div className="form-group">
                    <label>To Date (e.g. Dec 2025)</label>
                    <input type="text" value={experienceForm.toDate} onChange={e => setExperienceForm({ ...experienceForm, toDate: e.target.value })} placeholder="e.g. Dec 2025" required={!experienceForm.isCurrent} disabled={experienceForm.isCurrent} />
                  </div>
                </div>
                <div className="form-group" style={{ flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="chk-current" checked={experienceForm.isCurrent} onChange={e => setExperienceForm({ ...experienceForm, isCurrent: e.target.checked })} />
                  <label htmlFor="chk-current">I currently work here</label>
                </div>
                <div className="form-group">
                  <label>Description Bullets (One per line)</label>
                  <textarea rows="4" value={experienceForm.description} onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })} placeholder="Led frontend dev&#10;Mentored junior engineers"></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">{editingExperience ? 'Save Changes' : 'Add Item'}</button>
                  {editingExperience && <button type="button" className="btn btn-secondary" onClick={resetExperienceForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: SKILLS */}
        {activeTab === 'skills' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Technical Skills</h3>
              {skills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No skills created yet.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map(sk => (
                        <tr key={sk._id}>
                          <td>{sk.name}</td>
                          <td>{sk.level}%</td>
                          <td>{sk.category}</td>
                          <td className="admin-actions-cell">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => startEditSkill(sk)} title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteSkill(sk._id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h3>
              <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label>Skill Name</label>
                  <input type="text" value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Skill Level (%)</label>
                  <input type="number" min="0" max="100" value={skillForm.level} onChange={e => setSkillForm({ ...skillForm, level: parseInt(e.target.value) || 80 })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={skillForm.category} 
                    onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: '10px', color: 'var(--text-primary)', borderRadius: '4px' }}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">{editingSkill ? 'Save Changes' : 'Add Skill'}</button>
                  {editingSkill && <button type="button" className="btn btn-secondary" onClick={resetSkillForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: INBOX MESSAGES */}
        {activeTab === 'messages' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Messages Inbox</h3>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No messages in inbox.</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg._id} style={{ fontWeight: !msg.read ? 'bold' : 'normal' }}>
                        <td>{msg.name}</td>
                        <td>{msg.email}</td>
                        <td>{msg.subject || '(No Subject)'}</td>
                        <td style={{ maxWidth: '350px', whiteSpace: 'pre-wrap' }}>{msg.message}</td>
                        <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                        <td className="admin-actions-cell">
                          {!msg.read && (
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => markMessageRead(msg._id)} title="Mark as read">
                              <Check size={16} />
                            </button>
                          )}
                          <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteMessage(msg._id)} title="Delete message">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Certificates List</h3>
              {certificates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No certificates found.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Issuer</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map(cert => (
                        <tr key={cert._id}>
                          <td>{cert.name}</td>
                          <td>{cert.issuer}</td>
                          <td>{cert.category || 'Other'}</td>
                          <td>{cert.date}</td>
                          <td className="admin-actions-cell">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => startEditCertificate(cert)} title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => deleteCertificate(cert._id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3>{editingCertificate ? 'Edit Certificate' : 'Add Certificate'}</h3>
              <form onSubmit={handleCertificateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label>Certificate Title</label>
                  <input type="text" value={certificateForm.name} onChange={e => setCertificateForm({ ...certificateForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Issuer / Provider</label>
                  <input type="text" value={certificateForm.issuer} onChange={e => setCertificateForm({ ...certificateForm, issuer: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date Earned (e.g. Dec 2025)</label>
                  <input type="text" value={certificateForm.date} onChange={e => setCertificateForm({ ...certificateForm, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Verification Link (Optional)</label>
                  <input type="text" value={certificateForm.verificationUrl} onChange={e => setCertificateForm({ ...certificateForm, verificationUrl: e.target.value })} placeholder="e.g. Credly link" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    list="cert-categories" 
                    value={certificateForm.category} 
                    onChange={e => setCertificateForm({ ...certificateForm, category: e.target.value })}
                    placeholder="e.g. Cloud, Frontend, Database, Security"
                    required
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: '10px', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <datalist id="cert-categories">
                    {['Cloud', 'Frontend', 'Database', ...new Set(certificates.map(c => c.category).filter(Boolean))].map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Certificate Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={certificateForm.image} onChange={e => setCertificateForm({ ...certificateForm, image: e.target.value })} placeholder="Image URL or upload file" style={{ flexGrow: 1 }} />
                    <label className="btn btn-secondary" style={{ padding: '8px 12px', margin: 0, fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleCertificateImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">{editingCertificate ? 'Save Changes' : 'Add Certificate'}</button>
                  {editingCertificate && <button type="button" className="btn btn-secondary" onClick={resetCertificateForm}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: PRIVATE VAULT */}
        {activeTab === 'vault' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <Lock size={22} color={theme === 'light' ? 'var(--accent-primary)' : '#a78bfa'} />
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Private Document Vault</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Upload sensitive documents and share access links securely.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px', alignItems: 'start' }}>
              {/* Upload / Edit Form */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingVaultDoc ? <Edit2 size={18} color="var(--accent-primary)" /> : <Plus size={18} color="var(--accent-primary)" />}
                  {editingVaultDoc ? 'Edit Vault Document' : 'Upload Document'}
                </h3>
                <form onSubmit={handleVaultDocSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label>Document Title</label>
                    <input type="text" value={vaultDocForm.title} onChange={e => setVaultDocForm({ ...vaultDocForm, title: e.target.value })} placeholder="e.g. Aadhaar Card" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={vaultDocForm.category} onChange={e => setVaultDocForm({ ...vaultDocForm, category: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', outline: 'none', cursor: 'pointer' }}>
                      {['Aadhaar', 'PAN', 'Bank Passbook', 'Driving License', 'Passport', 'Marksheet', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>File (PDF or Image)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={vaultDocForm.file ? vaultDocForm.file.name : ''} 
                        placeholder={editingVaultDoc ? "Keep current file" : "No file chosen"} 
                        style={{ flexGrow: 1, background: 'rgba(15, 23, 42, 0.4)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', outline: 'none' }} 
                        required={!editingVaultDoc}
                      />
                      <label className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        Browse...
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          onChange={e => setVaultDocForm({ ...vaultDocForm, file: e.target.files[0] })} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, justifyContent: 'center' }}>
                      {editingVaultDoc ? 'Save Changes' : 'Upload to Vault'}
                    </button>
                    {editingVaultDoc && (
                      <button type="button" className="btn btn-secondary" onClick={resetVaultDocForm} style={{ justifyContent: 'center' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Create Access Link */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkIcon size={18} color="var(--accent-primary)" /> Create Access Link
                </h3>
                <form onSubmit={handleCreateAccessToken} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label>Label (Who is it for?)</label>
                    <input type="text" value={vaultAccessForm.label} onChange={e => setVaultAccessForm({ ...vaultAccessForm, label: e.target.value })} placeholder="e.g. HR - TCS, Bank Manager" required />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date & Time</label>
                    <input type="datetime-local" value={vaultAccessForm.expiresAt} onChange={e => setVaultAccessForm({ ...vaultAccessForm, expiresAt: e.target.value })} required style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', width: '100%', outline: 'none' }} />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Select Documents to Share</label>
                      {privateDocs.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setVaultAccessForm({
                                ...vaultAccessForm,
                                documentIds: privateDocs.map(d => d._id)
                              });
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6366f1',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              padding: 0
                            }}
                          >
                            Select All
                          </button>
                          {vaultAccessForm.documentIds && vaultAccessForm.documentIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setVaultAccessForm({
                                  ...vaultAccessForm,
                                  documentIds: []
                                });
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                padding: 0
                              }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {privateDocs.length === 0 ? (
                      <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>⚠️ No documents uploaded yet. Upload one first.</p>
                    ) : (
                      <div>
                        <select
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'all') {
                              setVaultAccessForm({
                                ...vaultAccessForm,
                                documentIds: privateDocs.map(d => d._id)
                              });
                            } else if (val && !vaultAccessForm.documentIds?.includes(val)) {
                              setVaultAccessForm({
                                ...vaultAccessForm,
                                documentIds: [...(vaultAccessForm.documentIds || []), val]
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">-- Choose documents to share --</option>
                          {vaultAccessForm.documentIds?.length < privateDocs.length && (
                            <option value="all">★ Select All Documents ({privateDocs.length})</option>
                          )}
                          {privateDocs.map(doc => (
                            <option 
                              key={doc._id} 
                              value={doc._id} 
                              disabled={vaultAccessForm.documentIds?.includes(doc._id)}
                            >
                              {doc.title} ({doc.category})
                            </option>
                          ))}
                        </select>

                        {/* Selected Documents Tags */}
                        {vaultAccessForm.documentIds && vaultAccessForm.documentIds.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {vaultAccessForm.documentIds.map(id => {
                              const doc = privateDocs.find(d => d._id === id);
                              if (!doc) return null;
                              return (
                                <span 
                                  key={id} 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    color: '#a5b4fc',
                                    padding: '4px 10px',
                                    borderRadius: '16px',
                                    fontSize: '0.8rem',
                                    border: '1px solid rgba(99, 102, 241, 0.35)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {doc.title} ({doc.category})
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setVaultAccessForm({
                                        ...vaultAccessForm,
                                        documentIds: vaultAccessForm.documentIds.filter(dId => dId !== id)
                                      });
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem',
                                      padding: '0 2px',
                                      marginLeft: '4px',
                                      fontWeight: 'bold',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Remove document"
                                  >
                                    ✕
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <input 
                      type="checkbox" 
                      id="allowDownload" 
                      checked={vaultAccessForm.allowDownload} 
                      onChange={e => setVaultAccessForm({ ...vaultAccessForm, allowDownload: e.target.checked })} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px', padding: 0, margin: 0, minWidth: '16px' }}
                    />
                    <label htmlFor="allowDownload" style={{ margin: 0, cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Grant Download Access (Allow viewers to download)
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={privateDocs.length === 0}>Generate Access Link</button>
                </form>
              </div>
            </div>

            {/* Documents List */}
            <div className="glass-card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📁 Vault Documents ({privateDocs.length})</h3>
              {privateDocs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No documents uploaded yet.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Title</th><th>Category</th><th>File</th><th>Uploaded</th><th>Action</th></tr></thead>
                    <tbody>
                      {privateDocs.map(doc => (
                        <tr key={doc._id}>
                          <td>{doc.title}</td>
                          <td><span style={{ background: 'rgba(99,102,241,0.15)', color: theme === 'light' ? '#4f46e5' : '#a5b4fc', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{doc.category}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{doc.fileName}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className="admin-actions-cell">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => startEditVaultDoc(doc)} title="Edit"><Edit2 size={14} /></button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleDeleteVaultDoc(doc._id)} title="Delete"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Access Tokens List */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>🔑 Access Links ({accessTokens.length})</h3>
                {accessTokens.length > 0 && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowAllViewersModal(true)}
                    style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Users size={16} /> View All Viewers Log
                  </button>
                )}
              </div>
              {accessTokens.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No access links created yet.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Label</th><th>Shared Docs</th><th>Expires</th><th>Viewers Log</th><th style={{ textAlign: 'center' }}>Views</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {accessTokens.map(t => {
                        const expired = new Date() > new Date(t.expiresAt);
                        const sharedDocs = privateDocs.filter(d => t.documentIds?.includes(d._id));
                        const viewerCount = t.viewers && t.viewers.length > 0 ? t.viewers.length : (t.viewerName ? 1 : 0);
                        return (
                          <tr key={t._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{t.label}</div>
                              <div style={{ fontSize: '0.72rem', color: t.allowDownload ? '#10b981' : '#f59e0b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {t.allowDownload ? '🔓 Downloadable' : '🔒 View-Only'}
                              </div>
                            </td>
                            <td>
                              {t.documentIds && t.documentIds.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {sharedDocs.length > 0 ? (
                                    sharedDocs.map(d => (
                                      <span key={d._id} style={{ background: 'rgba(167,139,250,0.15)', color: theme === 'light' ? '#7c3aed' : '#c084fc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }} title={d.title}>
                                        {d.title}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Docs deleted</span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>All Documents</span>
                              )}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: expired ? '#ef4444' : 'var(--text-secondary)' }}>{new Date(t.expiresAt).toLocaleString()}</td>
                            <td>
                              {viewerCount > 0 ? (
                                <button
                                  onClick={() => setSelectedViewersToken(t)}
                                  style={{
                                    background: 'rgba(99,102,241,0.15)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    color: theme === 'light' ? '#4f46e5' : '#a5b4fc',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: 600
                                  }}
                                  title="Click to view all viewers"
                                >
                                  <Users size={13} /> {viewerCount} Viewer{viewerCount > 1 ? 's' : ''}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No viewers yet</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{t.viewCount || 0}</td>
                            <td>
                              {expired ? (
                                <span style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>EXPIRED</span>
                              ) : (
                                <span style={{ color: '#22c55e', fontSize: '0.78rem', fontWeight: 600 }}>ACTIVE</span>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'middle' }}>
                              <div className="admin-actions-cell" style={{ alignItems: 'center' }}>
                                <button
                                  className="admin-action-btn"
                                  onClick={() => setSelectedViewersToken(t)}
                                  title="View all viewers"
                                  style={{
                                    color: '#a78bfa',
                                    background: 'none',
                                    transition: 'var(--transition)',
                                    borderRadius: '4px',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                >
                                  <Users size={16} />
                                </button>
                                <button
                                  className="admin-action-btn admin-action-btn-edit"
                                  onClick={() => copyAccessLink(t.accessToken)}
                                  title="Copy link"
                                  style={{
                                    background: copiedToken === t.accessToken ? 'rgba(34, 197, 94, 0.15)' : 'none',
                                    color: copiedToken === t.accessToken ? '#22c55e' : undefined,
                                    transition: 'var(--transition)',
                                  }}
                                >
                                  {copiedToken === t.accessToken ? <Check size={16} /> : <LinkIcon size={16} />}
                                </button>
                                <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleRevokeToken(t._id)} title="Revoke">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Viewers List Modal (Per Link) */}
            {selectedViewersToken && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
              }}>
                <div style={{
                  background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '85vh',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="#6366f1" /> Viewers Log — {selectedViewersToken.label}
                      </h3>
                      <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Total Views: <strong>{selectedViewersToken.viewCount || 0}</strong> • Created: {new Date(selectedViewersToken.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => setSelectedViewersToken(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {((selectedViewersToken.viewers && selectedViewersToken.viewers.length > 0) || selectedViewersToken.viewerName) ? (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Viewer Name</th>
                            <th>Email Address</th>
                            <th>Viewed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedViewersToken.viewers && selectedViewersToken.viewers.length > 0 ? (
                            selectedViewersToken.viewers.map((v, idx) => (
                              <tr key={idx}>
                                <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                                <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{v.name || 'Anonymous'}</td>
                                <td style={{ color: '#a5b4fc' }}>{v.email || 'N/A'}</td>
                                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.viewedAt ? new Date(v.viewedAt).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td>1</td>
                              <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{selectedViewersToken.viewerName}</td>
                              <td style={{ color: '#a5b4fc' }}>{selectedViewersToken.viewerEmail}</td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedViewersToken.viewedAt ? new Date(selectedViewersToken.viewedAt).toLocaleString() : 'N/A'}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>No viewers have accessed this link yet.</p>
                    )}
                  </div>

                  <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedViewersToken(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}

            {/* Master All Viewers Log Modal */}
            {showAllViewersModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
              }}>
                <div style={{
                  background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '85vh',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="#6366f1" /> All Document Viewers Master Log
                      </h3>
                      <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Consolidated history of all individuals who accessed shared private documents
                      </p>
                    </div>
                    <button onClick={() => setShowAllViewersModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {(() => {
                      const allViewersList = [];
                      accessTokens.forEach(t => {
                        if (t.viewers && t.viewers.length > 0) {
                          t.viewers.forEach(v => {
                            allViewersList.push({ ...v, tokenLabel: t.label });
                          });
                        } else if (t.viewerName) {
                          allViewersList.push({ name: t.viewerName, email: t.viewerEmail, viewedAt: t.viewedAt, tokenLabel: t.label });
                        }
                      });

                      if (allViewersList.length === 0) {
                        return <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>No viewers recorded across any links yet.</p>;
                      }

                      allViewersList.sort((a, b) => new Date(b.viewedAt || 0) - new Date(a.viewedAt || 0));

                      return (
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Access Link Label</th>
                              <th>Viewer Name</th>
                              <th>Email</th>
                              <th>Viewed At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allViewersList.map((v, idx) => (
                              <tr key={idx}>
                                <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                                <td><span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>{v.tokenLabel}</span></td>
                                <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{v.name || 'Anonymous'}</td>
                                <td style={{ color: '#a5b4fc' }}>{v.email || 'N/A'}</td>
                                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.viewedAt ? new Date(v.viewedAt).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>

                  <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
                    <button className="btn btn-secondary" onClick={() => setShowAllViewersModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
