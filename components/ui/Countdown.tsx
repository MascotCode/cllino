import { useEffect, useState } from 'react';
import Badge from './Badge';

interface CountdownProps {
    initialSeconds: number;
    onComplete?: () => void;
    testID?: string;
    className?: string;
}

export default function Countdown({
    initialSeconds,
    onComplete,
    testID,
    className = ''
}: CountdownProps) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (seconds <= 0) {
            onComplete?.();
            return;
        }

        const interval = setInterval(() => {
            setSeconds(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                    onComplete?.();
                }
                return Math.max(0, newValue);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds, onComplete]);

    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60);
        const remainingSeconds = secs % 60;
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${secs}s`;
    };

    const variant = seconds < 20 ? 'warn' : 'info';

    return (
        <Badge
            variant={variant}
            testID={testID}
            className={className}
        >
            {seconds > 0 ? formatTime(seconds) : 'Expired'}
        </Badge>
    );
}


