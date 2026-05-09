import { useState } from 'react';
import { saveFile } from './Files';
import './AppCenter.css';
import appData from './appData.json';

const DEFAULT_IMAGE = 'https://media.istockphoto.com/id/1770694499/photo/missing-stamp-on-kraft-paper-background.jpg?s=612x612&w=0&k=20&c=GpEOegSd5MyW44orcSvDK5JL9uK5qeCohHGoWOv-sTA=';

export default function AppCenter({ installedApps, openApp }) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [installState, setInstallState] = useState(null); // null, 'animating', 'done'
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = appData.filter(a => {
    const matchesTab = activeTab === 'All' || a.category === activeTab;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleInstallClick = () => {
    setInstallState('animating');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        setInstallState('done');
        // Save to file manager
        saveFile(`/home/user/Downloads/${selectedApp.id}.app`, JSON.stringify({ appId: selectedApp.id, type: 'app_installer' }));
      } else {
        setProgress(p);
      }
    }, 200);
  };

  if (selectedApp) {
    return (
      <div className="app-center">
        <div className="ac-detail-view">
          <button className="ac-back-btn" onClick={() => { setSelectedApp(null); setInstallState(null); }}>← Back</button>
          
          <div className="ac-detail-header">
            <div className="ac-detail-icon">{selectedApp.emoji}</div>
            <div className="ac-detail-info">
              <h1>{selectedApp.name}</h1>
              <p>{selectedApp.category}</p>
              {installedApps.includes(selectedApp.id) ? (
                <button className="ac-btn installed" onClick={() => openApp(selectedApp.id)}>Open</button>
              ) : (
                <button className="ac-btn" onClick={handleInstallClick} disabled={installState !== null}>
                  {installState === null ? 'Install' : 'Installing...'}
                </button>
              )}
            </div>
          </div>

          {installState === 'animating' && (
            <div className="ac-install-anim">
              <div className="globe-anim">🌐 📥 📁</div>
              <p>Downloading from the internet...</p>
              <div className="ac-progress-bar"><div className="ac-progress-fill" style={{width: `${progress}%`}}></div></div>
            </div>
          )}

          {installState === 'done' && (
            <div className="ac-install-done">
              ✅ App downloaded! Check your File Manager (Downloads folder) to add it to your system.
            </div>
          )}

          <div className="ac-detail-gallery">
            {[0,1,2,3].map(i => {
              const src = selectedApp.images && selectedApp.images[i] ? selectedApp.images[i] : DEFAULT_IMAGE;
              return <img key={i} src={src} alt="screenshot" className="ac-screenshot" />;
            })}
          </div>

          <div className="ac-detail-desc">
            <h3>Description</h3>
            <p>{selectedApp.description}</p>
            <h3>Reviews</h3>
            <p>{selectedApp.review}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-center">
      <div className="ac-sidebar">
        {['All', 'Work', 'Play', 'Dev'].map(cat => (
          <div key={cat} className={`ac-nav ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
            {cat}
          </div>
        ))}
      </div>
      <div className="ac-content">
        <div className="ac-explore">
          <div className="ac-hero">
            <h1>App Center ({activeTab})</h1>
            <p>Discover apps tailored for {activeTab.toLowerCase()}.</p>
            <input 
              type="text" 
              className="ac-search" 
              placeholder="Search apps..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="ac-grid">
            {filteredApps.map(app => (
              <div key={app.id} className="ac-card">
                <div className="ac-card-icon">{app.emoji}</div>
                <div className="ac-card-meta">
                  <div className="ac-card-title">{app.name}</div>
                  <div className="ac-card-cat">{app.category}</div>
                </div>
                <button className="ac-btn" onClick={() => setSelectedApp(app)}>
                  See Detail
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
