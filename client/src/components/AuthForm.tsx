import React from "react";
import { useMutation } from "@tanstack/react-query";
import { login, queryClient, signUp } from "@/lib/http";
import { SignUpSuccessDialog } from "./SignUpSuccessDialog";

export default function AuthForm() {
  const [isLogin, setIsLogin] = React.useState(true);
  const { isPending, error, mutate } = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (params: { username: string; password: string }) =>
      login(params.username, params.password),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(["auth", "user"], {
        ...variables,
      });
      queryClient.invalidateQueries({
        queryKey: ["auth", "user"],
      });
    },
  });
  const {
    isPending: signUpPending,
    error: signUpError,
    mutate: signUpMutate,
    isSuccess: signUpSuccess,
  } = useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: signUp,
    onSuccess: () => {
      setIsLogin(true);
    },
  });
  function sumbitClick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    if (isLogin) {
      mutate({
        username: username,
        password: password,
      });
    } else {
      const email = formData.get("email") as string;
      signUpMutate({
        username: username,
        password: password,
        email,
      });
      e.currentTarget.reset();
    }
  }

  return (
    <>
      {signUpSuccess && <SignUpSuccessDialog></SignUpSuccessDialog>}
      <div
        data-testid="auth-form"
        className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://www.hilton.com/modules/assets/svgs/logos/WW.svg"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={sumbitClick} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-left text-sm/6 font-medium text-gray-900"
              >
                User Name
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-left text-sm/6 font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-left text-sm/6 font-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {error && (
              <p className="text-base/6 font-bold text-red-600">
                Unable login, please check username or password!
              </p>
            )}
            {signUpError && (
              <p className="text-base/6 font-bold text-red-600">
                {signUpError.message}
              </p>
            )}

            <div>
              {isLogin && (
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {isPending ? "Signing" : "Sign in"}
                </button>
              )}
              {!isLogin && (
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {signUpPending ? "Signing" : "Sign up"}
                </button>
              )}
            </div>
          </form>

          {isLogin && (
            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Not a member?{" "}
              <a
                onClick={() => setIsLogin(false)}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                SignUp
              </a>
            </p>
          )}
          {!isLogin && (
            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Already a member?{" "}
              <a
                onClick={() => setIsLogin(true)}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                SignIn
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
