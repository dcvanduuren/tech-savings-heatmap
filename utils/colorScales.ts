// --- COLOR: FinTech Scale ---
export function getDynamicColors(savings: number, minSavings: number, maxSavings: number, visibleCount: number) {
    const range = maxSavings - minSavings;
    let ratio = 0.5;

    if (range > 0) {
        ratio = Math.max(0, Math.min(1, (savings - minSavings) / range));
    } else if (visibleCount === 1) {
        ratio = 1;
    }

    const hue = 25; // Orange base

    // Smoothly transition from a dark muted shade to fiery bright orange.
    const sat = Math.round(10 + (ratio * (95 - 10)));
    const lit = Math.round(35 + (ratio * (53 - 35)));

    // Glow must always be a bright fiery orange, decoupled from the core's darkness
    const glowSat = 95;
    const glowLit = 55;

    // Exponential opacity scale (squared instead of cubed) to allow a few 
    // more middle-tier cities a visible glow, while still flooring the worst cities.
    const glowOpacity = (Math.pow(ratio, 2) * 0.5).toFixed(3);

    // Scale the geometric spread of the glow
    const glowRadius = Math.round(20 + (ratio * 60)); // Ranges from 20% to 80%

    // Scale the overall transform multiplier for the element
    const glowMultiplier = 0.5 + (ratio * 1.25); // Ranges from 0.5x to 1.75x

    return {
        core: `hsl(${hue}, ${sat}%, ${lit}%)`,
        glow: `radial-gradient(circle, hsla(${hue}, ${glowSat}%, ${glowLit}%, ${glowOpacity}) 0%, hsla(${hue}, ${glowSat}%, ${glowLit}%, 0) ${glowRadius}%)`,
        glowMultiplier
    };
}
