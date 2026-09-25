function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">✈</div>

        <span>Wanderlist</span>
      </div>

      <nav>
        <a href="#bucket">My bucket list</a>

        <a href="#bucket">Explore</a>
      </nav>
    </header>
  );
}

export default Header;
