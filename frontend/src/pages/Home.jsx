import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Flame, Activity, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const navigate = useNavigate();
    const { user, progress, logout } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("Behavioral");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const categories = ["Behavioral", "Situational", "Technical"];

    // Redirect to login if not authenticated
    if (!user) {
        navigate("/login");
        return null;
    }

    const handleStartPractice = () => {
        navigate(`/question-select?category=${selectedCategory}`);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-12 py-8 flex items-center justify-between">
                <h1 className="text-[#0F172A] logo-font animate-gentle-bounce">PosiSense</h1>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-[#0F172A]">{user.name}</span>
                        <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-10">
                            <div className="px-4 py-3 border-b border-[#E2E8F0]">
                                <p className="text-[#0F172A]">{user.name}</p>
                                <p className="text-sm text-[#64748B]">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#F1F5F9] transition-colors text-[#EF4444]"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-12">
                <div className="w-full max-w-2xl">
                    {/* Greeting */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl text-[#0F172A] mb-2">
                            {getGreeting()}, {user.name.split(" ")[0]}! 👋
                        </h2>
                        <p className="text-[#64748B]">Ready to practice your interview skills?</p>
                    </div>

                    {/* Category Selection Card */}
                    <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                        <div className="text-center mb-8">
                            <p className="text-[#64748B] mb-4">Select an interview question category</p>
                        </div>

                        {/* Custom Dropdown */}
                        <div className="relative mb-8">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-6 py-5 flex items-center justify-between hover:border-[#0D9488] transition-colors"
                            >
                                <span className="text-[#0F172A] text-lg">{selectedCategory}</span>
                                <ChevronDown className={`w-5 h-5 text-[#64748B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-10">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full px-6 py-4 text-left hover:bg-[#F1F5F9] transition-colors ${selectedCategory === category ? 'bg-[#F0FDFA] text-[#0D9488]' : 'text-[#0F172A]'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Start Practice Button */}
                        <button
                            onClick={handleStartPractice}
                            className="w-full bg-[#0D9488] text-white rounded-xl px-8 py-5 hover:bg-[#0F766E] transition-colors shadow-[0_4px_16px_rgba(13,148,136,0.2)]"
                        >
                            Start Practice
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Stats Bar */}
            <footer className="px-12 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] px-8 py-6 flex items-center justify-center gap-12">
                        <div className="flex items-center gap-3">
                            <Flame className="w-5 h-5 text-[#F59E0B]" />
                            <div>
                                <p className="text-sm text-[#64748B]">Current Streak</p>
                                <p className="text-[#0F172A]">{progress.streak} {progress.streak === 1 ? 'day' : 'days'}</p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-[#E2E8F0]"></div>
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-[#0D9488]" />
                            <div>
                                <p className="text-sm text-[#64748B]">Total Sessions</p>
                                <p className="text-[#0F172A]">{progress.totalSessions} completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}