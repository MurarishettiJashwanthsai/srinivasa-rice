import { useState, useEffect, useRef, useCallback } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter = ({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    className = '',
    decimals = 0,
}) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef(null);

    const animateCount = useCallback(() => {
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const currentValue = easedProgress * end;

            setCount(decimals > 0 ? parseFloat(currentValue.toFixed(decimals)) : Math.floor(currentValue));

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(tick);
    }, [duration, end, decimals]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateCount();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasAnimated, animateCount]);

    const formatted = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();

    return (
        <span ref={ref} className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
};

export default AnimatedCounter;
