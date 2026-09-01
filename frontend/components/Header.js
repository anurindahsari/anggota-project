export default function Header({ subtitle }) {
  return (
    <div className="header">
      <div className="header-mark" />
      <div>
        <div className="header-word">Hiswana Migas</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
