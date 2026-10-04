import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, FileText, Sparkles, Clock, Zap, ChevronRight, Video, Bot } from 'lucide-react';
import { Button } from '../common/Button';
import { getTopicsForSubject } from '../../services/curriculumTopicService';
import { subjectService } from '../../services/subjectService';
import { useAuth } from '../../context/AuthContext';

export const SubjectLessonsView = ({ subject = {}, topics = [], onAskSage = () => {}, onSelectMaterial }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.email || 'student';
  const storageKey = `edunova_lesson_progress_${userId}_${subject?.id || 'gen'}`;

  const safeTopics = Array.isArray(topics) && topics.length > 0 
    ? topics 
    : getTopicsForSubject(subject);

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const initial = {};
    if (typeof subject?.progress === 'number' && subject.progress > 0) {
      const compCount = Math.min(safeTopics.length, Math.floor((subject.progress / 100) * safeTopics.length));
      safeTopics.forEach((t, idx) => {
        if (idx < compCount) initial[t?.id || `top_${idx}`] = true;
      });
    }
    return initial;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
        return;
      }
    } catch (e) {}

    const initial = {};
    if (typeof subject?.progress === 'number' && subject.progress > 0) {
      const compCount = Math.min(safeTopics.length, Math.floor((subject.progress / 100) * safeTopics.length));
      safeTopics.forEach((t, idx) => {
        if (idx < compCount) initial[t?.id || `top_${idx}`] = true;
      });
    }
    setCompletedLessons(initial);
  }, [topics, subject?.id, safeTopics.length, storageKey]);

  const toggleLesson = (id) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}

      const compCount = Object.values(updated).filter(Boolean).length;
      const newProgress = Math.round((compCount / (safeTopics.length || 1)) * 100);

      subjectService.updateSubjectConfig(subject.id, {
        progress: newProgress,
        hasStudied: compCount > 0,
        completedChaptersCount: compCount
      });

      window.dispatchEvent(new CustomEvent('edunova_subject_updated', {
        detail: { subjectId: subject.id, progress: newProgress }
      }));

      return updated;
    });
  };

  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (safeTopics.length || 1)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Lesson Progress Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
        border: '1px solid var(--accent-cyan)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <BookOpen size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {subject.name} Interactive Lessons & Lectures
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Master core chapter lessons through structured video modules, concept breakdowns, and Sage AI tutoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Course Completion</span>
            <strong style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 900 }}>{progressPercent}%</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
              {completedCount} / {safeTopics.length} Lessons Finished
            </span>
          </div>
          <Button onClick={() => onAskSage(`Create a 7-day lesson study plan for ${subject.name}`)}>
            <Sparkles size={16} /> 7-Day Study Plan
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {safeTopics.map((topic, index) => {
          const isDone = !!completedLessons[topic.id];

          return (
            <div
              key={topic.id}
              style={{
                background: isDone ? 'rgba(15, 23, 42, 0.6)' : 'var(--glass-bg)',
                border: topic.isCurrent ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px 24px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <button
                    onClick={() => toggleLesson(topic.id)}
                    style={{
                      background: isDone ? '#10b981' : 'var(--bg-tertiary)',
                      border: isDone ? 'none' : '1px solid var(--border-color)',
                      color: isDone ? '#fff' : 'var(--text-muted)',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      marginTop: '2px'
                    }}
                    title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    {isDone ? '✓' : index + 1}
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span className="cyber-badge-cyan" style={{ fontSize: '0.72rem' }}>Lesson {index + 1}</span>
                      {topic.isCurrent && <span className="cyber-badge-amber" style={{ fontSize: '0.72rem' }}>Current Focus</span>}
                      {topic.isWeak && <span className="cyber-badge-rose" style={{ fontSize: '0.72rem' }}>Weak Concept</span>}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {(index + 1) * 15 + 10} mins
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 6px' }}>
                      {topic.name}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '650px' }}>
                      {topic.desc}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isDone ? 'outline' : 'primary'}
                  onClick={() => toggleLesson(topic.id)}
                >
                  {isDone ? '✓ Completed' : 'Mark Complete'}
                </Button>
              </div>

              {/* Lesson Materials & Quick Actions Bar */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Video size={14} color="#38bdf8" /> Video Lecture Available
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} color="#34d399" /> Study Notes & Formulas
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} color="#fbbf24" /> +50 XP
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (onSelectMaterial) {
                        onSelectMaterial({
                          id: `mat_lesson_vid_${topic.id || index}`,
                          subjectId: subject?.id,
                          title: `Video Lecture: ${topic.name}`,
                          description: topic.desc || `Core lecture for lesson ${index + 1}: ${topic.name}`,
                          type: 'Videos',
                          fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                          fileName: `${topic.name}_Lecture.mp4`,
                          fileSize: 18500000,
                          createdAt: '2026-09-30',
                          uploadedBy: 'EduNova Academic Faculty'
                        });
                      } else {
                        onAskSage(`Give me a complete video script and breakdown for lesson "${topic.name}" in ${subject.name}`);
                      }
                    }}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <PlayCircle size={14} color="#38bdf8" /> Watch Video
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectMaterial) {
                        onSelectMaterial({
                          id: `mat_lesson_pdf_${topic.id || index}`,
                          subjectId: subject?.id,
                          title: `Study Notes PDF: ${topic.name}`,
                          description: topic.desc || `Detailed revision notes for lesson ${index + 1}: ${topic.name}`,
                          type: 'Notes',
                          fileUrl: `/uploads/${(topic.name || 'Lesson').replace(/\s+/g, '_')}_Notes.pdf`,
                          fileName: `${topic.name}_Notes.pdf`,
                          fileSize: 3200000,
                          createdAt: '2026-09-30',
                          uploadedBy: 'EduNova Senior Educator',
                          content: `# Lesson ${index + 1}: ${topic.name}\n\n${topic.desc || 'Comprehensive notes breakdown.'}\n\nKey Concepts:\n1. Core definition and foundational theorems.\n2. Detailed step-by-step mechanisms and principles.\n3. High-yield summary points for board exams.`
                        });
                      } else {
                        onAskSage(`Explain lesson "${topic.name}" step-by-step with real-world examples`);
                      }
                    }}
                    style={{
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      color: '#34d399',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} color="#34d399" /> Review PDF Notes
                  </button>

                  <button
                    onClick={() => onAskSage(`Explain lesson "${topic.name}" step-by-step with real-world examples`)}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: '#38bdf8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Bot size={14} /> Explain with Sage AI
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
