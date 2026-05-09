import { useRef } from 'react';
import './Window.css';

export default function Window({ win, isActive, onFocus, onClose, onMinimize, onMaximize, onMove, children }) {
  const dragging = useRef(false);
  const origin   = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  const startDrag = (e) => {
    if (e.target.closest('.win-controls')) return;
    if (win.maximized) return;
    onFocus();
    dragging.current = true;
    origin.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y };

    const move = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      onMove(origin.current.wx + dx, Math.max(0, origin.current.wy + dy));
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100vh - 52px)', zIndex: isActive ? 500 : 490, display: win.minimized ? 'none' : undefined }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: isActive ? 500 : 490, display: win.minimized ? 'none' : undefined };

  return (
    <div
      className={`win ${isActive ? 'win-active' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div className="win-titlebar" onMouseDown={startDrag}>
        <div className="win-controls">
          <button className="wbtn close"    onClick={onClose}    title="Close"    />
          <button className="wbtn minimize" onClick={onMinimize} title="Minimize" />
          <button className="wbtn maximize" onClick={onMaximize} title="Maximize" />
        </div>
        <span className="win-title">{win.emoji} {win.title}</span>
        <div style={{ width: 72 }} />
      </div>

      {/* Content */}
      <div className="win-body">
        {children}
      </div>
    </div>
  );
}
