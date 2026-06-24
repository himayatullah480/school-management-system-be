import './pagelayout.css';

function PageLayout({ title, subtitle, children, showNavbar = false, navbar }) {
  return (
    <div className="page">
      {showNavbar && navbar}
      <main className="container">
        {title ? (
          <div className="header">
            <div>
              <h1 className="h-title">{title}</h1>
              {subtitle ? <p className="h-sub">{subtitle}</p> : null}
            </div>
          </div>
        ) : null}

        <div>{children}</div>
      </main>
    </div>
  );
}

export default PageLayout;

