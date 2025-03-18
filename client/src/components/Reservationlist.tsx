import { getReservation } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/catalyst/input";
import { EditReservation } from "./EditReservation";
import { CancelReservation } from "./CancelReservation";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function ReservationList({ isEmployee }: { isEmployee: boolean }) {
    const { data, isPending, error, isSuccess } = useQuery({
        queryKey: ["reservations"],
        queryFn: getReservation,
        staleTime: 1000 * 60 * 5,
        retry: 2
    });


    if (isPending) {
        return (<Alert>
            <AlertDescription>
                loading reservation data
            </AlertDescription>
        </Alert>)
    }
    if (error) {
        return (<Alert>
            <AlertDescription>
                {error.message}
            </AlertDescription>
        </Alert>)
    }
    console.log("reservation data", data);
    if (isSuccess && data?.length === 0) {
        return (<Alert>
            <AlertDescription>
                No reservation data
            </AlertDescription>
        </Alert>)
    }
    if (isSuccess) {
        return (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="p-3 border-b">Actions</th>
                                <th className="p-3 border-b">Name</th>
                                <th className="p-3 border-b">Contact Info</th>
                                <th className="p-3 border-b">Arrival time</th>
                                <th className="p-3 border-b">Table size</th>
                                <th className="p-3 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map(reservation => {
                                const status = reservation.status || "confirmed";
                                return (
                                    <tr key={reservation.id} className="border-b hover:bg-gray-50 text-left">
                                        <td className="p-3">
                                            {
                                                status === 'confirmed' && <div className="flex gap-1 flex-col">
                                                    <EditReservation reservation={reservation}></EditReservation>
                                                    <CancelReservation action="cancel" reservationId={reservation.id} />
                                                    {isEmployee && <CancelReservation action="complete" reservationId={reservation.id} />}
                                                </div>
                                            }

                                        </td>
                                        <td className="p-3 max-w-30">
                                            {reservation.guestName}
                                        </td>
                                        <td className="p-3 max-w-35 " >
                                            <p className="break-words">{reservation.guestEmail}</p>
                                            </td>
                                        <td className="p-3 max-w-40">
                                            {new Date(reservation.reservationDateTime).toLocaleString()}
                                        </td>
                                        <td className="p-3">{reservation.tableInfo.size}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-red-500'
                                                }`}>
                                                {status || "confirmed"}
                                            </span>
                                        </td>

                                    </tr>)
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }

    return <></>
}

export { ReservationList };