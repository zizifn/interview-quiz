import { useState } from "react";
import { PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogTitle } from "./ui/catalyst/dialog";
import { ReservationInfoForm } from "./ReservationInfoForm";
import { Button } from "./ui/catalyst/button";
import { Reservation } from "@/lib/http";

function EditReservation({reservation}: {reservation: Reservation}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button color="green" onClick={() => setIsOpen(true)}>
                <PencilSquareIcon />
                Edit
            </Button>
            <Dialog open={isOpen} onClose={setIsOpen}>
                <DialogTitle>Update Reservation</DialogTitle>
                <ReservationInfoForm reservation={reservation} onconfirm={() => setIsOpen(false)}></ReservationInfoForm>
            </Dialog>
        </>

    );
}

export { EditReservation };
