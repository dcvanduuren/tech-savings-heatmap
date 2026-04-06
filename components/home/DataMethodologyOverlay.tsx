import React from 'react';

export function DataMethodologyOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-[12px] overflow-y-auto transition-all duration-500 ease-in-out selection:bg-orange-500/30 selection:text-white ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
        >
            <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
                <div className="w-full max-w-2xl py-8">
                    {/* Back Link */}
                    <button
                        onClick={onClose}
                        className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors mb-4 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        BACK TO APP
                    </button>

                    {/* The Lifted Card UI */}
                    <div className="bg-white border text-slate-900 border-white/60 shadow-2xl rounded-none p-6 md:p-8 space-y-8 relative overflow-hidden">

                        <div className="space-y-3 relative z-10">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                                Open Data Methodology
                            </h1>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed font-sans max-w-[500px]">
                                Radical transparency isn't just a buzzword. It's the only way to build a tool people can actually trust. Here is exactly how we calculate your European tech savings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <section className="space-y-3">
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 drop-shadow-sm">The Baseline Data</h2>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    Our V1 baseline numbers were synthesized using advanced LLM models to establish the initial European grid. They evaluate thousands of public data points for standard tech roles, minus estimated local taxes and average center-city 1-bedroom apartment rents.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 drop-shadow-sm">The Bayesian Flywheel</h2>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    When you securely connect your "Vault Profile," you contribute real ground-truth data. Our active <strong>Bayesian Blending Engine</strong> takes your submitted local rent and salary and carefully blends it into the city's average using a Gaussian Confidence Decay algorithm. The more real users submit data, the more accurate the map becomes for everyone.
                                </p>
                            </section>
                        </div>

                        <section className="pt-6 border-t border-slate-200 relative z-10 space-y-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contribute & Correct</h2>
                            <p className="text-sm leading-relaxed text-slate-700">
                                See a number that looks completely wrong? Don't just complain—help us fix it. The easiest way is to log in and submit your real data.
                            </p>

                            <a href="#" className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all focus:outline-none w-full sm:w-auto mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-500">
                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.04-12.72c-1.4 0-2.54 1.14-2.54 2.54 0 1.4 1.14 2.54 2.54 2.54 1.4 0 2.54-1.14 2.54-2.54 0-1.4-1.14-2.54-2.54-2.54zm-2.82 2.54c0-1.74 1.42-3.16 3.16-3.16 1.74 0 3.16 1.42 3.16 3.16 0 1.74-1.42 3.16-3.16 3.16-1.74 0-3.16-1.42-3.16-3.16zM12 6.54c-1.08 0-1.96.88-1.96 1.96s.88 1.96 1.96 1.96 1.96-.88 1.96-1.96-.88-1.96-1.96-1.96z" />
                                </svg>
                                Join the Discussion on r/kept Europe
                            </a>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
