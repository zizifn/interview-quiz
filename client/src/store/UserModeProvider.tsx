import { createContext, useState } from "react";

type UserMode = "guest" | "employee";

export const UserModeState = createContext<{
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
}>({
  userMode: "guest",
  setUserMode: () => {},
});

export function UserModeStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userMode, setUserMode] = useState<UserMode>("guest");
  const ctxValue = {
    userMode,
    setUserMode,
  };
  return (
    <UserModeState.Provider value={ctxValue}>{children}</UserModeState.Provider>
  );
}

export const UserModeProvider = UserModeState.Provider;
