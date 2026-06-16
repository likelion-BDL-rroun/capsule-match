export default function CornerGlow() {
  const glow = (pos: React.CSSProperties) => (
    <div style={{
      position: 'absolute',
      width: 360, height: 360,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,96,0,0.42) 0%, rgba(255,96,0,0.12) 45%, transparent 70%)',
      filter: 'blur(50px)',
      pointerEvents: 'none',
      ...pos,
    }} />
  );

  return (
    <>
      {glow({ top: -80, left: -80 })}
      {glow({ top: -80, right: -80 })}
      {glow({ bottom: -80, left: -80 })}
      {glow({ bottom: -80, right: -80 })}
    </>
  );
}
