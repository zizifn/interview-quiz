import { getReservation } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "./ui/alert";
import { EditReservation } from "./EditReservation";
import { CancelReservation } from "./CancelReservation";

function ReservationList({ isEmployee }: { isEmployee: boolean }) {
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: ["reservations"],
    queryFn: getReservation,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isPending) {
    return (
      <Alert>
        <AlertDescription>loading reservation data</AlertDescription>
      </Alert>
    );
  }
  if (error) {
    return (
      <Alert>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  if (isSuccess && data?.length === 0) {
    return (
      <Alert>
        <AlertDescription>No reservation data</AlertDescription>
      </Alert>
    );
  }
  if (isSuccess) {
    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-3">Actions</th>
                <th className="border-b p-3">Name</th>
                <th className="border-b p-3">Contact Info</th>
                <th className="border-b p-3">Arrival time</th>
                <th className="border-b p-3">Table size</th>
                <th className="border-b p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((reservation) => {
                const status = reservation.status || "confirmed";
                return (
                  <tr
                    key={reservation.id}
                    className="border-b text-left hover:bg-gray-50"
                  >
                    <td className="p-3">
                      {status === "confirmed" && (
                        <div className="flex flex-col gap-1">
                          <EditReservation
                            reservation={reservation}
                          ></EditReservation>
                          <CancelReservation
                            action="cancel"
                            reservationId={reservation.id}
                          />
                          {isEmployee && (
                            <CancelReservation
                              action="complete"
                              reservationId={reservation.id}
                            />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="max-w-30 p-3">{reservation.guestName}</td>
                    <td className="max-w-35 p-3">
                      <p className="break-words">{reservation.guestEmail}</p>
                    </td>
                    <td className="max-w-40 p-3">
                      {new Date(
                        reservation.reservationDateTime,
                      ).toLocaleString()}
                    </td>
                    <td className="p-3">{reservation.tableInfo.size}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-red-500"
                        }`}
                      >
                        {status || "confirmed"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return <></>;
}

export { ReservationList };
