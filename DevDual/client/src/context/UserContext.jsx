import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

const STORAGE_KEY = "userData";

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading user data from localStorage:", error);
  }
  return null;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserDataState] = useState(getInitialState);
  const [loading, setLoading] = useState(true);

  // ✅ Automatically fetch user on mount (only once)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${serverURL}/user/getcurrentuser`, {
          withCredentials: true,
        });
        setUserDataState(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setUserDataState(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Sync user data with localStorage
  useEffect(() => {
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving user data to localStorage:", error);
    }
  }, [userData]);

  const setUserData = (data) => setUserDataState(data);

  const clearUserData = () => {
    setUserDataState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    userData,
    setUserData,
    clearUserData,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
