import { useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { serverURL } from "../App";

function useGetCurrentUser() {
  const { setUserData } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${serverURL}/user/getcurrentuser`, {
          withCredentials: true,
        });

        setUserData(response.data);
      } catch (error) {
        console.error(error);
        setUserData(null);
      }
    };

    fetchUser();
  }, [setUserData]);
}

export default useGetCurrentUser;
