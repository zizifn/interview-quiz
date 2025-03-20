import { Disclosure } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { signOut, queryClient } from "@/lib/http";
import { useContext } from "react";
import { UserModeState } from "@/store/UserModeProvider";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar({
  username,
  isEmployee,
}: {
  username: string;
  isEmployee: boolean;
}) {
  const { userMode, setUserMode } = useContext(UserModeState);

  const { mutate } = useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueriesData(
        {
          queryKey: ["auth", "user"],
        },
        () => {
          return {};
        },
      );
      queryClient.clear();
    },
  });
  const navigation = [];
  if (userMode === "guest") {
    navigation.push({ name: "Employee View", href: "#", current: false });
  } else {
    navigation.push({ name: "Guest View", href: "#", current: false });
  }

  function switchMode() {
    if (userMode === "guest") {
      setUserMode("employee");
    } else {
      setUserMode("guest");
    }
    mutate();
  }

  function onSignout() {
    mutate();
  }
  return (
    <Disclosure as="nav" className="bg-white">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-1">
          <div className="flex flex-1 items-stretch justify-start">
            <div className="flex shrink-0 items-center bg-white">
              <img
                alt="Your Company"
                src="https://www.hilton.com/modules/assets/svgs/logos/WW.svg"
                className="h-8 w-auto"
              />
            </div>
            <div className="ml-auto block">
              <div className="flex space-x-4">
                {!isEmployee &&
                  navigation.map((item) => (
                    <a
                      key={item.name}
                      onClick={switchMode}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium",
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
              </div>
            </div>
          </div>
          {username && (
            <>
              <div className="static inset-auto inset-y-0 right-0 ml-6 flex w-20 items-center pr-0 text-wrap">
                {/* Profile dropdown */}
                {username || ""} {isEmployee ? " (Employee)" : " (Guest)"}
              </div>
              <button
                onClick={onSignout}
                type="button"
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </Disclosure>
  );
}
