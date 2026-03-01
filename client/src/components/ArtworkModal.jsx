import { useEffect, useState } from "react";

function ArtworkModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchComments();
    fetchLikes();
  }, []);

  const fetchComments = async () => {
    const res = await fetch(
      `http://localhost:5000/api/posts/${post.id}/comments`
    );
    const data = await res.json();
    setComments(data);
  };

  const fetchLikes = async () => {
    const res = await fetch(
      `http://localhost:5000/api/posts/${post.id}/likes`
    );
    const data = await res.json();
    setLikes(data.count);
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:5000/api/posts/${post.id}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchLikes();
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:5000/api/posts/${post.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    onClose();
  };

  const handleComment = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:5000/api/posts/${post.id}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      }
    );

    setCommentText("");
    fetchComments();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-left">
          <img
            src={`http://localhost:5000${post.image_url}`}
            alt=""
          />
        </div>

        <div className="modal-right">
          <h3>{post.title}</h3>
          <p>{post.description}</p>

          <div className="modal-actions">
            <button onClick={handleLike}>
              ❤️ {likes}
            </button>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/post/${post.id}`
                )
              }
            >
              🔗 Поделиться
            </button>

            <button onClick={handleDelete}>
              🗑 Удалить
            </button>
          </div>

          <div className="modal-comments">
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <strong>{c.username}</strong>
                <p>{c.content}</p>
              </div>
            ))}

            <div className="comment-input">
              <input
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                placeholder="Написать комментарий..."
              />
              <button onClick={handleComment}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtworkModal;