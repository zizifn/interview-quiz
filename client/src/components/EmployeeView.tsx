import { ReservationList } from "./Reservationlist";

export const EmployeeView = () => {
    return (
        <div data-testid="employee-view" className="h-full flex flex-col items-center  mt-5  gap-5 lg:max-w-6xl lg:mx-auto">
            <h1 className="text-2xl">Hilton Restaurants Reservation System (Employee View)</h1>
            <div className="bg-white mx-10 flex gap-5 flex-col items-stretch w-full h-full p-5 rounded-lg shadow-md">
                <div className="flex items-center justify-between w-full gap-5">
                    <h2 className=" text-xl font-semibold">All Guests Reservations</h2>
                </div>
                <ReservationList isEmployee={true}></ReservationList>
            </div>
        </div>
    );
}
