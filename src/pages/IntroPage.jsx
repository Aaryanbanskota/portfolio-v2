import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroPage.css';

export default function IntroPage() {
  const typingRef = useRef(null);
  const inputRef = useRef(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const text = "This is demo version for os series.\n\nType 'os' to access os-A";
    const container = typingRef.current;
    if (!container) return;
    container.innerHTML = '';

    let cancelled = false;

    const animateText = async () => {
      const lines = text.split('\n');

      for (const line of lines) {
        if (cancelled) return;
        const lineDiv = document.createElement('div');
        lineDiv.style.marginBottom = '20px';
        container.appendChild(lineDiv);

        const words = line.split(' ');
        for (let w = 0; w < words.length; w++) {
          if (cancelled) return;
          if (w > 0) {
            const spaceSpan = document.createElement('span');
            spaceSpan.innerHTML = '&nbsp;';
            lineDiv.appendChild(spaceSpan);
          }
          for (let i = 0; i < words[w].length; i++) {
            if (cancelled) return;
            const char = words[w][i];
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char-span';
            lineDiv.appendChild(span);
            await new Promise(r => setTimeout(r, Math.random() * 80 + 40));
          }
        }
      }

      if (cancelled) return;
      // Blinking cursor
      const lastLine = container.lastChild;
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      lastLine?.appendChild(cursor);

      // Fade out after 3s
      setTimeout(() => {
        if (cancelled) return;
        container.style.transition = 'opacity 1s ease-out';
        container.style.opacity = '0';

        setTimeout(() => {
          if (cancelled) return;
          setInputVisible(true);
          setTimeout(() => {
            if (cancelled) return;
            setHintVisible(true);
            inputRef.current?.focus();
          }, 500);
        }, 1000);
      }, 3000);
    };

    animateText();
    return () => { cancelled = true; };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      if (cmd === 'os') {
        navigate('/dashboard');
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setInputValue('');
      }
    }
  };

  return (
    <div className="intro-body">
      <div className="intro-container">
        <div className="typing-text" ref={typingRef} />

        <div className={`command-input ${inputVisible ? 'visible' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type command here..."
            autoComplete="off"
            spellCheck="false"
            value={inputValue}
            className={shake ? 'shake' : ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={`hint ${hintVisible ? 'visible' : ''}`}>
          Hint: Type <span className="glow-effect">os</span> to access{' '}
          <span className="glow-effect">os-A</span>
        </div>
      </div>
    </div>
  );
}
