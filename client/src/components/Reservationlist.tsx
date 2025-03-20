import { getReservation } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "./ui/alert";
import { EditReservation } from "./EditReservation";
import { CancelReservation } from "./CancelReservation";
import { useState, useRef } from "react";
import { Field, Fieldset, Label } from "./ui/catalyst/fieldset";
import { Input } from "./ui/catalyst/input";
import { Select } from "./ui/catalyst/select";
import { Button } from "./ui/catalyst/button";

function ReservationList({ isEmployee }: { isEmployee: boolean }) {
  const [filters, setFilters] = useState({
    date: "",
    status: "",
  });

  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: ["reservations"],
    queryFn: getReservation,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  function handleFilterChange({
    date,
    status,
  }: {
    date: string;
    status: string;
  }) {
    setFilters({ date, status });
  }

  const filteredData = isSuccess
    ? data.filter((reservation) => {
        const reservationDate = new Date(
          reservation.reservationDateTime,
        ).toLocaleDateString("en-CA");

        const matchesDate = filters.date
          ? reservationDate === filters.date
          : true;
        const matchesStatus = filters.status
          ? (reservation.status || "confirmed") === filters.status
          : true;

        return matchesDate && matchesStatus;
      })
    : [];

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
        {isEmployee && <FilterControl onFilterChange={handleFilterChange} />}
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
              {filteredData.length > 0 ? (
                filteredData.map((reservation) => {
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
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-3 text-center">
                    No reservations match the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return <></>;
}

function FilterControl({
  onFilterChange,
}: {
  onFilterChange: (filters: { date: string; status: string }) => void;
}) {
  const minDate = new Date(
    new Date().getTime() - 1000 * 3600 * 12,
  ).toLocaleDateString("en-CA");
  const formRef = useRef<HTMLFormElement>(null);

  function resetFilters() {
    if (formRef.current) {
      formRef.current.reset();
    }
    onFilterChange({
      date: "",
      status: "",
    });
  }

  function handleFormChange() {
    const formData = new FormData(formRef.current!);
    const dateInput = formData.get("date") as string;
    const statusSelect = formData.get("status") as string;
    console.log(dateInput, statusSelect);
    onFilterChange({
      date: dateInput,
      status: statusSelect,
    });
  }

  return (
    <div className="mb-4 rounded-md border bg-gray-50 p-3">
      <form
        ref={formRef}
        className="flex flex-wrap items-end gap-4"
        onChange={handleFormChange}
      >
        <Fieldset>
          <Field>
            <Label className="text-left">Filter by Date</Label>
            <Input min={minDate} type="date" name="date" />
          </Field>
        </Fieldset>
        <Fieldset>
          <Field>
            <Label className="text-left">Filter by Status</Label>
            <Select name="status">
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
        </Fieldset>
        <Button color="emerald" type="button" onClick={resetFilters}>
          Reset Filters
        </Button>
      </form>
    </div>
  );
}

export { ReservationList };
