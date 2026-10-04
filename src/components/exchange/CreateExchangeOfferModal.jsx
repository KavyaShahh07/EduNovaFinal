import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const CreateExchangeOfferModal = ({ isOpen, onClose, onPublish, learner }) => {
  const [step, setStep] = useState(1);
  const learnerType = learner?.learnerType || 'school';
  const role = learner?.role || 'STUDENT';

  const defaultTeach = role === 'INSTRUCTOR' ? 'Computer Science Mentorship' : (learnerType === 'school' ? 'Class 10 Mathematics' : 'React & Web Development');
  const defaultLearn = role === 'INSTRUCTOR' ? 'Curriculum Design' : (learnerType === 'school' ? 'Physics & Science Experiments' : 'UI/UX Design & Figma');

  const [teachSkill, setTeachSkill] = useState(defaultTeach);
  const [learnSkill, setLearnSkill] = useState(defaultLearn);
  const [experience, setExperience] = useState(role === 'INSTRUCTOR' ? 'Expert' : 'Advanced');
  const [goal, setGoal] = useState(learnerType === 'school' ? 'Exam preparation' : 'Career Skill');
  const [format, setFormat] = useState('1-to-1');
  const [availability, setAvailability] = useState('Weekends');
  const [description, setDescription] = useState(`Looking for a dedicated peer exchange to swap knowledge in ${defaultTeach} for ${defaultLearn}.`);
  const [published, setPublished] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(7, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFinalPublish = (e) => {
    e.preventDefault();
    const newOffer = {
      teachSkill,
      learnSkill,
      experience,
      goal,
      format,
      availability,
      description
    };
    if (onPublish) onPublish(newOffer);
    setPublished(true);
  };

  const handleClose = () => {
    setPublished(false);
    setStep(1);
    if (onClose) onClose();
  };

  const stepsList = [
    '1. Teach', '2. Learn', '3. Exp', '4. Goal', '5. Format', '6. Avail', '7. Preview'
  ];

  const teachSuggestions = learnerType === 'school'
    ? ['Class 10 Mathematics', 'Physics & Chemistry', 'English Essay Writing', 'CBSE Social Studies', 'Biology Fundamentals']
    : ['React & Web Development', 'Python Programming', 'Data Structures & Algorithms', 'UI/UX Design', 'SQL & Databases'];

  const learnSuggestions = learnerType === 'school'
    ? ['Physics Numerical Practice', 'Class 10 Board Exam Prep', 'English Grammar', 'Computer Applications', 'History Timelines']
    : ['UI/UX Design & Figma', 'Node.js & Backend', 'Machine Learning', 'Cloud & DevOps', 'Cyber Security'];

  return (
    <div className="se-modal-overlay">
      <div className="se-modal-box">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              Step {step} of 7 • {role === 'INSTRUCTOR' ? 'Mentor Offer' : (learnerType === 'school' ? 'School Peer Exchange' : 'Higher Ed Exchange')}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Create Peer Skill Exchange</h3>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {stepsList.map((sName, idx) => (
            <div
              key={idx}
              style={{
                height: '6px',
                flex: 1,
                borderRadius: '9999px',
                background: step >= idx + 1 ? '#06b6d4' : 'rgba(255, 255, 255, 0.12)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {published ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <CheckCircle size={48} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Exchange Published!</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '360px', margin: '0 auto 24px auto' }}>
              Your exchange offer <strong style={{ color: '#38bdf8' }}>{teachSkill} ↔ {learnSkill}</strong> is live and visible to compatible learners.
            </p>
            <button onClick={handleClose} className="se-btn se-btn-primary" style={{ color: '#ffffff' }}>
              Done & Explore Matches
            </button>
          </div>
        ) : (
          <form onSubmit={handleFinalPublish} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* STEP 1: What can you teach? */}
            {step === 1 && (
              <div>
                <label className="se-form-label">
                  Step 1: What skill or subject can you teach/share?
                </label>
                <input
                  type="text"
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                  placeholder="e.g. React, Python, Class 10 Mathematics, Figma"
                  className="se-form-input"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {teachSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTeachSkill(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        border: teachSkill === s ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: teachSkill === s ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: teachSkill === s ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: What do you want to learn? */}
            {step === 2 && (
              <div>
                <label className="se-form-label">
                  Step 2: What skill do you want to learn in return?
                </label>
                <input
                  type="text"
                  value={learnSkill}
                  onChange={(e) => setLearnSkill(e.target.value)}
                  placeholder="e.g. UI/UX Design, Node.js, Physics, SQL"
                  className="se-form-input"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {learnSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setLearnSkill(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        border: learnSkill === s ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: learnSkill === s ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: learnSkill === s ? '#c084fc' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Experience Level */}
            {step === 3 && (
              <div>
                <label className="se-form-label">
                  Step 3: What is your teaching experience level for {teachSkill}?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: experience === lvl ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.14)',
                        background: experience === lvl ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: experience === lvl ? '#38bdf8' : '#ffffff',
                        fontWeight: experience === lvl ? 800 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Learning Goal */}
            {step === 4 && (
              <div>
                <label className="se-form-label">
                  Step 4: What is your primary learning goal?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {['Academic help', 'Career skill', 'Project help', 'Interview preparation', 'Portfolio', 'Exam preparation', 'Hobby'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        border: goal === g ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.14)',
                        background: goal === g ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: goal === g ? '#c084fc' : '#ffffff',
                        fontWeight: goal === g ? 800 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Preferred Format */}
            {step === 5 && (
              <div>
                <label className="se-form-label">
                  Step 5: Preferred Meeting Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {['1-to-1', 'Group', 'Mentoring', 'Project-based', 'Study partner', 'Casual knowledge exchange'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        border: format === fmt ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.14)',
                        background: format === fmt ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: format === fmt ? '#34d399' : '#ffffff',
                        fontWeight: format === fmt ? 800 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Availability */}
            {step === 6 && (
              <div>
                <label className="se-form-label">
                  Step 6: When are you available to meet?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Weekends', 'Weekdays', 'Flexible', 'Evenings', 'Mornings'].map((avail) => (
                    <button
                      key={avail}
                      type="button"
                      onClick={() => setAvailability(avail)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        border: availability === avail ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.14)',
                        background: availability === avail ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                        color: availability === avail ? '#050814' : '#ffffff',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {avail}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Preview & Description */}
            {step === 7 && (
              <div>
                <label className="se-form-label">
                  Step 7: Exchange Description & Preview
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="se-form-textarea"
                />

                <div style={{ padding: '14px', borderRadius: '16px', background: '#050814', border: '1px solid rgba(6, 182, 212, 0.3)', marginTop: '14px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                    <span>Preview: {teachSkill} ↔ {learnSkill}</span>
                    <span>{availability}</span>
                  </div>
                  <p style={{ color: '#cbd5e1', margin: 0 }}>Goal: {goal} | Format: {format}</p>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="se-btn se-btn-secondary"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
              ) : <div />}

              {step < 7 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="se-btn se-btn-primary"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="se-btn se-btn-primary"
                >
                  Publish Exchange
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
