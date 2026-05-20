import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const pulseKeyframes = `
@keyframes sos-pulse {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(220,38,38,0.35); }
  50%  { transform: scale(1.07); box-shadow: 0 0 0 10px rgba(220,38,38,0); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(220,38,38,0); }
}
`;

export default function SOSButton({ variant = 'floating' }) {
  const navigate = useNavigate();

  if (variant === 'home') {
    return (
      <button
        onClick={() => navigate('/emergency')}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '10px',
          padding:        '14px',
          border:         '1.5px solid #dc2626',
          borderRadius:   '12px',
          background:     '#ffffff',
          color:          '#dc2626',
          fontSize:       '15px',
          fontWeight:     600,
          fontFamily:     "'Manrope', sans-serif",
          cursor:         'pointer',
          letterSpacing:  '.01em',
          transition:     'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <AlertTriangle size={18} strokeWidth={2} />
        Emergency Alert
      </button>
    );
  }

  return (
    <>
      <style>{pulseKeyframes}</style>
      <button
        onClick={() => navigate('/emergency')}
        aria-label="Emergency Alert"
        style={{
          position:       'fixed',
          bottom:         '24px',
          right:          '24px',
          width:          '52px',
          height:         '52px',
          borderRadius:   '50%',
          background:     '#dc2626',
          border:         'none',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          cursor:         'pointer',
          zIndex:         1000,
          animation:      'sos-pulse 2s ease-in-out infinite',
        }}
      >
        <AlertTriangle size={22} color="#ffffff" strokeWidth={2} />
      </button>
    </>
  );
}
