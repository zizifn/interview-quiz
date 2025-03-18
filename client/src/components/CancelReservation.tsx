import { Children, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui/catalyst/button";
import { useMutation } from "@tanstack/react-query";
import { updateReservationStatus, queryClient, ReservationStatus } from "@/lib/http";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

function CancelReservation({ reservationId, action }: { reservationId: string, action: 'cancel' | 'complete' }) {

    const { mutate, error, isPending } = useMutation({
        mutationKey: ["reservation", "create"],
        mutationFn: (data: ReservationStatus) => updateReservationStatus(reservationId, data),
        onSuccess: (data) => {
            console.log('CancelReservation', reservationId);
            queryClient.invalidateQueries({
                queryKey: ["reservations"],
            });
            queryClient.setQueriesData(
                {
                    queryKey: ["reservations"],
                },
                (oldData: any) => {
                    console.log('------', oldData)
                    const newData = oldData.map((reservation: any) => {
                        if (reservation.id === reservationId) {
                            return {
                                ...reservation,
                                status: action === 'cancel' ? 'canceled' : 'completed'
                            }
                        }
                        return reservation;
                    }
                    );
                    return newData;
                }
            )
        }
    });

    function handleClick() {
        console.log('CancelReservation', reservationId);
        if (action === 'cancel') {
            mutate("canceled");
        } else {
            mutate("completed");
        }
    }

    return (
        <>
            {error && <AlertDialog defaultOpen>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Reservation Failed</AlertDialogTitle>
                        <AlertDialogDescription>
                            {error.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>}
            <Button disabled={!reservationId} onClick={handleClick}
                color={action === 'cancel' ? 'red' : 'green'} >
                {
                    action === 'cancel' ? <XCircleIcon /> : <CheckCircleIcon />
                }
                {action === 'cancel'
                    ? (isPending ? 'Canceling' : 'Cancel')
                    : (isPending ? 'Completing' : 'Complete')}
            </Button>
        </>

    );
}

export { CancelReservation };
