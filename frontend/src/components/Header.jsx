export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-mark">SD</div>
        <div className="logo-text">Sana<span>Dask</span></div>
      </div>
      <div className="header-right">
        <div className="status-badge">
          <div className="status-dot" />
          Connected | Ready
        </div>
      </div>
    </header>
  )
}
