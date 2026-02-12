import confetti from 'canvas-confetti';

export const triggerConfetti = (origin?: { x: number, y: number }, color?: string) => {
    confetti({
        particleCount: 100,
        spread: 360,
        startVelocity: 30,
        origin: origin || { x: 0.5, y: 0.5 },
        ...(color ? { colors: [color] } : {})
    });
};

export const triggerSideCannons = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#0F5132', '#4ade80', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};
