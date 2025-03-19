import { QueryClient } from "@tanstack/react-query";
/* eslint-disable @typescript-eslint/no-explicit-any */
type User = {
  id: number;
  email: string;
  username: string;
  is_employee: boolean;
};

async function getUser(): Promise<null | User> {
  const url = `/api/auth/user`;
  const response = await fetch(url);

  if (response.status === 401) {
    return {
      id: 0,
      email: "",
      username: "",
      is_employee: false,
    };
  }
  if (!response.ok) {
    const error = new Error(
      "An error occurred while get user, error code: " + response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

async function login(username: string, password: string): Promise<any> {
  const url = `/api/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: username,
      password: password,
    }),
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while get user, error code: " + response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

async function signUp({
  username,
  password,
  email,
}: {
  username: string;
  password: string;
  email: string;
}): Promise<any> {
  const url = `/api/auth/signup`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: username,
      password: password,
      email: email,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    const error = new Error(data.error || "An error occurred while sign up");
    throw error;
  }

  const data = await response.json();

  return data;
}

async function signOut(): Promise<any> {
  const url = `/api/auth/signout`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "signout",
    }),
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while signout, error code: " + response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

type Reservation = {
  id: string;
  guestName: string;
  guestEmail: string;
  reservationDateTime: number;
  restaurantInfo: {
    id: string;
    name: string;
  };
  specialRequests: string;
  status: string;
  tableInfo: {
    id: string;
    size: number;
  };
};
async function getReservation(): Promise<Reservation[]> {
  const url = `/api/reservation`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(
      "An error occurred while get reservation, error code: " + response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

async function getRestaurants(): Promise<
  {
    id: string;
    name: string;
    phone: string;
    tables: {
      id: string;
      size: number;
      capacity: number;
    }[];
  }[]
> {
  const url = `/api/restaurants`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(
      "An error occurred while get restaurants, error code: " + response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

type NewReservation = {
  restaurantInfo: {
    id: string;
  };
  reservationDateTime: number;
  tableInfo: {
    id: string;
  };
  specialRequests: string;
};

async function createReservation(newReservation: NewReservation): Promise<any> {
  const url = `/api/reservation`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newReservation),
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while create reservation, please try again. Error code: " +
        response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

type UpdateReservation = {
  guestEmail: string;
  tableInfo: {
    id: string;
  };
  reservationDateTime: number;
  specialRequests: string;
};

async function updateReservation(
  id: string,
  updateReservation: UpdateReservation,
): Promise<any> {
  const url = `/api/reservation/${id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateReservation),
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while update reservation, please try again. Error code: " +
        response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

type ReservationStatus = "confirmed" | "canceled" | "completed";
async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<any> {
  const url = `/api/reservation/${id}/status`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!response.ok) {
    const error = new Error(
      "An error occurred while update reservation status, please try again. Error code: " +
        response.status,
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

const queryClient = new QueryClient();

export {
  getUser,
  login,
  signOut,
  signUp,
  getReservation,
  getRestaurants,
  updateReservationStatus,
  createReservation,
  updateReservation,
  queryClient,
};
export type {
  NewReservation,
  Reservation,
  UpdateReservation,
  User,
  ReservationStatus,
};
