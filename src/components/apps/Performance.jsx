import { useState, useEffect } from 'react';
import './Performance.css';

export default function Performance() {
  const [stats, setStats] = useState({
    cpu: 12,
    ram: 4.2,
    network: 2.1,
    uptime: '02:15:34'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 20) + 5,
        ram: (4.2 + Math.random() * 0.2).toFixed(1),
        network: (Math.random() * 5 + 1).toFixed(1)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="perf-app">
      <div className="perf-header">System Performance</div>
      <div className="perf-grid">
        <div className="perf-card">
          <div className="perf-label">CPU Usage</div>
          <div className="perf-value">{stats.cpu}%</div>
          <div className="perf-bar"><div className="fill" style={{width: `${stats.cpu}%`}}></div></div>
        </div>
        <div className="perf-card">
          <div className="perf-label">RAM Used</div>
          <div className="perf-value">{stats.ram} GB</div>
          <div className="perf-bar"><div className="fill" style={{width: `${(stats.ram/16)*100}%`}}></div></div>
        </div>
        <div className="perf-card">
          <div className="perf-label">Network Speed</div>
          <div className="perf-value">{stats.network} MB/s</div>
          <div className="perf-bar net"><div className="fill" style={{width: `${(stats.network/10)*100}%`}}></div></div>
        </div>
        <div className="perf-card">
          <div className="perf-label">System Uptime</div>
          <div className="perf-value">{stats.uptime}</div>
        </div>
      </div>
    </div>
  );
}
