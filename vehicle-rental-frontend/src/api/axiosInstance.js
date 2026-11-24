import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8181",
  withCredentials: true,
});


export default axiosInstance;