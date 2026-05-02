import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getWorkItems = () => API.get('/workitems');
export const getWorkItem = (id) => API.get(`/workitems/${id}`);
export const transitionWorkItem = (id) => API.patch(`/workitems/${id}/transition`);
export const submitRCA = (id, data) => API.post(`/workitems/${id}/rca`, data);
export const ingestSignal = (data) => API.post('/signals', data);