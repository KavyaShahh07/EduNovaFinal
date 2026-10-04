import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Plus, ArrowRight, Sparkles, BookOpen, Atom, Code2, Cpu, GraduationCap, Layers } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

// Accurate Category Classification Helper
const getCategoryDetails = (subject) => {
  const cat = (subject.category || '').toLowerCase();
  const name = (subject.name || '').toLowerCase();
  const desc = (subject.description || '').toLowerCase();

  // 1. COMPUTER SCIENCE, PROGRAMMING, IT & AI (Must evaluate FIRST before general Science!)
  if (
    cat.includes('computer') || cat.includes('code') || cat.includes('dev') || cat.includes('ai') || cat.includes('programming') || cat.includes('software') || cat.includes('data structure') || cat.includes('algorithm') || cat.includes('database') || cat.includes('frontend') || cat.includes('backend') || cat.includes('tech') ||
    name.includes('computer') || name.includes('data structure') || name.includes('dsa') || name.includes('dbms') || name.includes('database') || name.includes('python') || name.includes('web') || name.includes('react') || name.includes('c ') || name.includes('c++') || name.includes('java') || name.includes('ai &') || name.includes('machine learning') || name.includes('operating system') || name.includes('network') || name.includes('software') || name.includes('full stack') || name.includes('devops') || name.includes('automata') || name.includes('coding') ||
    desc.includes('programming') || desc.includes('software') || desc.includes('database') || desc.includes('microservice')
  ) {
    return { name: '💻 Computer Science & AI', icon: Code2, color: '#8b5cf6' };
  }

  // 2. MATHEMATICS & QUANTITATIVE REASONING
  if (
    cat.includes('math') || cat.includes('quant') || cat.includes('calculus') || cat.includes('algebra') ||
    name.includes('math') || name.includes('calculus') || name.includes('algebra') || name.includes('trigonometry') || name.includes('quant') || name.includes('geometry') || name.includes('arithmetic')
  ) {
    return { name: '📐 Mathematics & Analytics', icon: Layers, color: '#38bdf8' };
  }

  // 3. PHYSICAL & LIFE SCIENCES (Physics, Chemistry, Biology, Life Sciences)
  if (
    cat.includes('physic') || cat.includes('chem') || cat.includes('bio') ||
    name.includes('physic') || name.includes('chem') || name.includes('bio') || name.includes('botany') || name.includes('zoology') || name.includes('anatomy') || name.includes('science (science)')
  ) {
    return { name: '🔬 Science & Biology', icon: Atom, color: '#10b981' };
  }

  // 4. ENGINEERING & SYSTEMS
  if (
    cat.includes('eng') || cat.includes('b.tech') || cat.includes('system') ||
    name.includes('engineering') || name.includes('b.tech') || name.includes('architecture') || name.includes('system')
  ) {
    return { name: '⚙️ Engineering & Systems', icon: Cpu, color: '#f59e0b' };
  }

  // 5. LANGUAGES & HUMANITIES
  if (
    cat.includes('english') || cat.includes('lang') || cat.includes('social') || cat.includes('verbal') || cat.includes('reasoning') || cat.includes('general') ||
    name.includes('english') || name.includes('history') || name.includes('geography') || name.includes('verbal') || name.includes('reasoning') || name.includes('aptitude') || name.includes('gk') || name.includes('upsc') || name.includes('social')
  ) {
    return { name: '📚 Languages & Humanities', icon: BookOpen, color: '#ec4899' };
  }

  return { name: subject.category || '✨ General & Multidisciplinary', icon: GraduationCap, color: '#6366f1' };
};

const getTrackBadge = (s) => {
  const ed = String(s.educationType || s.track || '').toLowerCase();
  if (ed === 'school') return { label: '🏫 SCHOOL', color: '#06b6d4' };
  if (ed === 'college') return { label: '🎓 COLLEGE', color: '#8b5cf6' };
  if (ed === 'exam') return { label: '📝 EXAM PREP', color: '#f59e0b' };
  if (ed === 'skills') return { label: '💻 SKILLS & TECH', color: '#10b981' };
  return { label: '🎯 GENERAL', color: '#6366f1' };
};

