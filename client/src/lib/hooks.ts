import { useQuery } from "@tanstack/react-query";
import { getUser,getRestaurants } from "./http";
import { useState } from "react";

function useUser() {
    return useQuery({
        queryKey: ["auth", "user"],
        queryFn: getUser,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}

function useRestaurants(usrename: string){
    return useQuery({
        queryKey: ["restaurants"],
        queryFn: getRestaurants,
        staleTime: 1000 * 60 * 5,
        enabled: !!usrename
    });
}

export { useUser, useRestaurants };