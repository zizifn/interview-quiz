import { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Dialog ,DialogTitle } from "./ui/catalyst/dialog";
import { ReservationInfoForm } from "./ReservationInfoForm";

function NewReservation() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                type="button"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-400 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <PlusCircleIcon aria-hidden="true" className="-ml-0.5 size-5" />
                Create New Reservation
            </button>
            <Dialog open={isOpen} onClose={setIsOpen}>
                <DialogTitle>Create New Reservation</DialogTitle>
                <ReservationInfoForm onconfirm={() => setIsOpen(false)}></ReservationInfoForm>
            </Dialog>
        </>

    );
}

export { NewReservation };
