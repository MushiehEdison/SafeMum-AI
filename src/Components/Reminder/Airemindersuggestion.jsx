import { Sparkles } from "lucide-react";

export default function AIReminderSuggestion({ suggestion, onAccept, onDismiss }) {
  return (
    <div style={{
      background:   '#ffffff',
      border:       '1px solid #e5e7eb',
      borderRadius: '12px',
      padding:      '16px',
      boxShadow:    '0 1px 3px rgba(0,0,0,0.06)',
      fontFamily:   "'Manrope', sans-serif",
      marginBottom: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Sparkles size={15} color="#16a34a" strokeWidth={1.8} />
        <span style={{
          fontSize:     '10px',
          fontWeight:   600,
          letterSpacing:'.1em',
          textTransform:'uppercase',
          color:        '#16a34a',
        }}>
          AI Suggestion
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#111', lineHeight: 1.6, marginBottom: '14px' }}>
        {suggestion.message}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onAccept(suggestion.reminderData)}
          style={{
            padding:      '7px 16px',
            borderRadius: '8px',
            border:       '1px solid #16a34a',
            background:   'transparent',
            color:        '#16a34a',
            fontSize:     '12px',
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   "'Manrope', sans-serif",
          }}
        >
          Add this reminder
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding:    '7px 12px',
            borderRadius:'8px',
            border:     'none',
            background: 'transparent',
            color:      '#6b7280',
            fontSize:   '12px',
            fontWeight: 500,
            cursor:     'pointer',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}