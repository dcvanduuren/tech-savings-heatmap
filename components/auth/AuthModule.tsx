import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchUserSubmission, UserSubmissionData } from '../../utils/submission';

export function AuthModule({ onResubmitClick }: { onResubmitClick: () => void }) {
    const { user, isLoading, signInWithEmail, signUpWithEmail, signOut, signInWithGoogle } = useAuth();
    const [isEmailExpanded, setIsEmailExpanded] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Active Profile State
    const [profileData, setProfileData] = useState<UserSubmissionData | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Fetch the active profile when user logs in
    useEffect(() => {
        if (!user) {
            setProfileData(null);
            return;
        }

        const loadProfile = async () => {
            setIsProfileLoading(true);
            const { data } = await fetchUserSubmission(user.id);
            if (data && data.city_name !== 'none') {
                setProfileData(data);
            } else {
                setProfileData(null); // Either no data or guest escape hatch
            }
            setIsProfileLoading(false);
        };

        loadProfile();
        // Intentionally omit onResubmitClick to avoid looping, but we can hook into an event if we want auto-refresh
    }, [user, isEmailExpanded]);

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

                {/* Header Sequence */}
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

                {/* Profile Matrix UI */}
                {isProfileLoading ? (
                    <div className="space-y-2 mt-2 relative z-10 animate-pulse">
                        <div className="h-6 w-1/2 bg-white/40 rounded-sm"></div>
                        <div className="h-10 w-full bg-white/30 rounded-sm"></div>
                    </div>
                ) : profileData ? (
                    <div className="bg-white/40 border border-white/50 rounded-none p-4 mt-2 relative z-10 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-orange-600">Your Base Reality</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex flex-col">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Location</span>
                                <span className="font-mono text-xs font-bold text-slate-800 truncate" title={profileData.city_name}>{profileData.city_name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Role Matrix</span>
                                <span className="font-mono text-xs font-bold text-slate-800 capitalize truncate">{profileData.experience_level} {profileData.role.replace('_', ' ')}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Market Rate</span>
                                <span className="font-mono text-sm font-bold text-slate-900 drop-shadow-sm truncate">€{Number(profileData.gross_salary).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">1BR Area Rent</span>
                                <span className="font-mono text-sm font-bold text-slate-900 drop-shadow-sm truncate">€{Number(profileData.rent).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/40 border border-white/50 border-dashed rounded-none p-4 mt-2 relative z-10 text-center">
                        <span className="font-sans text-[10px] text-slate-500 font-medium">Your Vault Profile is currently empty.</span>
                    </div>
                )}

                <button
                    className="w-full relative z-10 flex items-center justify-center gap-2 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border border-orange-400/50 shadow-lg px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 mt-1"
                    onClick={() => {
                        // Immediately wipe state here so the next form loads totally clean if desired, or let it ride.
                        onResubmitClick();
                    }}
                >
                    {profileData ? 'Update My Reality' : 'Submit Real Data'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5 rounded-none flex flex-col gap-5">
            {/* The First Impression Hook */}
            <div className="space-y-2">
                <h1 className="font-sans text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug drop-shadow-sm">
                    See how much you keep.
                </h1>
                <p className="text-sm font-medium text-slate-700 leading-relaxed font-sans max-w-[280px]">
                    Compare tech salaries and true cost of living across Europe.
                </p>
            </div>

            {/* frictionless OAuth Loop */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={() => signInWithGoogle()}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                    Continue with Google
                </button>

                <button
                    onClick={() => setIsEmailExpanded(!isEmailExpanded)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 shadow-sm px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                    Continue with Email
                </button>
            </div>

            {/* Accordion for Email Sign In/Up */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isEmailExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/60 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-slate-500 transition-all placeholder:text-slate-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/60 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-slate-500 transition-all placeholder:text-slate-400"
                    />
                    {errorMsg && (
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">{errorMsg}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAuth(false)}
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-900 hover:bg-black text-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => handleAuth(true)}
                            disabled={isSubmitting}
                            className="flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Proof Footer */}
            <div className="pt-4 mt-1 border-t border-slate-200 max-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {/* Abstract anonymous avatars */}
                        <div className="h-6 w-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center overflow-hidden"><div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400" /></div>
                        <div className="h-6 w-6 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center overflow-hidden"><div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400" /></div>
                        <div className="h-6 w-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center overflow-hidden"><div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" /></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Join <span className="font-bold text-slate-800">4,200+</span> tech professionals anonymously mapping their reality in Europe.
                    </p>
                </div>
            </div>
        </div>
    );
}
