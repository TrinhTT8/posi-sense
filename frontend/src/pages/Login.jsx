import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        const success = await login(formData.email, formData.password, isSignUp ? formData.name : undefined);

        setIsLoading(false);

        if (success) {
            navigate("/");
        } else {
            setError("Authentication failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-12 relative overflow-hidden">
            {/* Animated Wavelength Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#0D9488', stopOpacity: 0.1 }} />
                            <stop offset="100%" style={{ stopColor: '#0D9488', stopOpacity: 0.05 }} />
                        </linearGradient>
                        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#14B8A6', stopOpacity: 0.08 }} />
                            <stop offset="100%" style={{ stopColor: '#14B8A6', stopOpacity: 0.03 }} />
                        </linearGradient>
                        <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#0F766E', stopOpacity: 0.06 }} />
                            <stop offset="100%" style={{ stopColor: '#0F766E', stopOpacity: 0.02 }} />
                        </linearGradient>
                    </defs>

                    {/* Wave 1 */}
                    <path
                        fill="url(#waveGradient1)"
                        d="M0,100 C300,150 600,50 900,100 C1050,125 1150,100 1200,100 L1200,300 L0,300 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="3s"
                            repeatCount="indefinite"
                            values="
                            M0,100 C300,150 600,50 900,100 C1050,125 1150,100 1200,100 L1200,300 L0,300 Z;
                            M0,100 C300,50 600,150 900,100 C1050,75 1150,100 1200,100 L1200,300 L0,300 Z;
                            M0,100 C300,150 600,50 900,100 C1050,125 1150,100 1200,100 L1200,300 L0,300 Z"
                        />
                    </path>

                    {/* Wave 2 */}
                    <path
                        fill="url(#waveGradient2)"
                        d="M0,120 C250,170 550,70 850,120 C1000,145 1100,120 1200,120 L1200,300 L0,300 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="10s"
                            repeatCount="indefinite"
                            values="
                            M0,120 C250,170 550,70 850,120 C1000,145 1100,120 1200,120 L1200,300 L0,300 Z;
                            M0,120 C250,70 550,170 850,120 C1000,95 1100,120 1200,120 L1200,300 L0,300 Z;
                            M0,120 C250,170 550,70 850,120 C1000,145 1100,120 1200,120 L1200,300 L0,300 Z"
                        />
                    </path>

                    {/* Wave 3 */}
                    <path
                        fill="url(#waveGradient3)"
                        d="M0,140 C200,190 500,90 800,140 C950,165 1050,140 1200,140 L1200,300 L0,300 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="12s"
                            repeatCount="indefinite"
                            values="
                            M0,140 C200,190 500,90 800,140 C950,165 1050,140 1200,140 L1200,300 L0,300 Z;
                            M0,140 C200,90 500,190 800,140 C950,115 1050,140 1200,140 L1200,300 L0,300 Z;
                            M0,140 C200,190 500,90 800,140 C950,165 1050,140 1200,140 L1200,300 L0,300 Z"
                        />
                    </path>
                </svg>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-12">
                    <h1 className="text-[#0F172A] mb-2 logo-font">PosiSense</h1>
                    <p className="text-[#64748B]">Master your interview presence</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                    <div className="mb-8">
                        <h2 className="text-[#0F172A] mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
                        <p className="text-[#64748B]">
                            {isSignUp ? "Start your interview coaching journey" : "Sign in to continue your practice"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field (Sign Up Only) */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-[#0F172A] mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required={isSignUp}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#0D9488] focus:outline-none transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-[#0F172A] mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#0D9488] focus:outline-none transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-[#0F172A] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-4 py-3 pr-12 text-[#0F172A] focus:border-[#0D9488] focus:outline-none transition-colors"
                                    placeholder="At least 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-[#FEE2E2] border-l-4 border-[#EF4444] rounded-lg p-4">
                                <p className="text-[#DC2626] text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full rounded-xl px-8 py-4 transition-all ${isLoading
                                    ? "bg-[#94A3B8] text-white cursor-not-allowed"
                                    : "bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-[0_4px_16px_rgba(13,148,136,0.2)]"
                                }`}
                        >
                            {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                        </button>
                    </form>

                    {/* Toggle Sign Up/Login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError("");
                            }}
                            className="text-[#0D9488] hover:text-[#0F766E] transition-colors"
                        >
                            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}