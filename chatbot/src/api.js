// api.js
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/chat";

export const sendMsgToGroq = async (message, file = null) => {
  try {
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.reply) {
      return response.data.reply;
    } else {
      return "No valid response from server.";
    }
  } catch (error) {
    console.error("Error from API:", error);
    return "Error communicating with server.";
  }
};
