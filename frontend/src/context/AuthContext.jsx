import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({
    streak: 0,
    totalSessions: 0,
    lastSessionDate: "",
    sessionHistory: [],
  });

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("posisense_user");
    const storedProgress = localStorage.getItem("posisense_progress");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, []);

  const login = async (email, password, name) => {
    // Mock authentication - in real app, this would call an API
    if (password.length >= 6) {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || email.split("@")[0],
        email,
      };
      
      setUser(newUser);
      localStorage.setItem("posisense_user", JSON.stringify(newUser));
      
      // Load or create progress for this user
      const userProgressKey = `posisense_progress_${newUser.id}`;
      const existingProgress = localStorage.getItem(userProgressKey);
      
      if (existingProgress) {
        const loadedProgress = JSON.parse(existingProgress);
        setProgress(loadedProgress);
        localStorage.setItem("posisense_progress", JSON.stringify(loadedProgress));
      } else {
        const newProgress = {
          streak: 0,
          totalSessions: 0,
          lastSessionDate: "",
          sessionHistory: [],
        };
        setProgress(newProgress);
        localStorage.setItem(userProgressKey, JSON.stringify(newProgress));
        localStorage.setItem("posisense_progress", JSON.stringify(newProgress));
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("posisense_user");
    localStorage.removeItem("posisense_progress");
  };

  const saveSession = (session) => {
    if (!user) return;
    
    const today = new Date().toISOString().split("T")[0];
    const lastDate = progress.lastSessionDate;
    
    // Calculate streak
    let newStreak = progress.streak;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1; // Continue streak
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
      // If same day, keep current streak
    } else {
      newStreak = 1; // First session
    }
    
    const updatedProgress = {
      ...progress,
      streak: newStreak,
      totalSessions: progress.totalSessions + 1,
      lastSessionDate: today,
      sessionHistory: [session, ...progress.sessionHistory],
    };
    
    setProgress(updatedProgress);
    
    const userProgressKey = `posisense_progress_${user.id}`;
    localStorage.setItem(userProgressKey, JSON.stringify(updatedProgress));
    localStorage.setItem("posisense_progress", JSON.stringify(updatedProgress));
  };

  return (
    <AuthContext.Provider value={{ user, progress, login, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}