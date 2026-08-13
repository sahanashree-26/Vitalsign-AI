import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import client from "./api/client";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(
      "vitalsignai_user"
    );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(
        "vitalsignai_user"
      );

      return null;
    }
  });


  const [loading, setLoading] = useState(true);


  /*
   * When the application starts:
   *
   * 1. Check whether a token exists.
   * 2. Ask the backend for the latest user profile.
   * 3. Save the latest profile locally.
   *
   * This prevents old values such as
   * "Dr. Alex Rivera" from remaining in localStorage.
   */
  useEffect(() => {

    async function loadCurrentUser() {

      const token = localStorage.getItem(
        "vitalsignai_token"
      );

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const res = await client.get(
          "/settings/profile"
        );

        const latestUser = res.data;

        localStorage.setItem(
          "vitalsignai_user",
          JSON.stringify(latestUser)
        );

        setUser(latestUser);

      } catch (error) {

        console.error(
          "Unable to load current user:",
          error
        );

        /*
         * If token is invalid, remove the session.
         */
        if (error?.response?.status === 401) {

          localStorage.removeItem(
            "vitalsignai_token"
          );

          localStorage.removeItem(
            "vitalsignai_user"
          );

          setUser(null);
        }

      } finally {

        setLoading(false);

      }
    }


    loadCurrentUser();

  }, []);


  async function login(email, password) {

    const res = await client.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const token = res.data.access_token;

    localStorage.setItem(
      "vitalsignai_token",
      token
    );


    /*
     * Login response may not contain the
     * latest age/gender values.
     *
     * Therefore immediately request the
     * complete profile from the backend.
     */
    try {

      const profileResponse = await client.get(
        "/settings/profile"
      );

      const latestUser =
        profileResponse.data;

      localStorage.setItem(
        "vitalsignai_user",
        JSON.stringify(latestUser)
      );

      setUser(latestUser);

      return latestUser;

    } catch {

      /*
       * Fallback to login response.
       */
      localStorage.setItem(
        "vitalsignai_user",
        JSON.stringify(res.data.user)
      );

      setUser(res.data.user);

      return res.data.user;
    }
  }


  function updateUser(updatedUser) {

    localStorage.setItem(
      "vitalsignai_user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  }


  function logout() {

    localStorage.removeItem(
      "vitalsignai_token"
    );

    localStorage.removeItem(
      "vitalsignai_user"
    );

    setUser(null);
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(AuthContext);
}