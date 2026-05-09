import { useState } from 'react';
import './BraveBrowser.css';

const BOOKMARKS = [
  { name: 'YouTube',   url: 'https://www.youtube.com',       icon: '▶' },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org',    icon: '📖' },
  { name: 'GitHub',    url: 'https://github.com',            icon: '🐙' },
  { name: 'Google',    url: 'https://www.google.com/search?igu=1', icon: '🔍' },
];

export default function BraveBrowser() {
  const [inputVal, setInputVal] = useState('');
  const [frameUrl, setFrameUrl] = useState('');
  const [error, setError] = useState(false);

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.startsWith('http')) return url;
    if (url.includes('.')) return 'https://' + url;
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
  };

  const handleGo = () => {
    const url = formatUrl(inputVal);
    setFrameUrl(url);
    setError(false);
  };

  return (
    <div className="brave">
      <div className="brave-toolbar">
        <div className="brave-addressbar">
          <input
            className="brave-url-input"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
            placeholder="Search or enter URL (e.g. google.com)"
          />
          <button className="brave-go" onClick={handleGo}>Go</button>
        </div>
        <button className="brave-external" onClick={() => window.open(frameUrl || 'https://google.com', '_blank')}>
          ↗ Open Externally
        </button>
      </div>

      <div className="brave-bookmarks">
        {BOOKMARKS.map(b => (
          <button key={b.name} className="brave-bm" onClick={() => { setFrameUrl(formatUrl(b.url)); setInputVal(b.url); }}>
            <span>{b.icon}</span> {b.name}
          </button>
        ))}
      </div>

      <div className="brave-content">
        {!frameUrl ? (
          <div className="brave-newtab">
            <div className="nt-logo">Lion OS</div>
            <p>Private & Secure browsing</p>
            <input 
              className="nt-search" 
              placeholder="Search Google..." 
              onKeyDown={e => e.key === 'Enter' && (setFrameUrl(formatUrl(e.target.value)), setInputVal(e.target.value))}
            />
          </div>
        ) : (
          <div className="iframe-wrapper">
            <iframe
              src={frameUrl}
              className="brave-iframe"
              title="browser"
              onError={() => setError(true)}
            />
            {frameUrl.includes('google.com') && (
              <div className="iframe-hint">Note: Some sites like Google/YouTube block iframes. Use "Open Externally" if the page is blank.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
