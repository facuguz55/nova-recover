// Fondo animado sutil — CSS puro (ver globals.css), respeta prefers-reduced-motion.
export default function AnimatedBackground() {
  return (
    <div className="nova-bg" aria-hidden="true">
      <div className="nova-bg-grid" />
      <div className="nova-bg-orb nova-bg-orb-1" />
      <div className="nova-bg-orb nova-bg-orb-2" />
      <div className="nova-bg-orb nova-bg-orb-3" />
    </div>
  );
}
