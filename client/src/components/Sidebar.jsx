import { useState, useRef } from "react";

function Sidebar({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || "");

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/auth/update-profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bio })
      }
    );

    const data = await res.json();

    if (res.ok) {
      setUser({ ...user, ...data });
      setEditing(false);
    } else {
      alert(data.error);
    }
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append(type, file);

    const res = await fetch(
      "http://localhost:5000/api/auth/update-images",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await res.json();

    if (res.ok) {
      setUser(prev => ({
        ...prev,
        avatar_url: data.avatar_url || prev.avatar_url,
        banner_url: data.banner_url || prev.banner_url
      }));
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="sidebar">

      {/* ===== БАННЕР ===== */}
      <div
        className="banner"
        style={{
          backgroundImage: user.banner_url
            ? `url(http://localhost:5000${user.banner_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        onClick={() => bannerInputRef.current.click()}
      ></div>

      <input
        type="file"
        hidden
        ref={bannerInputRef}
        onChange={(e) =>
          handleImageUpload("banner", e.target.files[0])
        }
      />

      {/* ===== АВАТАР ===== */}
      <div
        className="avatar"
        style={{
          backgroundImage: user.avatar_url
            ? `url(http://localhost:5000${user.avatar_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        onClick={() => avatarInputRef.current.click()}
      ></div>

      <input
        type="file"
        hidden
        ref={avatarInputRef}
        onChange={(e) =>
          handleImageUpload("avatar", e.target.files[0])
        }
      />

      {/* ===== ИНФО ===== */}
      <div className="profile-info">
        <h2>{user.username}</h2>
        <p>@{user.username}</p>

        {editing ? (
          <>
            <textarea
              placeholder="О себе..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button onClick={handleSave}>
              Сохранить
            </button>
          </>
        ) : (
          <p className="bio">
            {user.bio || "Добавьте описание"}
          </p>
        )}
      </div>

      <div className="profile-actions">
        <button onClick={() => setEditing(!editing)}>
          {editing ? "Отмена" : "Редактировать профиль"}
        </button>

        <button onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}

export default Sidebar;