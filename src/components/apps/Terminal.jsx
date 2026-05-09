import { useState, useRef, useEffect } from 'react';
import './Terminal.css';

// ── Virtual File System Initial State ──
const INITIAL_FS = {
  '~': {
    type: 'directory',
    contents: {
      'documents': {
        type: 'directory',
        contents: {
          'notes.txt': { type: 'file', content: 'These are your personal notes.' },
          'welcome.md': { type: 'file', content: '# Welcome to os-A\nThis is a powerful terminal.' }
        }
      },
      'downloads': {
        type: 'directory',
        contents: {
          'sample.json': { type: 'file', content: '{"status": "ready"}' }
        }
      },
      'README.md': { type: 'file', content: 'Welcome to your new home directory.' }
    }
  }
};

export default function Terminal({ openApp }) {
  const [lines, setLines] = useState([
    { type: 'output', text: 'Booting Ultimate Terminal OS...' },
    { type: 'output', text: 'System version 2.0.0 initializing...' },
    { type: 'output', text: "Welcome to os-A Terminal. Type 'help' to see available commands." }
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('~');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fs, setFs] = useState(INITIAL_FS);
  const [username] = useState('user');
  const [hostname, setHostname] = useState('terminal');
  
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const PROMPT = `${username}@${hostname}:${cwd}$ `;

  // ── Helper: Resolve Path ──
  const resolvePath = (path, current) => {
    if (!path || path === '~') return '~';
    if (path.startsWith('~')) return path.replace(/\/+$/, '');
    if (path === '..') {
      const parts = current.split('/').filter(p => p);
      if (parts.length <= 1) return '~';
      parts.pop();
      return parts.join('/');
    }
    return `${current}/${path}`.replace(/\/+$/, '').replace('~/', '~');
  };

  // ── Helper: Get Node ──
  const getNode = (path, currentFs) => {
    const parts = path.split('/').filter(p => p && p !== '~');
    let curr = currentFs['~'];
    for (const part of parts) {
      if (!curr.contents || !curr.contents[part]) return null;
      curr = curr.contents[part];
    }
    return curr;
  };

  const handleCommand = (rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setLines(prev => [...prev, { type: 'prompt', text: PROMPT }]);
      return;
    }

    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let output = '';
    let type = 'output';

    switch (cmd) {
      case 'help':
        output = `Available commands:
about, calc, cat, clear, clock, date, echo, explorer, help, history, hostname, ls, mackbook, mkdir, pwd, quote, reboot, rm, sysinfo, time, todo, touch, tree, uptime, version, weather, whoami, wiki`;
        break;

      case 'about':
        output = "Ultimate Terminal OS v2.0.0. A browser-based terminal emulator with advanced features.";
        break;

      case 'clear':
        setLines([]);
        return;

      case 'pwd':
        output = cwd;
        break;

      case 'whoami':
        output = username;
        break;

      case 'date':
        output = new Date().toLocaleDateString();
        break;

      case 'time':
        output = new Date().toLocaleTimeString();
        break;

      case 'ls': {
        const targetPath = args[0] ? resolvePath(args[0], cwd) : cwd;
        const node = getNode(targetPath, fs);
        if (node && node.type === 'directory') {
          output = Object.keys(node.contents).map(name => {
            const isDir = node.contents[name].type === 'directory';
            return isDir ? `\x1b[34m${name}/\x1b[0m` : name;
          }).join('  ');
        } else {
          output = `ls: cannot access '${args[0] || '.'}': No such directory`;
          type = 'error';
        }
        break;
      }

      case 'cd': {
        const targetPath = resolvePath(args[0] || '~', cwd);
        const node = getNode(targetPath, fs);
        if (node && node.type === 'directory') {
          setCwd(targetPath);
        } else {
          output = `cd: ${args[0]}: No such directory`;
          type = 'error';
        }
        break;
      }

      case 'cat': {
        const targetPath = resolvePath(args[0], cwd);
        const node = getNode(targetPath, fs);
        if (node && node.type === 'file') {
          output = node.content;
        } else {
          output = `cat: ${args[0]}: No such file`;
          type = 'error';
        }
        break;
      }

      case 'mkdir': {
        const name = args[0];
        if (!name) { output = "mkdir: missing operand"; type="error"; break; }
        const parentNode = getNode(cwd, fs);
        if (parentNode.contents[name]) {
          output = `mkdir: cannot create directory '${name}': File exists`;
          type = 'error';
        } else {
          const newFs = JSON.parse(JSON.stringify(fs));
          const target = getNode(cwd, newFs);
          target.contents[name] = { type: 'directory', contents: {} };
          setFs(newFs);
          output = `Directory '${name}' created.`;
        }
        break;
      }

      case 'touch': {
        const name = args[0];
        if (!name) { output = "touch: missing operand"; type="error"; break; }
        const newFs = JSON.parse(JSON.stringify(fs));
        const target = getNode(cwd, newFs);
        target.contents[name] = { type: 'file', content: '' };
        setFs(newFs);
        output = `File '${name}' created.`;
        break;
      }

      case 'calc':
        try {
          // Safe eval-like for basic math
          output = String(Function(`"use strict"; return (${args.join('')})`)());
        } catch {
          output = "calc: invalid expression";
          type = 'error';
        }
        break;

      case 'weather':
        output = `Weather for ${args.join(' ') || 'London'}: 22°C, Partly Cloudy. (Simulated)`;
        break;

      case 'quote':
        const quotes = [
          "The only way to do great work is to love what you do. - Steve Jobs",
          "Innovation distinguishes between a leader and a follower. - Steve Jobs",
          "Stay hungry, stay foolish. - Steve Jobs"
        ];
        output = quotes[Math.floor(Math.random() * quotes.length)];
        break;

      case 'sysinfo':
        output = `OS: Ultimate Terminal OS v2.0.0\nShell: ReactTerm v1.0\nCPU: Virtual x64\nMemory: 16GB Virtual`;
        break;

      case 'mackbook':
        openApp('brave'); // Redirect to browser for MacBook feel
        output = "Opening MacBook interface in Brave...";
        break;

      case 'explorer':
        openApp('files');
        output = "Opening File Explorer...";
        break;

      case 'wiki':
        window.open(`https://en.wikipedia.org/wiki/${args.join('_')}`, '_blank');
        output = `Searching Wikipedia for ${args.join(' ')}...`;
        break;

      default:
        output = `${cmd}: command not found. Type 'help' for available commands.`;
        type = 'error';
    }

    setLines(prev => [
      ...prev,
      { type: 'prompt', text: PROMPT + trimmed },
      ...(output ? [{ type, text: output }] : [])
    ]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(nextIdx === -1 ? '' : history[nextIdx]);
      }
    }
  };

  return (
    <div className="term-container" onClick={() => inputRef.current?.focus()}>
      <div className="term-content">
        {lines.map((line, i) => (
          <div key={i} className={`term-line ${line.type}`}>
            {line.type === 'prompt' ? (
              <span className="prompt-text">{line.text}</span>
            ) : (
              <pre className="output-text">{line.text}</pre>
            )}
          </div>
        ))}
        <div className="term-input-line">
          <span className="prompt-text">{PROMPT}</span>
          <input
            ref={inputRef}
            type="text"
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
