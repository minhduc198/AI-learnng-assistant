import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const DEFAULT_AVATAR = "/images/avatar-default.jpg";
const ProfileContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("Context error!");
  }

  return context;
}

export default function ProfileProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    avatar: DEFAULT_AVATAR,
  });

  const fetchProfile = async () => {
    try {
      const { data } = await authService.getProfile();
      setUserInfo({
        username: data.username,
        email: data.email,
        avatar: data.profileImage || DEFAULT_AVATAR,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    userInfo,
    loading,
    fetchProfile,
    setUserInfo,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
