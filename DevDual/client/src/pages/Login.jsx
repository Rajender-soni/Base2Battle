import logo from "/logo.jpg";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useUser } from "../context/UserContext";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";

function Login() {
  const [show, setShow] = useState(false);
  const { setUserData, userData } = useUser();
  const { signInWithEmail, signInWithGoogle, syncWithBackend, loading: firebaseLoading } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  const handleShowChange = () => {
    setShow(!show);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const backendData = await syncWithBackend(result.user);
      setUserData(backendData.user || backendData);
      toast.success(`Welcome back, ${backendData.user?.name || backendData.name}!`);
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      
      // Better error messages
      let errorMessage = "Google login failed";
      if (error.response?.status === 503) {
        errorMessage = "Google Sign-In is temporarily unavailable. Please use email/password login.";
      } else if (error.response?.data?.error === "FIREBASE_NOT_CONFIGURED") {
        errorMessage = "Google Sign-In is not configured on the server. Please contact support or use email/password login.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try Firebase authentication first
      try {
        const userCredential = await signInWithEmail(email, password);
        
        // Sync with backend
        try {
          const backendData = await syncWithBackend(userCredential.user);
          setUserData(backendData.user || backendData);
          toast.success(`Welcome back, ${backendData.user?.name || backendData.name}!`);
          navigate("/");
          return;
        } catch (syncError) {
          // If backend sync fails, fall back to traditional login
          console.warn("Firebase backend sync failed, trying traditional login:", syncError);
        }
      } catch (firebaseError) {
        // If Firebase fails, fall back to traditional backend login
        console.warn("Firebase login failed, trying traditional login:", firebaseError);
      }
      
      // Fallback: Traditional backend login (no Firebase)
      const response = await axios.post(
        `${serverURL}/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      setUserData(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle error messages
      let errorMessage = "Login failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-zinc-900 w-[100vw] h-[100vh] flex items-center justify-center relative">
      <div className="hidden md:block fixed left-8 lg:left-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10"></div>
      
      <div className="hidden md:block fixed right-8 lg:right-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10"></div>
      
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 px-4 py-2 bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all border border-zinc-600 flex items-center gap-2"
      >
        <span>←</span> Return to Home
      </button>
      <form
        className="w-[90%] md:w-200 h-150 bg-[white] shadow-xl rounded-2xl flex"
        onSubmit={handleSubmit}
      >
        <div
          className="md:w-[50%] w-[100%] h-[100%] flex flex-col
    items-center justify-center gap-3"
        >
          <div>
            <h1 className="font-semibold tex-[black] text-2xl">Welcome Back</h1>
            <h2 className="text-[#999797] text-[18px]">
              Sign in to your account
            </h2>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={firebaseLoading || loading}
            className="w-[80%] h-[45px] bg-white border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 hover:text-zinc-900 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
          >
            {firebaseLoading || loading ? (
              <ClipLoader size={16} color="#4285F4" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-semibold">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="w-[80%] flex items-center mb-2">
            <div className="flex-1 border-t border-zinc-300"></div>
            <span className="px-3 text-xs text-zinc-500 bg-white">Or continue with email</span>
            <div className="flex-1 border-t border-zinc-300"></div>
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3">
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3 relative">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              id="password"
              type={show ? "text" : "password"}
              className="border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!show && (
              <IoEyeOff
                onClick={handleShowChange}
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
              />
            )}
            {show && (
              <IoEye
                onClick={handleShowChange}
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
              />
            )}
          </div>

          <button className="w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center  justify-center rounded-[5px] mt-5 ">
            {loading ? (
              <ClipLoader size={30} color="white" />
            ) : (
              "Continue Your journey"
            )}
          </button>
          <span className="text-[13px] cursor-pointer text-[#585757] hover:underline underline-offset-2">
            Forget your Password?
          </span>
       
         
          <div
            onClick={() => {
              navigate("/signup");
            }}
            className="text-[#6f6f6f]"
          >
            Don't have an account?{" "}
            <span className="hover:underline underline-offset-1 cursor-pointer text-black">
              Register
            </span>
          </div>
        </div>
        {/* right div */}
        <div
          className="w-[50%] h-[100%] rounded-r-2xl bg-[black] md:flex flex-col
    items-center justify-center hidden"
        >
          <img
            src={logo}
            alt="logo"
            className="w-30 shadow-2xl border-2 border-white"
          ></img>
          <ul className="text-white list-disc list-inside space-y-2 mt-10">
            <li>Real-time 1v1 Coding Battles</li>
            <li>2500+ Problems for Gamified Environment</li>
            <li>Track Your Performance & Stats</li>
            <li>Compete & Improve Your Skills</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

export default Login;
