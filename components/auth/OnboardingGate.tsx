import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createClient } from '../../utils/supabase/client';
import { submitUserData } from '../../utils/submission';

type OnboardingGateProps = {
    onComplete: (role: string, level: string) => void;
};

export function OnboardingGate({ onComplete }: OnboardingGateProps) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    const [city, setCity] = useState('');
    const [role, setRole] = useState('software_engineer');
    const [experience, setExperience] = useState('mid');
    const [salaryStr, setSalaryStr] = useState('');
    const [rentStr, setRentStr] = useState('');
    const [isStudent, setIsStudent] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!user) {
            // If logged out, they don't need onboarding (they hit the Auth Gate instead)
            setNeedsOnboarding(false);
            setIsOnboardingChecked(true);
            return;
        }

        const checkStatus = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_submissions')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (data) {
                // They have already submitted
                setNeedsOnboarding(false);
            } else {
                // No submission found
                setNeedsOnboarding(true);
            }
            setIsOnboardingChecked(true);
        };

        checkStatus();
    }, [user, isAuthLoading]);

    if (!isOnboardingChecked || !needsOnboarding) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            if (isStudent) {
                // Escape Hatch: Insert dummy data so they are marked as complete
                const { error } = await submitUserData({
                    city_name: 'none',
                    role: 'none',
                    experience_level: 'none',
                    gross_salary: 0,
                    rent: 0
                });

                if (error) throw error;
                // Update global state to lock them into average view
                onComplete('average', 'average');
                setNeedsOnboarding(false);
            } else {
                // Standard Validation
                if (!city.trim()) throw new Error("Please enter your current city.");

                const gross_salary = parseFloat(salaryStr.replace(/,/g, '').replace(/\s/g, ''));
                if (isNaN(gross_salary) || gross_salary <= 0) throw new Error("Please enter a valid gross salary.");

                const rent = parseFloat(rentStr.replace(/,/g, '').replace(/\s/g, ''));
                if (isNaN(rent) || rent < 0) throw new Error("Please enter a valid monthly rent.");

                const { error } = await submitUserData({
                    city_name: city.trim(),
                    role: role,
                    experience_level: experience,
                    gross_salary,
                    rent
                });

                if (error) throw error;
                // Update global state to match their real data
                onComplete(role, experience);
                setNeedsOnboarding(false);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-xl transition-all duration-500 p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-white/[0.6] backdrop-blur-[16px] border border-white/80 shadow-[0_32px_64px_rgba(0,0,0,0.15)] p-8 md:p-10 relative overflow-hidden flex flex-col items-center">

                {/* Sleek Touch of Orange Glow */}
                <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-orange-500/10 blur-[64px] rounded-full pointer-events-none mix-blend-multiply" />
                <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/10 blur-[64px] rounded-full pointer-events-none mix-blend-multiply" />

                <div className="text-center space-y-3 mb-8 relative z-10 w-full">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-inner mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-500">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                        Unlock the Vault
                    </h2>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed px-4">
                        To see verified salaries, you must contribute yours. Your data is <span className="text-orange-600 font-bold">100% anonymous</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">

                    <div className={`space-y-5 transition-all duration-500 ${isStudent ? 'opacity-30 pointer-events-none grayscale max-h-0 overflow-hidden' : 'max-h-[500px] opacity-100'}`}>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Current City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. London, UK"
                                className="w-full bg-white/50 border border-white/60 rounded-none px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/70 focus:border-orange-400 transition-all placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-white/50 border border-white/60 rounded-none px-3 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/70 focus:border-orange-400 transition-all cursor-pointer appearance-none shadow-sm"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                                >
                                    <option value="software_engineer">Software Engineer</option>
                                    <option value="data_professional">Data Professional</option>
                                    <option value="product_manager">Product Manager</option>
                                    <option value="designer">Designer</option>
                                    <option value="devops">DevOps</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Focus</label>
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full bg-white/50 border border-white/60 rounded-none px-3 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/70 focus:border-orange-400 transition-all cursor-pointer appearance-none shadow-sm"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                                >
                                    <option value="junior">Junior (0-2y)</option>
                                    <option value="mid">Mid-Level (3-5y)</option>
                                    <option value="senior">Senior (6+y)</option>
                                    <option value="lead">Lead/Staff (8+y)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Gross Salary (€)</label>
                                <input
                                    type="text"
                                    value={salaryStr}
                                    onChange={(e) => setSalaryStr(e.target.value)}
                                    placeholder="85,000"
                                    className="w-full bg-white/50 border border-white/60 rounded-none px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/70 focus:border-orange-400 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Monthly Rent (€)</label>
                                <input
                                    type="text"
                                    value={rentStr}
                                    onChange={(e) => setRentStr(e.target.value)}
                                    placeholder="1,200"
                                    className="w-full bg-white/50 border border-white/60 rounded-none px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/70 focus:border-orange-400 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-300/30">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isStudent}
                                    onChange={(e) => setIsStudent(e.target.checked)}
                                />
                                <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-all ${isStudent ? 'bg-orange-500 border-orange-500' : 'bg-white/50 border-slate-400 group-hover:border-slate-600'}`}>
                                    {isStudent && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-700 select-none group-hover:text-slate-900 transition-colors">
                                I am a student / seeking roles in tech
                            </span>
                        </label>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full relative flex items-center justify-center gap-2 text-white border border-orange-400/50 shadow-lg px-4 py-4 text-xs font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-75 disabled:cursor-wait mt-6 ${isStudent ? 'bg-slate-800 hover:bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600'}`}
                    >
                        {isStudent ? 'Continue as Guest' : 'Submit My Data'}
                    </button>

                </form>
            </div>
        </div>
    );
}
