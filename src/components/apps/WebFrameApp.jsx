export default function WebFrameApp({ src }) {
  return (
    <iframe 
      src={src} 
      title="Web Game"
      style={{ width: '100%', height: '100%', border: 'none', background: '#000' }}
      allow="autoplay; fullscreen; gamepad"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
