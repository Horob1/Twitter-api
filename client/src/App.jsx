import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { OAuthLogin } from "./pages/OAuthLogin";
import { HLSStreaming } from "./pages/HLSStreaming";
import { VideoStreaming } from "./pages/VideoStreaming";
import { ChatBox } from "./pages/ChatBox";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/login",
        element: <OAuthLogin />,
      },
      {
        path: "/hls",
        element: <HLSStreaming />,
      },
      {
        path: "/video",
        element: <VideoStreaming />,
      },
      {
        path: "/chat-box",
        element: <ChatBox />,
      },
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
