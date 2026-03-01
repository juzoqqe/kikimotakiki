import { useEffect, useState, useRef } from "react";
import ArtworkModal from "./ArtworkModal";

function GalleryGrid() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/posts/my",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    setPosts(data);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    setNewPost({
      file,
      preview: URL.createObjectURL(file),
      title: "",
      description: ""
    });
  };

  const publishPost = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("image", newPost.file);
    formData.append("title", newPost.title);
    formData.append("description", newPost.description);

    const res = await fetch(
      "http://localhost:5000/api/posts/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await res.json();

    if (res.ok) {
      setPosts(prev => [data, ...prev]);
      setNewPost(null);
    }
  };

  return (
    <>
      <div className="gallery">
        <div
          className="art-card add-card"
          onClick={() => fileInputRef.current.click()}
        >
          +
        </div>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        {posts.map(post => (
          <div
            key={post.id}
            className="art-card"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={`http://localhost:5000${post.image_url}`}
              alt=""
            />
          </div>
        ))}
      </div>

      {/* ===== CREATE POST MODAL ===== */}
      {newPost && (
        <div
          className="modal-overlay"
          onClick={() => setNewPost(null)}
        >
          <div
            className="create-post-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Новый пост</h3>

            {/* Preview */}
            <img
              src={newPost.preview}
              alt=""
              style={{
                width: "100%",
                borderRadius: "18px",
                marginBottom: "10px"
              }}
            />

            <input
              placeholder="Название"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  title: e.target.value
                })
              }
            />

            <textarea
              placeholder="Описание"
              value={newPost.description}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  description: e.target.value
                })
              }
            />

            <div className="create-post-actions">
              <button onClick={publishPost}>
                Опубликовать
              </button>

              <button onClick={() => setNewPost(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {selectedPost && (
        <ArtworkModal
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            fetchPosts();
          }}
        />
      )}
    </>
  );
}

export default GalleryGrid;