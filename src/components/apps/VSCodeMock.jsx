import { useState, useRef, useEffect } from 'react';
import './VSCodeMock.css';

export default function VSCodeMock({ params }) {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLog, setTerminalLog] = useState([
    'Terminal integrated in VS Code',
    'Type "npm run dev" to start the development server.'
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLog]);

  const handleTerminalSubmit = (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.trim();
      setTerminalLog(prev => [...prev, `user@lion-os:~/portfolio$ ${cmd}`]);
      setTerminalInput('');
      
      if (cmd === 'npm run dev') {
        setTerminalLog(prev => [
          ...prev, 
          '> portfolio@1.0.0 dev',
          '> vite',
          '',
          '  VITE v4.0.0  ready in 120 ms',
          '',
          '  ➜  Local:   http://localhost:5173/',
          '  ➜  Network: use --host to expose',
          '  ➜  Opening browser...'
        ]);
        setTimeout(() => setShowPreview(true), 1000);
      } else if (cmd) {
        setTerminalLog(prev => [...prev, `bash: ${cmd}: command not found`]);
      }
    }
  };

  return (
    <div className="vsc-root">
      <div className="vsc-sidebar">
        <div className="vsc-sidebar-title">EXPLORER</div>
        <div className="vsc-sidebar-item active">akash portfolio</div>
        <div className="vsc-sidebar-item">index.html</div>
        <div className="vsc-sidebar-item">styles.css</div>
        <div className="vsc-sidebar-item">script.js</div>
      </div>
      
      <div className="vsc-main">
        <div className="vsc-tabs">
          <div className="vsc-tab active">akash portfolio</div>
        </div>
        
        <div className="vsc-editor">
          <pre>
            <span style={{ color: 'red', fontWeight: 'bold' }}>// run npm run dev to see my port folio</span>{'\n'}
            <span style={{ color: '#569cd6' }}>const</span> profile = {'{'}{'\n'}
            {'  '}name: <span style={{ color: '#ce9178' }}>"Akash"</span>,{'\n'}
            {'  '}role: <span style={{ color: '#ce9178' }}>"Full Stack Developer"</span>,{'\n'}
            {'  '}skills: [<span style={{ color: '#ce9178' }}>"React"</span>, <span style={{ color: '#ce9178' }}>"Node.js"</span>, <span style={{ color: '#ce9178' }}>"Linux"</span>],{'\n'}
            {'  '}status: <span style={{ color: '#ce9178' }}>"Building OS environments"</span>{'\n'}
            {'}'};{'\n'}
            {'\n'}
            console.log(<span style={{ color: '#ce9178' }}>`Hi, I'm ${'{profile.name}'}!`</span>);
          </pre>
        </div>
        
        <div className="vsc-terminal">
          <div className="vsc-term-header">TERMINAL</div>
          <div className="vsc-term-body">
            {terminalLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            <div className="vsc-term-input-row">
              <span className="prompt">user@lion-os:~/portfolio$</span>
              <input 
                type="text" 
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalSubmit}
                autoFocus
              />
            </div>
            <div ref={endRef} />
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="vsc-preview-modal">
          <div className="vsc-preview-header">
            <span>Localhost Preview - aaryandev.netlify.app</span>
            <button onClick={() => setShowPreview(false)}>X</button>
          </div>
          <iframe src="https://aaryandev.netlify.app/" className="vsc-preview-iframe" />
        </div>
      )}
    </div>
  );
}
