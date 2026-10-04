import React, { useState, useEffect } from 'react';
import { FolderGit2, BookOpen, Download, ExternalLink, Code, Sparkles, PlusCircle, ThumbsUp, CheckCircle, Eye, Star, Award, Search, Filter, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PROJECTS = [
  {
    id: 'proj_default_1',
    title: 'EduNova AI Vision Tutor & 3D Math Grapher',
    creator: 'Alex Chen (MIT)',
    category: 'AI & Machine Learning',
    description: 'Real-time WebGL and OpenCV hand-tracking system that turns physical whiteboard drawings into interactive 3D graphs and step-by-step calculus solutions.',
    techStack: ['React', 'Python', 'OpenCV', 'Three.js', 'Gemini API'],
    demoUrl: 'https://github.com',
    codeUrl: 'https://github.com',
    upvotes: 48,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_default_2',
    title: 'QuantumSim - WebAssembly Bloch Sphere Visualizer',
    creator: 'Sarah Jenkins (Stanford)',
    category: 'Quantum Computing',
    description: 'Browser-native quantum circuit simulator executing Qiskit algorithms with 60fps WebGL Bloch sphere state vectors.',
    techStack: ['TypeScript', 'WebAssembly', 'Rust', 'Chart.js'],
    demoUrl: 'https://github.com',
    codeUrl: 'https://github.com',
    upvotes: 36,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_default_3',
    title: 'Neural Flashcards & Spaced Repetition Engine',
    creator: 'Rohan Gupta (IIT)',
    category: 'EdTech Tools',
    description: 'Automated textbook PDF chunking and active recall card generator powered by custom transformer embeddings.',
    techStack: ['Next.js', 'FastAPI', 'PyTorch', 'Tailwind'],
    demoUrl: 'https://github.com',
    codeUrl: 'https://github.com',
    upvotes: 52,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_RESOURCES = [
  {
    id: 'res_default_1',
    title: 'Operating Systems Kernel & Memory Management Cheatsheet',
    type: 'Formula Sheet',
    subject: 'Computer Science',
    author: 'Prof. Devanshi Mehta',
    downloadsCount: 142,
    createdAt: new Date().toISOString()
  },
  {
    id: 'res_default_2',
    title: 'Advanced Multivariable Calculus & Fourier Transforms Visual Guide',
    type: 'Mind Map',
    subject: 'Mathematics',
    author: 'Kavya Shah',
    downloadsCount: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: 'res_default_3',
    title: 'Deep Learning Transformer Attention & LLM Architectures Review',
    type: 'Exam Notes',
    subject: 'AI & Machine Learning',
    author: 'Arjun Sharma',
    downloadsCount: 215,
    createdAt: new Date().toISOString()
  }
];

export const ProjectsTab = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('edunova_community_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_PROJECTS;
  });

  const [upvotedProjects, setUpvotedProjects] = useState(() => {
    const saved = localStorage.getItem('edunova_upvoted_projects');
    return saved ? JSON.parse(saved) : ['proj_default_1'];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [celebrationToast, setCelebrationToast] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState(user?.name || user?.username || 'EduNova Scholar');
  const [category, setCategory] = useState('AI & Machine Learning');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('React, Node.js, Gemini API');
  const [demoUrl, setDemoUrl] = useState('https://github.com');
  const [codeUrl, setCodeUrl] = useState('https://github.com');

  useEffect(() => {
    localStorage.setItem('edunova_community_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('edunova_upvoted_projects', JSON.stringify(upvotedProjects));
  }, [upvotedProjects]);

  const handleUpvote = (id) => {
    if (upvotedProjects.includes(id)) {
      setUpvotedProjects(upvotedProjects.filter(p => p !== id));
      setProjects(projects.map(p => p.id === id ? { ...p, upvotes: Math.max(0, (p.upvotes || 0) - 1) } : p));
    } else {
      setUpvotedProjects([...upvotedProjects, id]);
      setProjects(projects.map(p => p.id === id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newProject = {
      id: `proj_${Date.now()}`,
      title: title.trim(),
      creator: creator.trim() || 'EduNova Scholar',
      category,
      description: description.trim(),
      techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
      demoUrl: demoUrl.trim() || 'https://github.com',
      codeUrl: codeUrl.trim() || 'https://github.com',
      upvotes: 1,
      createdAt: new Date().toISOString()
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    setUpvotedProjects(prev => [...prev, newProject.id]);
    
    // Trigger XP Celebration
    setCelebrationToast(`🎉 Showcase Published! Earned +50 XP for contributing to EduNova Network!`);
    setTimeout(() => setCelebrationToast(null), 5000);

    setTitle('');
    setDescription('');
    setTechStack('React, Node.js, Gemini API');
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory || (selectedCategory === 'Other' && !['AI & Machine Learning', 'Quantum Computing', 'EdTech Tools'].includes(p.category));
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || (p.techStack || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Celebration XP Toast */}
      {celebrationToast && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(147, 51, 234, 0.25))',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)',
          backdropFilter: 'blur(16px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <Award size={24} color="var(--accent-cyan)" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
              Project Published Successfully!
            </strong>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 700 }}>
              {celebrationToast}
            </span>
          </div>
          <button onClick={() => setCelebrationToast(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', maxWidth: '100%', minWidth: 0 }}>
            Community Projects Showcase <span className="cyber-badge-cyan" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{projects.length} Published</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Discover open-source AI prototypes, WebGL simulators, and research notebooks built by peers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={15} /> Submit Your Project
          </Button>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '38px',
              paddingRight: '14px',
              paddingTop: '8px',
              paddingBottom: '8px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'AI & Machine Learning', 'Quantum Computing', 'EdTech Tools'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: selectedCategory === cat ? 'rgba(34, 211, 238, 0.15)' : 'var(--glass-bg)',
                color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border-color)',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <FolderGit2 size={42} color="var(--accent-cyan)" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', margin: '0 0 8px', fontWeight: 800 }}>
            No Matching Community Projects Found
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Be the first scholar to publish a project in this category or adjust your search filter!
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={15} /> Submit Your Project
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((proj) => {
            const hasUpvoted = upvotedProjects.includes(proj.id);
            return (
              <div
                key={proj.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(13, 19, 38, 0.8), rgba(24, 34, 68, 0.6))',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Glowing subtle top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="cyber-badge-cyan" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {proj.category || 'Project Showcase'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} color="var(--accent-yellow)" /> By {proj.creator}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {proj.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {proj.description}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {(proj.techStack || []).map((t) => (
                      <span key={t} className="cyber-badge" style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)' }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    size="sm"
                    variant={hasUpvoted ? 'cyan' : 'outline'}
                    onClick={() => handleUpvote(proj.id)}
                    style={{ padding: '8px 12px' }}
                    title="Upvote Project"
                  >
                    <ThumbsUp size={14} /> {proj.upvotes || 0}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewProject(proj)}
                    style={{ flex: 1 }}
                  >
                    <Eye size={14} /> Preview
                  </Button>
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button size="sm">
                      <ExternalLink size={14} /> Demo
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Preview Drawer Modal */}
      {previewProject && (
        <Modal isOpen={!!previewProject} onClose={() => setPreviewProject(null)} title={previewProject.title}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="cyber-badge-cyan">{previewProject.category}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created by {previewProject.creator}</span>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h5 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Project Description:</h5>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {previewProject.description}
              </p>
            </div>

            <div>
              <h5 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Technologies Used:</h5>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(previewProject.techStack || []).map(t => (
                  <span key={t} className="cyber-badge-purple">{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <a href={previewProject.demoUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                <Button size="lg" style={{ width: '100%' }}>
                  <ExternalLink size={16} /> Open Live Interactive Demo
                </Button>
              </a>
              <a href={previewProject.codeUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                <Button size="lg" variant="outline" style={{ width: '100%' }}>
                  <Code size={16} /> View Source Code
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Submit Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Your Community Project">
        <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Project Title:
            </label>
            <input
              type="text"
              placeholder="e.g. EduAI - AI-Powered Automated Study Plan Generator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Quantum Computing">Quantum Computing</option>
                <option value="EdTech Tools">EdTech Tools</option>
                <option value="Web & Apps">Web & Apps</option>
                <option value="Systems & Security">Systems & Security</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Creator Name:
              </label>
              <input
                type="text"
                placeholder="Your name or handle"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Project Overview:
            </label>
            <textarea
              rows={3}
              placeholder="Describe the problem your project solves, key features, and implementation highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Tech Stack (comma separated):
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Python, Gemini API, Tailwind"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Live Demo URL:
              </label>
              <input
                type="text"
                placeholder="https://myproject.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Repository Code URL:
              </label>
              <input
                type="text"
                placeholder="https://github.com/username/project"
                value={codeUrl}
                onChange={(e) => setCodeUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <Button type="submit" size="lg" style={{ marginTop: '8px' }}>
            <PlusCircle size={16} /> Publish Project Showcase (+50 XP)
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export const ResourcesTab = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('edunova_study_resources');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_RESOURCES;
  });

  const [downloadNotification, setDownloadNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Formula Sheet');
  const [subject, setSubject] = useState('Computer Science');
  const [author, setAuthor] = useState(user?.name || user?.username || 'EduNova Scholar');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('edunova_study_resources', JSON.stringify(resources));
  }, [resources]);

  const handleDownload = (res) => {
    setResources(resources.map(r => r.id === res.id ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r));

    setDownloadNotification(`Downloading "${res.title}"... File successfully prepared! (+10 XP)`);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 4000);
  };

  const handleUploadResource = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newResource = {
      id: `res_${Date.now()}`,
      title: title.trim(),
      type,
      subject,
      author: author.trim() || 'EduNova Scholar',
      downloadsCount: 0,
      createdAt: new Date().toISOString()
    };

    setResources([newResource, ...resources]);
    setDownloadNotification(`🎉 Resource Uploaded! Earned +30 XP!`);
    setTimeout(() => setDownloadNotification(null), 4000);

    setTitle('');
    setIsModalOpen(false);
  };

  const filteredResources = resources.filter(r => selectedSubject === 'All' || r.subject === selectedSubject);

  return (
    <div>
      {/* Top Bar Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Shared Study Materials <span className="cyber-badge-purple" style={{ fontSize: '0.75rem' }}>{resources.length} Available</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Download verified formula sheets, exam summaries, and mind maps shared by top scholars.
          </p>
        </div>

        <Button size="sm" variant="purple" onClick={() => setIsModalOpen(true)}>
          <Sparkles size={15} /> Upload Study Resource
        </Button>
      </div>

      {/* Download / Upload Alert Notification */}
      {downloadNotification && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(147, 51, 234, 0.2))',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(34, 211, 238, 0.15)'
        }}>
          <CheckCircle size={20} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            {downloadNotification}
          </span>
        </div>
      )}

      {/* Subject Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['All', 'Computer Science', 'Mathematics', 'AI & Machine Learning'].map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedSubject === sub ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
              background: selectedSubject === sub ? 'rgba(147, 51, 234, 0.2)' : 'var(--glass-bg)',
              color: selectedSubject === sub ? 'var(--accent-purple)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {filteredResources.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border-color)',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <BookOpen size={42} color="var(--accent-purple)" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', margin: '0 0 8px', fontWeight: 800 }}>
            No Shared Study Materials in this Subject
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Upload formula sheets, exam notes, and mind maps to help your batchmates learn faster.
          </p>
          <Button size="sm" variant="purple" onClick={() => setIsModalOpen(true)}>
            <Sparkles size={15} /> Upload Study Resource
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredResources.map((res) => (
            <div
              key={res.id}
              style={{
                background: 'linear-gradient(135deg, rgba(13, 19, 38, 0.8), rgba(24, 34, 68, 0.6))',
                backdropFilter: 'blur(16px)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(147, 51, 234, 0.25)',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span className="cyber-badge-purple" style={{ fontSize: '0.72rem' }}>{res.type}</span>
                  <span className="cyber-badge-cyan" style={{ fontSize: '0.72rem' }}>{res.subject}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                  {res.title}
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Uploaded by <strong>{res.author}</strong> • {res.downloadsCount || 0} Downloads
                </span>
              </div>

              <Button size="sm" variant="purple" onClick={() => handleDownload(res)} style={{ minWidth: '110px' }}>
                <Download size={14} /> Download
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Uploading Study Resource */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Shared Study Material">
        <form onSubmit={handleUploadResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Resource Title:
            </label>
            <input
              type="text"
              placeholder="e.g. Operating Systems Kernel & Process Scheduling Cheatsheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Resource Type:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="Formula Sheet">Formula Sheet</option>
                <option value="Exam Notes">Exam Notes</option>
                <option value="Mind Map">Mind Map</option>
                <option value="Practice Paper">Practice Paper</option>
                <option value="Code Cheatsheet">Code Cheatsheet</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Subject / Topic:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics & Electronics">Physics & Electronics</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="General Engineering">General Engineering</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Author / Uploader Name:
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              File Attachment Link or Document URL:
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/file/... or paste link"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <Button type="submit" size="lg" variant="purple" style={{ marginTop: '8px' }}>
            <Sparkles size={16} /> Publish Study Material (+30 XP)
          </Button>
        </form>
      </Modal>
    </div>
  );
};



