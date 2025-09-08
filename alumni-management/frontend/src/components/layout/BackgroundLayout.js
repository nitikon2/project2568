import React from 'react';

const BackgroundLayout = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #b6e0fe 50%, #f8fbff 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* วงกลมตกแต่งพื้นหลัง */}
    <div style={{
      position: 'absolute',
      top: '-120px',
      left: '-120px',
      width: '300px',
      height: '300px',
      background: 'rgba(13,110,253,0.12)',
      borderRadius: '50%',
      zIndex: 0,
    }} />
    <div style={{
      position: 'absolute',
      bottom: '-100px',
      right: '-100px',
      width: '220px',
      height: '220px',
      background: 'rgba(13,110,253,0.10)',
      borderRadius: '50%',
      zIndex: 0,
    }} />
    <div style={{ zIndex: 1, width: '100%' }}>
      {children}
    </div>
  </div>
);

export default BackgroundLayout;
