import React, { useEffect, useRef, useState } from 'react';

interface TimerProps {
  startTime: number; // ms timestamp
  endTime?: number; // ms timestamp
  onStop?: (elapsed: number) => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
}

const Timer: React.FC<TimerProps> = ({ startTime, endTime, onStop }) => {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (endTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (onStop) onStop(endTime - startTime);
      return;
    }
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endTime, startTime, onStop]);

  const elapsed = (endTime || now) - startTime;
  return <span className="font-mono text-xl font-bold text-red-600 ml-2">{formatDuration(Math.max(0, elapsed))}</span>;
};

export default Timer;
