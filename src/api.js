import axios from "axios";

export const BASE_URL = "http://localhost:8080";
const API = `${BASE_URL}/api/auth`;

// LOGIN
export const login = (data) => axios.post(`${API}/login`, data);

// SEND OTP
export const sendOtp = (email) =>
  axios.post(`${API}/forgot-password`, { email });

// VERIFY OTP
export const verifyOtp = (email, otp) =>
  axios.post(`${API}/verify-otp`, { email, otp });

// RESET PASSWORD
export const resetPassword = (email, password) =>
  axios.post(`${API}/reset-password`, { email, password });


