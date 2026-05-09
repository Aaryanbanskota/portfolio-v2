import './Settings.css';

export default function Settings({ config }) {
  const updateDock = (pos) => {
    if (window.updateOSConfig) {
       window.updateOSConfig({ dockPosition: pos });
    }
  };

  const updateTheme = (theme) => {
    if (window.updateOSConfig) {
       window.updateOSConfig({ theme });
    }
  };

  return (
    <div className="settings-app">
      <div className="settings-sidebar">
        <div className="s-nav active">Appearance</div>
        <div className="s-nav">Background</div>
        <div className="s-nav">Privacy</div>
      </div>
      <div className="settings-main">
        <h1>Customize OS-A</h1>
        
        <div className="settings-section">
          <h3>Dock Position</h3>
          <div className="dock-options">
            <div 
              className={`dock-opt ${config.dockPosition === 'left' ? 'active' : ''}`}
              onClick={() => updateDock('left')}
            >
              Left Sidebar
            </div>
            <div 
              className={`dock-opt ${config.dockPosition === 'bottom' ? 'active' : ''}`}
              onClick={() => updateDock('bottom')}
            >
              Bottom Dock
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Dock Style</h3>
          <div className="dock-options">
            <div 
              className={`dock-opt ${!config.dockStyle || config.dockStyle === 'default' ? 'active' : ''}`}
              onClick={() => { if(window.updateOSConfig) window.updateOSConfig({ dockStyle: 'default' }) }}
            >
              Default Solid
            </div>
            <div 
              className={`dock-opt ${config.dockStyle === 'glass' ? 'active' : ''}`}
              onClick={() => { if(window.updateOSConfig) window.updateOSConfig({ dockStyle: 'glass' }) }}
            >
              Blur Black Glass
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Theme</h3>
          <div className="theme-options">
            <div 
              className={`theme-opt ubuntu ${config.theme === 'ubuntu' ? 'active' : ''}`}
              onClick={() => updateTheme('ubuntu')}
            >
              Ubuntu Purple
            </div>
            <div 
              className={`theme-opt dark ${config.theme === 'dark' ? 'active' : ''}`}
              onClick={() => updateTheme('dark')}
            >
              OLED Dark
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
