import logo from "../assets/logo.png";
import { useState, useEffect } from "react";

function Navbar() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="navbar">
      <div className="logo-container">
        <img src={logo} alt="logo" className="logo-img" />
        <span className="logo-text">Дома плохо</span>
      </div>

      <div className="nav-links">
        <button>Лента</button>
        <button>Друзья</button>
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;