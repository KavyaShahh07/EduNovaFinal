import React, { useState, useEffect } from 'react';
import { Users, Calendar, ArrowRight, PlusCircle, Video, CheckCircle2, X, Award, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

const DEFAULT_GROUPS = [
  {
    id: 'group_default_1',
    name: 'LeetCode Hard & System Design Pod',
    category: 'Computer Science',
    description: 'Daily 1-hour live coding sessions solving DP, Graph algorithms, and distributed systems architecture.',
    nextSession: 'Today @ 7:00 PM',
    avatar: '💻',
    membersCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'group_default_2',
    name: 'GATE & GRE Mathematics Deep Dive',
    category: 'Mathematics',
    description: 'Solving past 10 years linear algebra, probability, and discrete math exam problems together.',
    nextSession: 'Tomorrow @ 5:30 PM',
    avatar: '🧠',
    membersCount: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'group_default_3',
    name: 'Full-Stack Web3 & AI Prototypes Lab',
    category: 'AI & Data Science',
    description: 'Hands-on peer review for building full-stack AI web applications and deploying models to cloud.',
    nextSession: 'Friday @ 8:00 PM',
    avatar: '🚀',
    membersCount: 22,
    createdAt: new Date().toISOString()
  }
];

export const StudyGroupsTab = () => {
  const [studyGroups, setStudyGroups] = useState(() => {
    const saved = localStorage.getItem('edunova_study_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GROUPS;
  });

  const [joinedGroups, setJoinedGroups] = useState(() => {
    const saved = localStorage.getItem('edunova_joined_study_groups');
    return saved ? JSON.parse(saved) : ['group_default_1'];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [celebrationToast, setCelebrationToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [nextSession, setNextSession] = useState('Today @ 7:00 PM');
  const [avatar, setAvatar] = useState('💻');

  useEffect(() => {
    localStorage.setItem('edunova_study_groups', JSON.stringify(studyGroups));
  }, [studyGroups]);

  useEffect(() => {
    localStorage.setItem('edunova_joined_study_groups', JSON.stringify(joinedGroups));
  }, [joinedGroups]);

  const toggleJoin = (groupId) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter((g) => g !== groupId));
      setStudyGroups(studyGroups.map(g => g.id === groupId ? { ...g, membersCount: Math.max(1, (g.membersCount || 1) - 1) } : g));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
      setStudyGroups(studyGroups.map(g => g.id === groupId ? { ...g, membersCount: (g.membersCount || 1) + 1 } : g));
      setCelebrationToast(`🎉 Joined Study Circle! +15 XP Awarded!`);
      setTimeout(() => setCelebrationToast(null), 4000);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const newGroup = {
      id: `group_${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      nextSession: nextSession.trim() || 'Tomorrow @ 6:00 PM',
      avatar: avatar || '🚀',
      membersCount: 1,
      createdAt: new Date().toISOString()
    };

    const updated = [newGroup, ...studyGroups];
    setStudyGroups(updated);
    setJoinedGroups(prev => [...prev, newGroup.id]);

    setCelebrationToast(`🎉 Study Circle Formed! Earned +25 XP! Level Up Progress Updated!`);
    setTimeout(() => setCelebrationToast(null), 5000);

    // Reset form
    setName('');
    setDescription('');
    setNextSession('Today @ 7:00 PM');
    setAvatar('💻');
    setIsModalOpen(false);
  };

  const filteredGroups = studyGroups.filter(g => selectedCategory === 'All' || g.category === selectedCategory);

  return (
    <div>
      {/* Celebration Toast */}
      {celebrationToast && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(34, 211, 238, 0.25))',
          border: '1px solid var(--accent-purple)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(147, 51, 234, 0.2)',
          backdropFilter: 'blur(16px)'
        }}>
          <Award size={24} color="var(--accent-purple)" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
              Study Circle Activity Updated!
            </strong>
            <span style={{ color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 700 }}>
              {celebrationToast}
            </span>
          </div>
          <button onClick={() => setCelebrationToast(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Active Study Circles <span className="cyber-badge-purple" style={{ fontSize: '0.75rem' }}>{studyGroups.length} Formed</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Join live revision pods or launch your own study room with peers.
          </p>
        </div>
        <Button size="sm" variant="purple" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={15} /> Create a Study Circle
        </Button>
      </div>

      {/* Active Session Notification Toast */}
      {activeSession && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(34, 211, 238, 0.25))',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Video size={24} color="var(--accent-cyan)" />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
                Joined Live Session: {activeSession.name}
              </strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Connecting to WebRTC Audio/Video Mesh network... (3 active peers connected)
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveSession(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['All', 'Computer Science', 'Mathematics', 'AI & Data Science'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === cat ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
              background: selectedCategory === cat ? 'rgba(147, 51, 234, 0.2)' : 'var(--glass-bg)',
              color: selectedCategory === cat ? 'var(--accent-purple)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredGroups.length === 0 ? (
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
          <Users size={42} color="var(--accent-purple)" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', margin: '0 0 8px', fontWeight: 800 }}>
            No Active Study Circles in this Category
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Form focused revision pods, peer code labs, or exam prep groups with fellow students to study together in live audio/video rooms.
          </p>
          <Button size="sm" variant="purple" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={15} /> Create a Study Circle
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredGroups.map((g) => {
            const isJoined = joinedGroups.includes(g.id);
            return (
              <div
                key={g.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(13, 19, 38, 0.8), rgba(24, 34, 68, 0.6))',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 'var(--radius-xl)',
                  border: isJoined ? '1px solid var(--accent-cyan)' : '1px solid rgba(147, 51, 234, 0.25)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '2.2rem' }}>{g.avatar}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="cyber-badge-purple" style={{ fontSize: '0.75rem' }}>
                        <Users size={12} /> {g.membersCount || 1} Members
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <span className="cyber-badge-cyan" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '6px', display: 'inline-block' }}>
                      {g.category || 'Study Pod'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                      {g.name}
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {g.description}
                  </p>

                  {g.nextSession && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NEXT LIVE SESSION</span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Calendar size={14} /> {g.nextSession}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant={isJoined ? 'outline' : 'primary'}
                    onClick={() => toggleJoin(g.id)}
                    style={{ flex: 1 }}
                  >
                    {isJoined ? 'Joined ✓' : 'Join Group'} <ArrowRight size={16} />
                  </Button>
                  {isJoined && (
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={() => setActiveSession(g)}
                      title="Enter Live Room"
                    >
                      <Video size={14} /> Join Call
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Creating a Study Circle */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a Study Circle">
        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Circle / Pod Name:
            </label>
            <input
              type="text"
              placeholder="e.g. React & Next.js System Architecture Pod"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Subject / Category:
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
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics & Engineering">Physics & Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Exam Prep & GATE">Exam Prep & GATE</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Avatar Icon:
              </label>
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="💻">💻 Code Lab</option>
                <option value="🚀">🚀 Launchpad</option>
                <option value="🧠">🧠 Neural Revision</option>
                <option value="📚">📚 Exam Sprint</option>
                <option value="⚡">⚡ Quick Review</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Description & Goals:
            </label>
            <textarea
              rows={3}
              placeholder="What will your study circle focus on? e.g. Daily coding challenges, mock interviews, or revising database concepts."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Next Scheduled Session:
            </label>
            <input
              type="text"
              placeholder="e.g. Today @ 8:00 PM or Mon/Wed/Fri 7 PM"
              value={nextSession}
              onChange={(e) => setNextSession(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <Button type="submit" size="lg" variant="purple" style={{ marginTop: '8px' }}>
            <PlusCircle size={16} /> Launch Study Circle (+25 XP)
          </Button>
        </form>
      </Modal>
    </div>
  );
};



