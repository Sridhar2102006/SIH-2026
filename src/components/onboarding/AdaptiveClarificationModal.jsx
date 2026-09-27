import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

export const AdaptiveClarificationModal = ({ question, onAnswer, onSkip }) => {
  if (!question) return null;

  return (
    <div className="clarification-backdrop">
      <div className="clarification-card">
        <div className="clarification-header">
          <HelpCircle size={22} color="var(--color-primary-honey, #D97706)" />
          <h3 className="clarification-title">A quick clarification</h3>
        </div>
        <p className="clarification-prompt">{question.title}</p>
        {question.reason && (
          <span className="clarification-reason">{question.reason}</span>
        )}

        <div className="clarification-options-list">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              type="button"
              className="clarification-opt-btn"
              onClick={() => onAnswer(opt)}
            >
              <span>{opt}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-tertiary-link"
          onClick={onSkip}
          style={{ marginTop: '12px' }}
        >
          Skip clarification
        </button>
      </div>
    </div>
  );
};
