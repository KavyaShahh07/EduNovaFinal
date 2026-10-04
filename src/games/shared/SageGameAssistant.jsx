import React, { useState } from 'react';
import { Bot, Sparkles, ChevronDown, ChevronUp, Loader2, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { askSageAI, explainWrongAnswer } from '../../services/aiService';

export const SageGameAssistant = ({
  gameTitle,
  subject = 'Physics',
  currentQuestion = null,
  userMistake = null,
  hasAttempted = false,
  isOpen = false,
  onToggle
}) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [mode, setMode] = useState(null); // 'hint' | 'mistake' | 'concept'

  const handleAsk = async (type) => {
    setLoading(true);
    setMode(type);
    setResponse(null);

    try {
      if (type === 'hint') {
        const prompt = `You are EduNova Sage AI. The user is playing "${gameTitle}" (${subject}).
Current Challenge: "${currentQuestion?.question || currentQuestion?.title || currentQuestion?.prompt || 'Learning Challenge'}".
Provide a subtle, high-yield heuristic HINT that points the learner toward the correct line of thinking WITHOUT giving away the final answer. Keep it under 2 sentences.`;
        const res = await askSageAI(prompt);
        setResponse(res?.answer || res?.data?.answer || res?.text || 'Think about the core fundamental laws and relationships governing this concept.');
      } else if (type === 'mistake') {
        if (userMistake) {
          const res = await explainWrongAnswer(
            userMistake.question || 'Academic Challenge',
            userMistake.userAnswer || 'Selected Choice',
            userMistake.correctAnswer || 'Correct Solution'
          );
          setResponse(res?.explanation || res?.answer || 'Look closely at the formula definitions and operational signs.');
        } else {
          setResponse('Make an attempt first so Sage can analyze your specific thought process!');
        }
      } else if (type === 'concept') {
        const prompt = `Explain the key core concept behind "${currentQuestion?.question || currentQuestion?.title || subject}" in 3 clear bullet points for an intuitive understanding.`;
        const res = await askSageAI(prompt);
        setResponse(res?.answer || res?.data?.answer || res?.text || 'Review the primary definitions and dimensional units.');
      }
    } catch (e) {
      setResponse('Sage is analyzing... Remember: break complex problems into their foundational variables and verify each step.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 40
    }}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '12px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          color: '#d8b4fe',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s ease'
        }}
      >
        <Bot size={15} color="#c084fc" />
        <span>Ask Sage AI</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Drawer Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '10px',
          width: '340px',
          maxWidth: '90vw',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.5), 0 0 25px rgba(168, 85, 247, 0.15)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#c084fc" />
              </div>
              <strong style={{ fontSize: '0.88rem', color: '#f3e8ff' }}>Sage Game Companion</strong>
            </div>
            <button
              onClick={onToggle}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <button
              disabled={loading}
              onClick={() => handleAsk('hint')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: mode === 'hint' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: mode === 'hint' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'hint' ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              💡 Give Hint
            </button>

            <button
              disabled={loading || !hasAttempted}
              onClick={() => handleAsk('mistake')}
              title={!hasAttempted ? 'Make an attempt first!' : ''}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: mode === 'mistake' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: mode === 'mistake' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'mistake' ? '#ef4444' : hasAttempted ? '#cbd5e1' : '#64748b',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: hasAttempted ? 'pointer' : 'not-allowed',
                opacity: hasAttempted ? 1 : 0.6
              }}
            >
              🔍 Explain Mistake
            </button>

            <button
              disabled={loading}
              onClick={() => handleAsk('concept')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: mode === 'concept' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: mode === 'concept' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'concept' ? '#c084fc' : '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📖 Concept
            </button>
          </div>

          {/* Response Box */}
          <div style={{
            minHeight: '80px',
            maxHeight: '180px',
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', gap: '8px', color: '#c084fc' }}>
                <Loader2 size={18} className="animate-spin" />
                <span>Sage is reasoning...</span>
              </div>
            ) : response ? (
              <div>{response}</div>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '16px' }}>
                Select a prompt above for AI guidance without spoiling the solution.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SageGameAssistant;
