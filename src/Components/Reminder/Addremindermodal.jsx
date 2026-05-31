import { useState } from "react";
import { X } from "lucide-react";

const TYPES = [
  'Follow-up Appointment',
  'Medication',
  'Emotional Check-in',
  'Danger Signs Education',
];

export default function AddReminderModal({ onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState(TYPES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [noteText, setNoteText]         = useState('');

  function handleAdd() {
    if (!selectedDate || !selectedTime) return;
    const reminder = {
      type:        selectedType,
      datetime:    selectedDate + ' at ' + selectedTime,
      note:        noteText || null,
      missedCount: 0,
      completed:   false,
      overdue:     false,
    };
    onAdd(reminder);
    onClose();
  }

  const inputStyle = {
    width:        '100%',
    padding:      '10px 12px',
    borderRadius: '10px',
    border:       '1px solid #e5e7eb',
    background:   '#f8f7f4',
    fontSize:     '13px',
    color:        '#111',
    fontFamily:   "'Manrope', sans-serif",
    outline:      'none',
    boxSizing:    'border-box',
  };

  const labelStyle = {
    display:      'block',
    fontSize:     '11px',
    fontWeight:   600,
    letterSpacing:'.1em',
    textTransform:'uppercase',
    color:        '#6b7280',
    marginBottom: '6px',
  };

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(0,0,0,0.45)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         1000,
      padding:        '20px',
    }}>
      <div style={{
        background:   '#ffffff',
        borderRadius: '16px',
        padding:      '24px',
        width:        '100%',
        maxWidth:     '420px',
        fontFamily:   "'Manrope', sans-serif",
        position:     'relative',
      }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:   'absolute',
            top:        '16px',
            right:      '16px',
            border:     'none',
            background: '#f8f7f4',
            borderRadius:'8px',
            width:      '30px',
            height:     '30px',
            display:    'flex',
            alignItems: 'center',
            justifyContent:'center',
            cursor:     'pointer',
          }}
        >
          <X size={15} color="#6b7280" />
        </button>

        {/* Title */}
        <h2 style={{
          fontFamily:  "'Fraunces', serif",
          fontSize:    '20px',
          fontWeight:  600,
          color:       '#111',
          marginBottom:'20px',
        }}>
          New reminder
        </h2>

        {/* Type */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Type</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Date */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Time */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Time</label>
          <input
            type="time"
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Note</label>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note (optional)"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          style={{
            width:        '100%',
            padding:      '12px',
            borderRadius: '10px',
            border:       'none',
            background:   '#111',
            color:        '#fff',
            fontSize:     '14px',
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   "'Manrope', sans-serif",
          }}
        >
          Add reminder
        </button>
      </div>
    </div>
  );
}