import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : "/api";

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})