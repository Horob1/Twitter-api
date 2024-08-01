import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    if (!socket) {
      const sk = io("http://localhost:3000", {
        auth: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setSocket(sk);
    }
    return () => {
      if (socket) {
        console.log("disconnected");
        socket.disconnect();
      }
    };
  }, [socket, setSocket]);
  return [socket];
};
