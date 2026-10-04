import React, { useState } from 'react';
import { Search, Sparkles, UserCheck, BookOpen, GraduationCap, Users, Handshake } from 'lucide-react';
import { useDynamicGreeting } from '../../hooks/useDynamicGreeting';

export const PersonalizedHero = ({ learner, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  const learnerType = learner?.learnerType || 'school';
  const role = learner?.role || 'STUDENT';
  const userName = learner?.name || 'Learner';
  const userTitle = learner?.title || (role === 'INSTRUCTOR' ? 'Verified Mentor & Educator' : (role === 'PARENT' ? 'Parent Academic Coordinator' : (learnerType === 'school' ? 'Class 10 CBSE Student' : 'B.Tech CSE Student')));
  const dynamicGreeting = useDynamicGreeting(userName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  // Role and education level tailored quick action pills
  const schoolPills = [
    { id: 'math', label: 'Find Math Tutor', query: 'I need a tutor for Mathematics', icon: GraduationCap },
    { id: 'physics', label: 'Find Physics Study Partner', query: 'Find a study partner for Physics', icon: BookOpen },
    { id: 'science', label: 'Teach Board Science', query: 'I can teach Chemistry and Science', icon: Users },
    { id: 'english', label: 'English Grammar Buddy', query: 'I want to learn English Speaking & Grammar', icon: UserCheck },
    { id: 'prep', label: 'Class 10 Board Prep', query: 'Find Class 10 CBSE Board Exam preparation partner', icon: Handshake }
  ];

  const collegePills = [
    { id: 'tutor', label: 'Find a Tutor', query: 'I need a tutor for UI/UX', icon: GraduationCap },
    { id: 'study', label: 'Find a Study Partner', query: 'Find a study partner for DBMS', icon: BookOpen },
    { id: 'teach', label: 'Teach React', query: 'I can teach React', icon: Users },
    { id: 'mentor', label: 'Start Mentoring Session', query: 'I want a UI/UX mentor', icon: UserCheck },
    { id: 'project', label: 'Find Project Partner', query: 'Find a backend project partner for Node.js', icon: Handshake }
  ];

  const instructorPills = [
    { id: 'inst_mentor', label: 'Offer 1-on-1 Mentorship', query: 'I am offering 1-on-1 expert mentorship', icon: UserCheck },
    { id: 'inst_code', label: 'Guide Full-Stack Project', query: 'Guide React and Web Development project', icon: GraduationCap },
    { id: 'inst_math', label: 'Conduct Math Masterclass', query: 'Advanced Mathematics & Problem Solving mentor', icon: BookOpen },
    { id: 'inst_review', label: 'Review Student Portfolios', query: 'Portfolio and Resume review session', icon: Handshake }
  ];

  const parentPills = [
    { id: 'parent_math', label: 'Math Tutor for Child', query: 'Find Mathematics tutor for Class 10 student', icon: GraduationCap },
    { id: 'parent_sci', label: 'Science Coaching Partner', query: 'Find Physics and Science tutor for student', icon: BookOpen },
    { id: 'parent_eng', label: 'English Communication Buddy', query: 'Find English Grammar and Speaking tutor', icon: UserCheck },
    { id: 'parent_board', label: 'Board Exam Mentor', query: 'Find CBSE Class 10 Board Exam mentor', icon: Handshake }
  ];

  let quickPills = collegePills;
  if (role === 'INSTRUCTOR') quickPills = instructorPills;
  else if (role === 'PARENT') quickPills = parentPills;
  else if (learnerType === 'school') quickPills = schoolPills;

  const handlePillClick = (query) => {
    setSearchInput(query);
    if (onSearch) onSearch(query);
  };

  return (
    <div className="se-hero-card">
      <div className="se-badge">
        <Sparkles size={14} color="#38bdf8" />
        {learnerType === 'school' ? 'SCHOOL ACADEMIC PEER NETWORK' : 'AI-POWERED MATCH ENGINE'}
      </div>

      <h2 className="se-hero-greeting">
        {dynamicGreeting.title}
      </h2>
      <p className="se-hero-sub">
        <strong style={{ color: '#38bdf8' }}>{userTitle}</strong> • {learnerType === 'school' ? 'What school academic subject would you like to learn or teach today?' : 'What technical skill or course would you like to learn or teach today?'}
      </p>

      {/* Natural Language AI Search Bar */}
      <form onSubmit={handleSubmit} className="se-search-form">
        <div className="se-search-input-wrapper">
          <Search className="se-search-icon" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={learnerType === 'school'
              ? 'e.g. "I want to learn Class 10 Physics and can teach Mathematics"'
              : 'e.g. "I want to learn UI/UX and can teach React" or "Find a Python mentor"'
            }
            className="se-search-input"
          />
        </div>
        <button type="submit" className="se-btn se-btn-primary" style={{ padding: '14px 24px' }}>
          <Sparkles size={16} />
          Find Matches
        </button>
      </form>

      {/* Quick Action Pills */}
      <div className="se-pills-row">
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginRight: '4px' }}>
          Popular Actions:
        </span>
        {quickPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handlePillClick(pill.query)}
              className="se-pill-btn"
            >
              <Icon size={14} color="#38bdf8" />
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
