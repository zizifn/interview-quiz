import "./App.css";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "./lib/http";
import { SkeletonCard } from "./components/LoadingSkeleton";
import NavBar from "./components/NavBar";
import AuthForm from "./components/AuthForm";
import { GuestView } from "./components/GuestView";
import { useRestaurants, useUser } from "./lib/hooks";
import { EmployeeView } from "./components/EmployeeView";

function App() {
  const { data, isPending } = useUser();

  return (
    <main className="bg-gray-100 h-full">
      {data?.username &&  <NavBar username={data.username} isEmployee = {data.is_employee}></NavBar>}
      {isPending && <SkeletonCard></SkeletonCard>}
      {!data?.username && <AuthForm></AuthForm>}
      {data?.username && !data?.is_employee && <GuestView></GuestView>}
      {data?.username && data?.is_employee && <EmployeeView></EmployeeView>}
    </main>
  );
}

export default App;
