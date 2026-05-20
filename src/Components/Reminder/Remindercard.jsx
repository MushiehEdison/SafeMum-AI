import { CheckCircle2, Clock, X } from "lucide-react";

const TYPE_COLORS = {
  'Follow-up Appointment': '#dc2626',
  'Medication':            '#16a34a',
  'Emotional Check-in':    '#2563eb',
  'Danger Signs Education':'#ea580c',
};

export default function ReminderCard({ reminder, onComplete, onDismiss, onSnooze, compact }) {
  const color      = TYPE_COLORS[reminder.type] || '#6b7280';
  const isMissed   = reminder.missedCount >= 2;
  const cardBg     = isMissed ? '#fef2f2' : '#ffffff';

  return (
    <div style={{
      background:    cardBg,
      border:        `1px solid #e5e7eb`,
      borderRadius:  '12px',
      padding:       '16px',
      boxShadow:     '0 1px 3px rgba(0,0,0,0.06)',
      fontFamily:    "'Manrope', sans-serif",
      position:      'relative',
    }}>

      {/* Type pill */}
      <span style={{
        display:      'inline-block',
        fontSize:     '10px',
        fontWeight:   600,
        letterSpacing:'.08em',
        textTransform:'uppercase',
        color,
        border:       `1px solid ${color}`,
        borderRadius: '20px',
        padding:      '2px 9px',
        marginBottom: '10px',
      }}>
        {reminder.type}
      </span>

      {/* AI message */}
      <p style={{ fontSize: '13px', color: '#111', lineHeight: 1.6, marginBottom: '8px' }}>
        {reminder.aiMessage}
      </p>

      {/* Missed twice warning */}
      {isMissed && (
        <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '8px', fontWeight: 500 }}>
          You have missed this reminder. A community health worker has been notified.
        </p>
      )}

      {/* Note */}
      {reminder.note && (
        <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>
          {reminder.note}
        </p>
      )}

      {/* Date row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: compact ? 0 : '12px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{reminder.datetime}</span>
        {reminder.overdue && (
          <span style={{
            fontSize:     '10px',
            fontWeight:   600,
            color:        '#dc2626',
            border:       '1px solid #dc2626',
            borderRadius: '20px',
            padding:      '1px 8px',
          }}>
            Overdue
          </span>
        )}
      </div>

      {/* Action buttons */}
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <ActionBtn icon={<CheckCircle2 size={14} />} label="Mark done" color="#16a34a"  onClick={onComplete}  />
          <ActionBtn icon={<Clock        size={14} />} label="Snooze"    color="#6b7280"  onClick={onSnooze}   />
          <ActionBtn icon={<X            size={14} />} label="Dismiss"   color="#dc2626"  onClick={onDismiss}  />
        </div>
      )}

      {compact && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <ActionBtn icon={<CheckCircle2 size={14} />} label="Mark done" color="#16a34a" onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '5px',
        padding:        '5px 10px',
        borderRadius:   '8px',
        border:         `1px solid ${color}22`,
        background:     `${color}10`,
        color,
        fontSize:       '11px',
        fontWeight:     500,
        cursor:         'pointer',
        fontFamily:     "'Manrope', sans-serif",
        transition:     'background .15s',
      }}
    >
      {icon} {label}
    </button>
  );
}