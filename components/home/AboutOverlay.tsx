export function AboutOverlay({ isOpen, onClose, onOpenMethodology }: { isOpen: boolean; onClose: () => void; onOpenMethodology: () => void }) {
    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col bg-white/40 backdrop-blur-2xl overflow-y-auto transition-all duration-500 ease-in-out selection:bg-orange-500/30 selection:text-slate-900 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
        >
            <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
                <div className="w-full max-w-lg py-8">
                    {/* Back Link - Styled as a subtle text link above the card */}
                    <button
                        onClick={onClose}
                        className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
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
                        BACK TO MAP
                    </button>

                    {/* The Lifted Acrylic Card UI */}
                    <div className="bg-white/[0.25] backdrop-blur-[12px] border text-slate-900 border-white/60 shadow-[0_32px_64px_rgba(0,0,0,0.15)] rounded-none p-6 md:p-8 space-y-8 relative overflow-hidden">

                        {/* Sleek Touch of Orange Glow */}
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-500/15 blur-[64px] rounded-full pointer-events-none mix-blend-multiply" />

                        <div className="space-y-3 relative z-10">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                                Expanding Your Possibilities
                            </h1>
                        </div>

                        <section className="space-y-3 relative z-10">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 drop-shadow-sm">The Mission</h2>
                            <p className="text-sm leading-relaxed text-slate-700">
                                I built <span className="text-slate-900 font-semibold">kept.</span> to empower people to understand their options and gain financial freedom through geographic mobility. Currently, Kept focuses on the tech industry, helping you visualize your salary and understand what relocating to a new city could mean for your life design.
                            </p>
                        </section>

                        <section className="space-y-3 relative z-10">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 drop-shadow-sm">What's Next</h2>
                            <p className="text-sm leading-relaxed text-slate-700">
                                I am currently working on integrating real datasets and APIs to pull live data. Soon more.
                            </p>
                        </section>

                        {/* Transparent Data Disclaimer trigger */}
                        <section className="pt-8 border-t border-slate-300/50 relative z-10 flex flex-col items-start gap-4">
                            <div>
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Radical Transparency</h2>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    We believe in open data. Read exactly how we calculate your European tech savings, our LLM baseline approximations, and how the Bayesian Flywheel corrects them.
                                </p>
                            </div>
                            <button
                                onClick={onOpenMethodology}
                                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none"
                            >
                                Read Open Data Methodology
                            </button>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
