import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function AuthModule() {
    const { user, isLoading, signInWithEmail, signUpWithEmail, signOut } = useAuth();
    const [isEmailExpanded, setIsEmailExpanded] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/40 shadow-sm p-5 rounded-none animate-pulse">
                <div className="h-4 bg-white/40 w-1/2 mb-2"></div>
                <div className="h-3 bg-white/30 w-3/4"></div>
            </div>
        );
    }

    const handleAuth = async (isSignUp: boolean) => {
        setErrorMsg('');
        setIsSubmitting(true);
        let result;
        if (isSignUp) {
            result = await signUpWithEmail(email, password);
        } else {
            result = await signInWithEmail(email, password);
        }

        if (result.error) {
            setErrorMsg(result.error.message);
        } else if (isSignUp) {
            setErrorMsg('Check your email for the confirmation link.');
        }
        setIsSubmitting(false);
    };

    if (user) {
        return (
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-[12px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-5 rounded-none flex flex-col gap-4 relative overflow-hidden">
                {/* Sleek Touch of Orange Glow */}
                <div className="absolute top-[-50%] right-[-20%] w-32 h-32 bg-orange-500/10 blur-[32px] rounded-full pointer-events-none mix-blend-multiply" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                        <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            Active Session
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-800 truncate max-w-[150px]" title={user.email}>
                            {user.email}
                        </span>
                    </div>
                    <button
                        onClick={signOut}
                        className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                <button
                    className="w-full relative z-10 flex items-center justify-center gap-2 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border border-orange-400/50 shadow-lg px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    onClick={() => alert("Submit module coming soon!")}
                >
                    Submit Real Data
                </button>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5 rounded-none flex flex-col gap-4">
            <div className="space-y-2">
                <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-500">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    Unlock Full Access
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Create a free account to unlock role-specific tax math, advanced filters, and community data.
                </p>
            </div>

            <button
                onClick={() => setIsEmailExpanded(!isEmailExpanded)}
                className="w-full bg-white/50 border border-white/60 hover:bg-white/70 text-slate-800 shadow-sm px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
                Continue with Email
            </button>

            {/* Accordion for Email Sign In/Up */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isEmailExpanded ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/40 border border-white/50 rounded-none px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-slate-400 transition-all placeholder:text-slate-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/40 border border-white/50 rounded-none px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-slate-400 transition-all placeholder:text-slate-500"
                    />
                    {errorMsg && (
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">{errorMsg}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAuth(false)}
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 shadow-sm px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleAuth(true)}
                            disabled={isSubmitting}
                            className="flex-1 bg-white/50 border border-white/60 hover:bg-white/70 text-slate-800 shadow-sm px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
