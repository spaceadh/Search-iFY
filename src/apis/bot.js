// import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const url = "https://searchifybackend.onrender.com";
// console.log(process.env.REACT_APP_SERVER_URL);
console.log("Url :",url);

export const geminiai = async (body) => {
  try {
    const response = await axios.post(`${url}/chat-with-gemini`, body);
    toast.success('Response successful');
    return response;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(error.response.data.error); // Display error message from server
    } else {
      toast.error('Login failed. Please try again later.'); // Generic error message
    }
    throw error;
  }
};