/** Fondo decorativo fijo detrás de todo: resplandor navy + grano (ver globals.css). */
export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop-glow" />
      <div className="site-backdrop-grain" />
    </div>
  );
}
