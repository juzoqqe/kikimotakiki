import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Вход</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="primary-btn" onClick={handleLogin}>
          Войти
        </button>

        <p className="auth-switch">
          Нет аккаунта?
          <span onClick={() => navigate("/register")}>
            Зарегистрироваться
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;