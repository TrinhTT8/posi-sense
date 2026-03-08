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

  // Login with backend
  const login = async (email, password, name) => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: name, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("posisense_user", JSON.stringify(data.user));
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  // Register with backend
  const register = async (username, email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        return true;
      } else {
        return data.error || "Registration failed.";
      }
    } catch (err) {
      return "Network error.";
    }
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
    <AuthContext.Provider value={{ user, progress, login, logout, register, saveSession }}>
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
