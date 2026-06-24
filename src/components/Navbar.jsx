import './navbar.css';

function Navbar({ title, onLogout, showLogout = true }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand" aria-label="Brand">
          <div className="logo" />
          <span>Office Portal</span>
        </div>

        <div className="nav-center">
          {title ? <div className="nav-title">{title}</div> : null}
        </div>

        <div className="nav-actions">
          {showLogout && onLogout ? (
            <button className="btn btn-danger" onClick={onLogout} type="button">
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

