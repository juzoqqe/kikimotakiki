import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import GalleryGrid from "../components/GalleryGrid";

function Home({ user, setUser }) {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Sidebar user={user} setUser={setUser} />
        <GalleryGrid />
      </div>
    </>
  );
}

export default Home;