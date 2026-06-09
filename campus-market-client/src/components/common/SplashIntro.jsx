import { useState, useEffect, useRef } from 'react';

const FULL_TEXT = 'Campus Market';
const TYPING_SPEED_MS = 80;

export default function SplashIntro({ onComplete }) {
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCaret, setShowCaret] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // Step 1: Logo appears with spring animation after a brief pause
    const logoTimer = setTimeout(() => setLogoVisible(true), 100);

    // Step 2: Start typing text after logo finishes entering
    const textTimer = setTimeout(() => {
      setTextVisible(true);
      setShowCaret(true);
    }, 1100);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
    };
  }, []);

  // Typing animation once textVisible is true
  useEffect(() => {
    if (!textVisible) return;

    const type = () => {
      if (indexRef.current < FULL_TEXT.length) {
        setTypedText(FULL_TEXT.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      }
    };

    const interval = setInterval(type, TYPING_SPEED_MS);
    return () => clearInterval(interval);
  }, [textVisible]);

  // After text is fully typed, hide caret then fade out
  useEffect(() => {
    if (typedText.length < FULL_TEXT.length) return;

    // Text is complete — wait 600ms then fade out
    const caretTimer = setTimeout(() => setShowCaret(false), 400);
    const fadeTimer = setTimeout(() => setFadingOut(true), 700);
    const doneTimer = setTimeout(() => {
      onComplete();
    }, 1300);

    return () => {
      clearTimeout(caretTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [typedText, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 60%, #f0f0ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: fadingOut ? 'opacity 0.55s ease, transform 0.55s ease' : 'none',
      }}
    >
      {/* Ambient background blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '50vw', height: '50vw', maxWidth: 500, maxHeight: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '45vw', height: '45vw', maxWidth: 450, maxHeight: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main content row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: textVisible ? '16px' : '0px',
        transition: 'gap 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{
          fontSize: 'clamp(48px, 10vw, 88px)',
          lineHeight: 1,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1) rotate(0deg)' : 'scale(0.2) rotate(-160deg)',
          transition: 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex',
          alignItems: 'center',
        }}>
          🎓
        </div>

        {/* Text + caret */}
        {textVisible && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(26px, 6vw, 60px)',
              color: '#111827',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #111827 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {typedText}
            </span>
            {/* Blinking caret */}
            <span style={{
              display: 'inline-block',
              width: '3px',
              height: 'clamp(26px, 5vw, 52px)',
              background: '#4f46e5',
              marginLeft: '3px',
              borderRadius: '2px',
              opacity: showCaret ? 1 : 0,
              animation: showCaret ? 'caretBlink 0.7s step-end infinite' : 'none',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