export const SubjectSelector = ({ availableSubjects = [], selectedSubjects = [], onToggleSubject, onDone }) => {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');

  const selectedIds = useMemo(() => new Set((selectedSubjects || []).map(s => s.id)), [selectedSubjects]);

  const filtered = useMemo(() => {
    return availableSubjects.filter(s => {
      const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                            (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
                            (s.category || '').toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedCategoryTab !== 'All') {
        const catInfo = getCategoryDetails(s);
        if (catInfo.name !== selectedCategoryTab) return false;
      }
      return true;
    });
  }, [availableSubjects, search, selectedCategoryTab]);

  // Group filtered subjects category-wise
  const groupedCategories = useMemo(() => {
    const groups = {};
    filtered.forEach(subject => {
      const catInfo = getCategoryDetails(subject);
      const catName = catInfo.name;
      if (!groups[catName]) {
        groups[catName] = {
          info: catInfo,
          subjects: []
        };
      }
      groups[catName].subjects.push(subject);
    });
    return groups;
  }, [filtered]);

  // Get all unique categories from availableSubjects for filter pills
  const allCategoryNames = useMemo(() => {
    const set = new Set();
    availableSubjects.forEach(s => set.add(getCategoryDetails(s).name));
    return Array.from(set);
  }, [availableSubjects]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Info Banner */}
      <div style={{
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.90) 100%)'
          : 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(99, 102, 241, 0.18))',
        borderRadius: '24px',
        border: isLight ? '1.5px solid rgba(195, 215, 245, 0.95)' : '1px solid rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: isLight ? '0 16px 40px rgba(64, 100, 160, 0.12), inset 0 1.5px 2px rgba(255, 255, 255, 1)' : '0 20px 50px rgba(0, 0, 0, 0.45)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color={isLight ? '#0284c7' : '#38bdf8'} /> SELECT YOUR SUBJECTS (ACCURATE CATEGORIES)
          </h2>
          <p style={{ fontSize: '0.9rem', color: isLight ? '#475569' : '#cbd5e1', margin: '6px 0 0', lineHeight: 1.5 }}>
            Browse and select subjects from all academic tracks (School, College, Exam Prep, Skills & Tech) accurately organized by domain.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '14px',
            background: isLight ? 'rgba(54, 199, 244, 0.14)' : 'rgba(6, 182, 212, 0.2)',
            border: isLight ? '1px solid rgba(54, 199, 244, 0.4)' : '1px solid rgba(6, 182, 212, 0.4)',
            color: isLight ? '#0284c7' : '#38bdf8',
            fontWeight: 800
          }}>
            ✓ {selectedSubjects.length} Selected / {availableSubjects.length} Total
          </span>
          {onDone && (
            <Button
              onClick={onDone}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
              }}
            >
              Done & View All Subjects <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Pills Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: isLight ? '#0284c7' : '#38bdf8' }} />
          <input
            type="text"
            placeholder="Search subjects by name, topic, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '48px',
              height: '46px',
              borderRadius: '16px',
              background: isLight ? '#ffffff' : 'rgba(12, 16, 36, 0.8)',
              border: isLight ? '1px solid rgba(195, 215, 245, 0.95)' : '1px solid rgba(255, 255, 255, 0.16)',
              color: isLight ? '#0f172a' : '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: isLight ? '0 4px 18px rgba(64, 100, 160, 0.08)' : 'none'
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
            🏷️ Category Filter:
          </span>
          <button
            onClick={() => setSelectedCategoryTab('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: selectedCategoryTab === 'All' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : (isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)'),
              color: selectedCategoryTab === 'All' ? '#ffffff' : (isLight ? '#1e293b' : '#cbd5e1'),
              border: selectedCategoryTab === 'All' ? '1px solid #38bdf8' : (isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)'),
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All Categories ({availableSubjects.length})
          </button>
          {allCategoryNames.map((catName) => {
            const count = availableSubjects.filter(s => getCategoryDetails(s).name === catName).length;
            const isSelected = selectedCategoryTab === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategoryTab(catName)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  background: isSelected ? 'linear-gradient(135deg, #0284c7, #2563eb)' : (isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)'),
                  color: isSelected ? '#ffffff' : (isLight ? '#1e293b' : '#cbd5e1'),
                  border: isSelected ? '1px solid #38bdf8' : (isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-Wise Subject Sections */}
      {Object.keys(groupedCategories).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)',
          borderRadius: '20px',
          color: isLight ? '#64748b' : '#cbd5e1',
          border: isLight ? '1px dashed rgba(210, 225, 250, 0.9)' : '1px dashed rgba(255, 255, 255, 0.15)'
        }}>
          No subjects match your category or search criteria.
        </div>
      ) : (
        Object.entries(groupedCategories).map(([catName, { info, subjects }]) => {
          const IconComp = info.icon || BookOpen;
          return (
            <div
              key={catName}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.6)',
                borderRadius: '24px',
                padding: '22px',
                borderLeft: `4px solid ${info.color}`,
                border: isLight ? '1.5px solid rgba(220, 235, 255, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: isLight ? '0 10px 30px rgba(100, 130, 200, 0.08)' : '0 10px 30px rgba(0, 0, 0, 0.35)'
              }}
            >
              {/* Category Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid rgba(210, 225, 250, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${info.color}22`, border: `1.5px solid ${info.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={20} color={info.color} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                    {catName}
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: info.color, background: `${info.color}18`, padding: '4px 14px', borderRadius: '999px', border: `1px solid ${info.color}40` }}>
                  {subjects.length} {subjects.length === 1 ? 'Subject Available' : 'Subjects Available'}
                </span>
              </div>

              {/* Cards Grid for this category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px' }}>
                {subjects.map((subject) => {
                  const isSelected = selectedIds.has(subject.id);
                  const targetScoreVal = subject.targetScore || subject.defaultTargetScore || 85;
                  const weeklyGoalVal = subject.weeklyGoal || subject.defaultWeeklyGoal || 4;
                  const trackBadge = getTrackBadge(subject);

                  return (
                    <div
                      key={subject.id}
                      onClick={() => onToggleSubject(subject.id)}
                      style={{
                        background: isSelected
                          ? (isLight ? 'linear-gradient(135deg, rgba(235, 248, 255, 0.98), rgba(240, 245, 255, 0.98))' : 'rgba(6, 182, 212, 0.18)')
                          : (isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(12, 16, 36, 0.75)'),
                        backdropFilter: 'blur(16px)',
                        borderRadius: '20px',
                        border: isSelected
                          ? (isLight ? '2px solid #0284c7' : '2px solid #06b6d4')
                          : (isLight ? '1px solid rgba(210, 225, 250, 0.95)' : '1px solid rgba(255, 255, 255, 0.12)'),
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        boxShadow: isSelected
                          ? (isLight ? '0 8px 25px rgba(2, 132, 199, 0.18)' : '0 6px 24px rgba(6, 182, 212, 0.25)')
                          : (isLight ? '0 4px 18px rgba(64, 100, 160, 0.06)' : 'none')
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>{subject.icon || '📚'}</span>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: isSelected ? (isLight ? '#0284c7' : '#38bdf8') : (isLight ? '#0f172a' : '#ffffff'), margin: 0 }}>
                              {subject.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: `${trackBadge.color}18`, color: trackBadge.color, border: `1px solid ${trackBadge.color}35` }}>
                                {trackBadge.label}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
                                {subject.grade || subject.degree || subject.level || subject.examName || subject.category || 'Subject'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected
                            ? 'linear-gradient(135deg, #0284c7, #4f46e5)'
                            : (isLight ? 'rgba(235, 243, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)'),
                          border: isSelected ? 'none' : (isLight ? '1px solid rgba(195, 215, 245, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          boxShadow: isSelected ? '0 3px 10px rgba(2, 132, 199, 0.3)' : 'none',
                          flexShrink: 0
                        }}>
                          {isSelected ? <CheckCircle2 size={18} color="#ffffff" /> : <Plus size={16} color={isLight ? '#0284c7' : '#94a3b8'} />}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: isLight ? '#475569' : '#cbd5e1', lineHeight: 1.5, margin: '8px 0 14px', height: '2.8em', overflow: 'hidden' }}>
                        {subject.description || subject.shortDescription || 'Core curriculum track subject for exam and skill preparation.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', paddingTop: '10px', borderTop: isLight ? '1px solid rgba(210, 225, 250, 0.8)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span>Target: <strong style={{ color: isLight ? '#0284c7' : '#38bdf8' }}>{targetScoreVal}%</strong></span>
                        <span>Goal: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{weeklyGoalVal}h/wk</strong></span>
                        <span style={{
                          fontWeight: 800,
                          color: isSelected ? '#10b981' : (isLight ? '#0284c7' : '#38bdf8'),
                          background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          padding: isSelected ? '2px 8px' : 0,
                          borderRadius: '6px'
                        }}>
                          {isSelected ? '✓ Selected' : '+ Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SubjectSelector;

