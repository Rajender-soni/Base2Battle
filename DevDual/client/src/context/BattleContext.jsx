import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const BattleContext = createContext();

export const useBattle = () => {
  const context = useContext(BattleContext);
  useEffect(()=>{
    console.log('useBattle context:', context);
  },[])
  if (!context) {
    throw new Error("useBattle must be used within BattleProvider");
  }
  return context;
};

const STORAGE_KEY = "battleData";
const CODE_STORAGE_KEY = "userCode";

const defaultState = {
  roomId: null,
  problems: [],
  currentProblemIndex: 0,
  opponent: null,
  host: null,
  duration: null,
  difficulty: null,
  topics: [],
  startTime: null,
  isHost: false,
  metadata: null,
  opponentJoined: false,
  opponentName: null,
};

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset opponent status on page reload
      return {
        ...parsed,
        opponentJoined: false,
      };
    }
  } catch (error) {
    console.error("Error loading battle data from localStorage:", error);
  }
  return defaultState;
};

const getUserCodeFromStorage = () => {
  try {
    const stored = localStorage.getItem(CODE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading user code from localStorage:", error);
  }
  return {};
};

export const BattleProvider = ({ children }) => {
  const [battleData, setBattleData] = useState(getInitialState);
  const [userCode, setUserCode] = useState(getUserCodeFromStorage);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const isResetting = useRef(false);

  // Fetch server time on mount to calculate clock offset
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const start = Date.now();
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/time`);
        if (res.ok) {
          const data = await res.json();
          const latency = (Date.now() - start) / 2;
          const offset = data.serverTime - Date.now() + latency;
          setServerTimeOffset(offset);
          console.log(`[Time Sync] Server offset: ${offset}ms (latency: ${latency}ms)`);
        }
      } catch (err) {
        console.error("Failed to sync server time:", err);
      }
    };
    fetchServerTime();
  }, []);

  // Save battle data to localStorage
  useEffect(() => {
    if (isResetting.current) return;
    try {
      console.log('Saving battle data to localStorage:', battleData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(battleData));
    } catch (error) {
      console.error("Error saving battle data to localStorage:", error);
    }
  }, [battleData]);

  // Save user code to localStorage
  useEffect(() => {
    if (isResetting.current) return;
    try {
      localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(userCode));
    } catch (error) {
      console.error("Error saving user code to localStorage:", error);
    }
  }, [userCode]);

  // Memoize all functions to prevent recreating them on every render
  const updateBattleData = useCallback((data) => {
    setBattleData((prev) => {
      // If data is a function, call it with prev
      if (typeof data === "function") {
        return { ...prev, ...data(prev) };
      }
      return { ...prev, ...data };
    });
  }, []);

  const setProblems = useCallback((problems) => {
    setBattleData((prev) => ({ ...prev, problems }));
  }, []);

  const setCurrentProblem = useCallback((index) => {
    setBattleData((prev) => ({ ...prev, currentProblemIndex: index }));
  }, []);

  const saveUserCode = useCallback((problemId, language, code) => {
    setUserCode((prev) => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        [language]: code,
      },
    }));
  }, []);

  const getUserCode = useCallback(
    (problemId, language) => {
      return userCode[problemId]?.[language] || "";
    },
    [userCode]
  );

  const resetBattle = useCallback(() => {
    isResetting.current = true;

    setBattleData(defaultState);
    setUserCode({});

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CODE_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }

    setTimeout(() => {
      isResetting.current = false;
    }, 100);
  }, []);

  const value = {
    battleData,
    updateBattleData,
    setProblems,
    setCurrentProblem,
    resetBattle,
    saveUserCode,
    getUserCode,
    userCode,
    serverTimeOffset,
  };

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
};
