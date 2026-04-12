import axios from 'axios';
import summaryApi from './summaryApi';
import store from "../store/store";
import { logoutUser } from "../store/authSlice";
import { resetUser } from "../store/userSlice";
import { resetPosts } from "../store/postSlice";

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

Axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;

    if (originalReq.url.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      if (!refreshPromise) {
        refreshPromise = Axios(summaryApi.refreshToken).finally(() => {
          refreshPromise = null;
        });
      }

      try {
        await refreshPromise;
        return Axios(originalReq);
      } catch (err) {
        store.dispatch(logoutUser());
        store.dispatch(resetUser());
        store.dispatch(resetPosts());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;
