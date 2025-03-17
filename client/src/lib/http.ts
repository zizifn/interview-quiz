import { QueryClient } from "@tanstack/react-query";

async function getUser(): Promise<null | {
  id: number | undefined;
  email: string;
  username: string;
  is_employee: boolean;
}> {
  const url = `/api/auth/user`;
  const response = await fetch(url);

  if (response.status === 401) {
    return {
      id: undefined,
      email: "",
      username: "",
      is_employee: false,
    };
  }
  if (!response.ok) {
    const error = new Error(
      "An error occurred while get user, error code: " + response.status
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

async function login({ username, password }): Promise<any> {
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
      "An error occurred while get user, error code: " + response.status
    );
    throw error;
  }

  const data = await response.json();

  return data;
}

const queryClient = new QueryClient();

export { getUser, login, queryClient };
