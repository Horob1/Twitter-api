import { Link, Outlet } from "react-router-dom";
import reactLogo from "./../assets/react.svg";
import viteLogo from "/vite.svg";
export const Home = () => {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo " alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="button-container">
        <button>
          <Link to={"/login"}>Login with Google</Link>
        </button>
        <button>
          <Link to={"/hls"}>Hls Streaming</Link>
        </button>
        <button>
          <Link to={"/video"}>Video Streaming</Link>
        </button>
        <button>
          <Link to={"/chat-box"}>Chat</Link>
        </button>
      </div>

      <Outlet></Outlet>
      <p>
        Edit <code>src/App.jsx</code> and save to test HMR
      </p>
    </>
  );
};
