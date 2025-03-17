import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "./lib/http";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "./components/LoadingSkeleton";
import NavBar from "./components/NavBar";
import LogIn from "./components/Login";

function App() {
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getUser,
  });

  return (
    <main className="bg-gray-100 h-full">
      <NavBar username="james"></NavBar>
      {isPending && <SkeletonCard></SkeletonCard>}
      {!data?.username && <LogIn></LogIn>}
      {data?.username && <p>login success!</p>}
    </main>
  );
}

export default App;
