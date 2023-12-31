import { useState, useRef } from 'react';
import useUnMount from '../useUnMount';
import usePersistFn from '../usePersistFn';

const useCountDown = (time = 60) => {
  const [isCountDowning, setCountDowning] = useState(false);
  const [remaining, setRemaining] = useState(time);
  const timer = useRef<number>();

  const start = usePersistFn(() => {
    clearTimeout(timer.current);
    setRemaining(time - 1);
    setCountDowning(true);
    const run = () => {
      timer.current = window.setTimeout(() => {
        setRemaining((r) => {
          if (r - 1 > 0) {
            run();
          } else {
            setCountDowning(false);
          }
          return r - 1;
        });
      }, 1000);
    };
    run();
  });

  useUnMount(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  });

  return [{ isCountDowning, remaining }, { start }] as const;
};

export default useCountDown;
