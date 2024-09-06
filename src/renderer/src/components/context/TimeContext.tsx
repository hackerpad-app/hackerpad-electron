import React, { createContext, useState, useContext, ReactNode } from "react";

interface TimerContextType {
  time: { minutes: number; seconds: number };
  setTime: React.Dispatch<
    React.SetStateAction<{ minutes: number; seconds: number }>
  >;
  sessionActive: boolean;
  setSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: string[];
  setTasks: React.Dispatch<React.SetStateAction<string[]>>;
  sessionInProgress: boolean;
  setSessionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [time, setTime] = useState({ minutes: 50, seconds: 0 });
  const [tasks, setTasks] = useState<string[]>([]);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionInProgress, setSessionInProgress] = useState(false);

  return (
    <TimerContext.Provider
      value={{
        time,
        setTime,
        sessionActive,
        setSessionActive,
        sessionInProgress,
        setSessionInProgress,
        tasks,
        setTasks,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
