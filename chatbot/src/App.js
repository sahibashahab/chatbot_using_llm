import './App.css';
import chatbotlogo from './assets/chat.jpg';
import addBtn from './assets/addBtn.png';
import sendBtn from './assets/send.svg';
import usericon from './assets/usericon.webp';
import c2clogo from './assets/chat.jpg';
import { sendMsgToGroq } from './api';

import { useRef, useState, useEffect } from 'react';

function App() {
  const msgEnd = useRef(null);
  const fileInputRef = useRef(null);

  const [Input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "Hi, I am Chatbot, a state-of-the-art language model. I am designed to understand and generate human-like text based on truth.",
      isBot: true,
    }
  ]);
  const [savedChats, setSavedChats] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (Input.trim() === "" && !file) return;

    if (file) {
      setMessages(prev => [...prev, { text: `📎 File: ${file.name}\nMessage: ${Input}`, isBot: false }]);
    } else {
      setMessages(prev => [...prev, { text: Input, isBot: false }]);
    }

    const messageToSend = Input || "";

    setInput('');
    
    const res = await sendMsgToGroq(messageToSend, file);
    setFile(null);

    setMessages(prev => [...prev, { text: res, isBot: true }]);
  };

  const handleEnter = async (e) => {
    if (e.key === 'Enter') await handleSend();
  };

  const handleSaveChat = () => {
    const currentDateTime = new Date().toLocaleString();
    let saved = JSON.parse(localStorage.getItem('savedChats'));
    if (!Array.isArray(saved)) saved = [];

    const newChat = {
      date: currentDateTime,
      messages: messages,
    };

    saved.push(newChat);
    localStorage.setItem('savedChats', JSON.stringify(saved));

    alert('Chat saved successfully!');
  };

  const handleViewChat = () => {
    const saved = JSON.parse(localStorage.getItem('savedChats'));
    if (saved && Array.isArray(saved)) {
      setSavedChats(saved);
      setShowDropdown(!showDropdown);
    } else {
      alert('No saved chats found.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={chatbotlogo} alt="Logo" className="logo" />
            <button className="midBtn" onClick={() => window.location.reload()}>
              <img src={addBtn} alt="newchat" className="addBtn" />
              New Chat
            </button>
            <button className="midBtn" onClick={handleSaveChat}>
              <img src={addBtn} alt="savechat" className="addBtn" />
              Save Chat
            </button>

            <div style={{ marginTop: '10px' }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="midBtn"
                onClick={() => fileInputRef.current.click()}
              >
                <img src={addBtn} alt="uploadfile" className="addBtn" />
                Upload File
              </button>
              {file && (
                <div style={{ color: 'white', marginTop: '5px', fontSize: '12px' }}>
                  Selected: {file.name}
                </div>
              )}
            </div>

            <div style={{ position: "relative", marginTop: '15px' }}>
              <button className="midBtn" onClick={handleViewChat}>
                <img src={addBtn} alt="viewchat" className="addBtn" />
                View Saved
              </button>
              {showDropdown && (
                <div className="dropdownMenu">
                  {savedChats.map((chat, index) => (
                    <div key={index} className="dropdownItem">
                      <span
                        onClick={() => {
                          setMessages(chat.messages);
                          setShowDropdown(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {chat.date}
                      </span>
                      <button
                        className="deleteBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedChats = savedChats.filter((_, i) => i !== index);
                          setSavedChats(updatedChats);
                          localStorage.setItem('savedChats', JSON.stringify(updatedChats));
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lowerSide"></div>
      </div>

      <div className="main">
        <div className="chats">
          {messages.map((message, i) => (
            <div key={i} className={`chat ${message.isBot ? "left" : "right"}`}>
              <img
                src={message.isBot ? c2clogo : usericon}
                alt={message.isBot ? "Bot" : "User"}
                className="chatIcon"
              />
              <div className="messageWithDelete">
                <p className="txt">{message.text}</p>
                <button
                  className="deleteBtn"
                  onClick={() => {
                    const updatedMessages = [...messages];
                    updatedMessages.splice(i, 1);
                    setMessages(updatedMessages);
                  }}
                >
                       🗑️
                </button>
              </div>
            </div>
          ))}
          <div ref={msgEnd} />
        </div>

        <div className="chatFooter">
          <div className="inp">
            <input
              type="text"
              placeholder={file ? `Message for ${file.name} (optional)` : "Send a Message"}
              value={Input}
              onKeyDown={handleEnter}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="send" onClick={handleSend}>
              <img src={sendBtn} alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
