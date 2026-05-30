import axios from 'axios';

const API = axios.create({
    baseURL: 'https://hadi8130.pythonanywhere.com/api/',
});

// Make sure this line is exactly like this
export default API;