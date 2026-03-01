import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Регистрация успешна");
      navigate("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Регистрация</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

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

        <button className="primary-btn" onClick={handleRegister}>
          Создать аккаунт
        </button>

        <p className="auth-switch">
          Уже есть аккаунт?
          <span onClick={() => navigate("/login")}>
            Войти
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;