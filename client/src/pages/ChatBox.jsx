import { TiSpiral } from "react-icons/ti";
import InfiniteScroll from "react-infinite-scroll-component";
import { IoSend } from "react-icons/io5";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "./../axios";
const sender_id = JSON.parse(localStorage.getItem("profile"))?._id?.toString();
const style_1 = {
  backgroundColor: "#f2f2f2",
  borderRadius: 12,
  maxWidth: "70%",
  display: "flex",
  marginLeft: "auto",
  marginTop: 4,
  padding: 4,
};

const style_2 = {
  backgroundColor: "#f2f2f2",
  borderRadius: 12,
  maxWidth: "70%",
  display: "flex",
  marginRight: "auto",
  marginTop: 4,
  padding: 4,
};
const users = [
  {
    token: {
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZhMzljMDg5MjFjYzVkNTQzMDc3MjcwIiwidHlwZVRva2VuIjowLCJ2ZXJpZnkiOjEsImlhdCI6MTcyMjM1MzAzMSwiZXhwIjoxNzIyNDM5NDMxfQ.lxS2dHAGr7YhKQhmLadv7PUC_Dd4M_ejgLBuZtI6rWM",
      refresh_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZhMzljMDg5MjFjYzVkNTQzMDc3MjcwIiwidHlwZVRva2VuIjoxLCJ2ZXJpZnkiOjEsImlhdCI6MTcyMjM1MzAzMSwiZXhwIjoxNzMwOTkzMDMxfQ.CmzZNWmfCaZ-WLlwQwoZAOryZzCyIJMe3X1mhj2iDEA",
    },
    profile: {
      _id: "66a39c08921cc5d543077270",
      name: "The Anh",
      email: "nguyentheanh24102003@gmail.com",
      date_of_birth: "1975-12-31T12:00:00.000Z",
      created_at: "2024-07-26T12:52:24.244Z",
      updated_at: "2024-07-26T12:52:50.653Z",
      verifyStatus: 1,
      tweet_circle: [],
      bio: "",
      location: "",
      website: "",
      username: "Horob1",
      avatar: "",
      cover_photo: "",
    },
  },
  {
    token: {
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZhOGY5MTAwNzVmZjU3YmY5ODkxMGE2IiwidHlwZVRva2VuIjowLCJ2ZXJpZnkiOjEsImlhdCI6MTcyMjQzOTY5MiwiZXhwIjoxNzIyNTI2MDkyfQ.MOqinKPkovhdJ8SrSnRRlIYGt5_N7Jknu3LGchd7IDE",
      refresh_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZhOGY5MTAwNzVmZjU3YmY5ODkxMGE2IiwidHlwZVRva2VuIjoxLCJ2ZXJpZnkiOjEsImV4cCI6MTczMDk5MzExMSwiaWF0IjoxNzIyNDM5NjkyfQ.xEZLdGvHSQTyFvnzaeOepzy9oBop-1lMzx-kcineKPk",
    },
    profile: {
      _id: "66a8f910075ff57bf98910a6",
      name: "Tt Anh",
      email: "nguyentheanh241020033@gmail.com",
      date_of_birth: "2024-07-30T14:30:40.629Z",
      created_at: "2024-07-30T14:30:40.629Z",
      updated_at: "2024-07-30T14:30:40.629Z",
      verifyStatus: 1,
      tweet_circle: [],
      bio: "",
      location: "",
      website: "",
      username: "",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocJnN8faDB99AdmbryMZQENFlnD7sI3i2KxMBteuhlMyideMUA=s96-c",
      cover_photo: "",
    },
  },
];
const LIMIT = 10;
const CONVERSATION_ID = "66a92b93b327609372b8cf58";

export const ChatBox = () => {
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const scrollRef = useRef(null);
  const [socket] = useSocket();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const setProfile = (num) => {
    const user = users[num];
    localStorage.setItem("access_token", user.token.access_token);
    localStorage.setItem("refresh_token", user.token.refresh_token);
    localStorage.setItem("profile", JSON.stringify(user.profile));
    alert("Chose user: " + user.profile.name);
    setMessage("");
    setMessages([]);
    location.reload();
  };

  const fetchMoreData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/conversations/${CONVERSATION_ID}?page=${
          page + 1
        }&limit=${LIMIT}`
      );
      setMessages((prev) => [...prev, ...response.data.result.messages]);
      setPage(page + 1);
      setTotalPage(response.data.result.total_page);
    } catch (error) {
      console.error("Error fetching more data:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      console.log("Connected to the socket server");
    });
    socket.on("message", (payload) => {
      setMessages((prev) => [payload, ...prev]);
    });
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/conversations/${CONVERSATION_ID}?page=1&limit=${LIMIT}`
        );
        setMessages(response.data.result.messages);
        setTotalPage(response.data.result.total_page);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message === "") return;
    const date = new Date();
    const payload = {
      conversation_id: CONVERSATION_ID,
      sender_id: JSON.parse(localStorage.getItem("profile"))._id,
      content: message,
      created_at: date,
      updated_at: date,
    };
    socket.emit("message", payload);
    setMessages((prev) => [{ ...payload, _id: uuidv4() }, ...prev]);
    setMessage("");

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      <div>
        <h1>CHAT BOX</h1>
        <h3>Set Profile</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 10,
          }}
        >
          <button onClick={() => setProfile(0)}>Profile 1</button>
          <button onClick={() => setProfile(1)}>Profile 2</button>
        </div>
      </div>
      <div
        id="scrollableDiv"
        style={{
          height: 280,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <div key="alabatrap" ref={scrollRef}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreData}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          hasMore={totalPage > page}
          loader={<TiSpiral className="spinner" />}
          scrollableTarget="scrollableDiv"
        >
          {messages.map((message) => (
            <div
              key={message._id}
              style={message.sender_id === sender_id ? style_1 : style_2}
            >
              {message.content}
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <form
        onSubmit={handleSendMessage}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            padding: 10,
            flex: 1,
            marginRight: 20,
            borderRadius: 10,
          }}
          type="text"
        />
        <button>
          <IoSend style={{ fontSize: 24 }} />
        </button>
      </form>
    </div>
  );
};
