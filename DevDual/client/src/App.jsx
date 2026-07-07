import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import PageLoader from "./components/PageLoader";
import { BattleProvider } from "./context/BattleContext";
import ProtectedRoute from "./hooks/ProtectedRoutes.jsx";
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext";
import DsaSheets from "./pages/DsaSheet.jsx";

const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./components/profile/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const SelectProblemPage = lazy(() => import("./pages/SelectProblem"));
const ProblemScreen = lazy(() =>
  import("./components/problemPanel/ProblemScreen")
);
const JoinRoom = lazy(() => import("./pages/JoinRoom"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const History = lazy(() => import("./pages/History"));
const WaitingWindow = lazy(() => import("./pages/WaitingWindow.jsx"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EditProfile = lazy(() => import("./components/profile/EditProfile.jsx"));
const LeaderBoard = lazy(() => import("./pages/LeaderBoard.jsx"));
const SystemDesignPage = lazy(() => import("./pages/systemDesign.jsx"));
const SystemDesignTopic = lazy(() => import("./pages/SystemDesignTopic.jsx"));
const CompanyWiseSheet = lazy(() => import("./pages/CompanyWiseSheet.jsx"));
const CompanySheet = lazy(() => import("./pages/CompanySheet.jsx"));
const MessagesPage = lazy(() => import("./pages/MessagesPage.jsx"));
const SocialListPage = lazy(() => import("./pages/SocialListPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
export const serverURL = import.meta.env.VITE_SERVER_URL;

function App() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <FirebaseAuthProvider>
      <BattleProvider>
        {isNavigating && <PageLoader />}
        <ToastContainer pauseOnHover={false} theme="dark" />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/dsa-sheets" element={
              <ProtectedRoute>
                <DsaSheets />
              </ProtectedRoute>
            } />
            <Route path="/system-design" element={<SystemDesignPage />} />
            <Route 
              path="/system-design/:slug" 
              element={
                <ProtectedRoute>
                  <SystemDesignTopic />
                </ProtectedRoute>
              } 
            />
            <Route path="/sheets" element={<CompanyWiseSheet />} />
            <Route 
              path="/sheet/:company" 
              element={
                <ProtectedRoute>
                  <CompanySheet />
                </ProtectedRoute>
              } 
            />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* protected routes */}
            <Route
              path="/battle"
              element={
                <ProtectedRoute>
                  <SelectProblemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-room"
              element={
                <ProtectedRoute>
                  <JoinRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problem/:problemId"
              element={
                <ProtectedRoute>
                  <ProblemScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiting-window"
              element={
                <ProtectedRoute>
                  <WaitingWindow />
                </ProtectedRoute>
              }
            />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social/:userId/:type"
              element={
                <ProtectedRoute>
                  <SocialListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-requests"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BattleProvider>
    </FirebaseAuthProvider>
  );
}

export default App;
