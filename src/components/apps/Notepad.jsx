import { useState, useEffect, useRef } from 'react';
import { saveFile } from './Files';
import './Notepad.css';

export default function Notepad({ params }) {
  const [content, setContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const [zoom, setZoom] = useState(100);
  const [wordWrap, setWordWrap] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (params?.content) {
      setContent(params.content);
    }
  }, [params]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.notepad-menu-wrapper')) {
        setMenuOpen(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const updateCursor = (e) => {
    const val = e.target.value;
    const start = e.target.selectionStart;
    const textBefore = val.substring(0, start);
    const lines = textBefore.split('\n');
    setCursorPos({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const handleMenuClick = (action) => {
    setMenuOpen(null);
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    switch (action) {
      case 'New':
        setContent('');
        break;
      case 'Open': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'text/plain';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setContent(ev.target.result);
            reader.readAsText(file);
          }
        };
        input.click();
        break;
      }
      case 'Save': {
        const path = window.prompt("Enter file path to save:", "/home/user/Documents/note.txt");
        if (path) {
          saveFile(path, content);
        }
        break;
      }
      case 'Cut':
        navigator.clipboard.writeText(content.substring(textarea.selectionStart, textarea.selectionEnd));
        setContent(content.substring(0, textarea.selectionStart) + content.substring(textarea.selectionEnd));
        break;
      case 'Copy':
        navigator.clipboard.writeText(content.substring(textarea.selectionStart, textarea.selectionEnd));
        break;
      case 'Paste':
        navigator.clipboard.readText().then(text => {
          setContent(content.substring(0, textarea.selectionStart) + text + content.substring(textarea.selectionEnd));
        });
        break;
      case 'Select All':
        textarea.select();
        break;
      case 'Word Wrap':
        setWordWrap(!wordWrap);
        break;
      case 'Zoom In':
        setZoom(z => Math.min(z + 10, 500));
        break;
      case 'Zoom Out':
        setZoom(z => Math.max(z - 10, 10));
        break;
      case 'Reset Zoom':
        setZoom(100);
        break;
      default:
        break;
    }
  };

  const menus = {
    File: ['New', 'Open', 'Save'],
    Edit: ['Cut', 'Copy', 'Paste', 'Select All'],
    Format: ['Word Wrap'],
    View: ['Zoom In', 'Zoom Out', 'Reset Zoom']
  };

  return (
    <div className="notepad">
      <div className="notepad-toolbar">
        {Object.entries(menus).map(([title, items]) => (
          <div key={title} className="notepad-menu-wrapper">
            <span 
              className={`notepad-menu-btn ${menuOpen === title ? 'active' : ''}`}
              onClick={() => setMenuOpen(menuOpen === title ? null : title)}
            >
              {title}
            </span>
            {menuOpen === title && (
              <div className="notepad-dropdown">
                {items.map(item => (
                  <div key={item} className="notepad-dropdown-item" onClick={() => handleMenuClick(item)}>
                    {item === 'Word Wrap' && wordWrap ? '✓ ' : ''}{item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <span className="notepad-menu-btn" onClick={() => alert('Notepad in Lion OS v1.0')}>Help</span>
      </div>
      <textarea
        ref={textareaRef}
        className="notepad-textarea"
        style={{
          fontSize: `${0.95 * (zoom / 100)}rem`,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto'
        }}
        value={content}
        onChange={(e) => { setContent(e.target.value); updateCursor(e); }}
        onKeyUp={updateCursor}
        onMouseUp={updateCursor}
        placeholder="Start typing..."
        spellCheck="false"
      />
      <div className="notepad-status">
        Ln {cursorPos.ln}, Col {cursorPos.col} | {zoom}% | Windows (CRLF) | UTF-8
      </div>
    </div>
  );
}
