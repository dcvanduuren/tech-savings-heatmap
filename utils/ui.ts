export const ui = {
    // Structural Panels
    glassPanelHeavy: "bg-white/[0.85] backdrop-blur-[16px] border border-white/60 shadow-[0_32px_64px_rgba(0,0,0,0.15)]",
    glassPanelCard: "bg-white/20 backdrop-blur-[12px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
    glassPanelLight: "bg-white/10 backdrop-blur-md border border-white/40 shadow-sm",

    // Interactive Fields
    glassInput: "bg-white/40 border border-white/50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white/60 focus:border-orange-400 transition-all",

    // Typography
    label: "text-[10px] font-bold uppercase tracking-widest text-slate-500",
    labelAccent: "text-[10px] font-bold uppercase tracking-widest text-orange-500 drop-shadow-sm",

    // Z-Index Standard
    z: {
        map: "z-0",
        markers: "z-10",
        overlays: "z-20",
        modals: "z-50"
    }
};
