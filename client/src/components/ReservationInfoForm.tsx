import { Fieldset, Field, Label } from "./ui/catalyst/fieldset";
import { Input } from "./ui/catalyst/input";
import { Button } from "./ui/catalyst/button";
import { Textarea } from "./ui/catalyst/textarea";
import { useRef, useState } from "react";
import {
  createReservation,
  NewReservation,
  queryClient,
  Reservation,
  updateReservation,
  UpdateReservation,
} from "@/lib/http";
import { Select } from "./ui/catalyst/select";
import { useRestaurants, useUser } from "@/lib/hooks";
import { useMutation } from "@tanstack/react-query";
function convertToDateTimeLocalString(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function ReservationInfoForm({
  onconfirm,
  reservation,
}: {
  onconfirm: (isOpen?: boolean) => void;
  reservation?: Reservation;
}) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    reservation?.restaurantInfo.id || "",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const { data: userData } = useUser();
  const { data: restaurants } = useRestaurants(userData?.username || "");

  const isEditRestaurant = reservation?.id || "";
  const defaultArrivalTime = reservation?.reservationDateTime
    ? convertToDateTimeLocalString(new Date(reservation.reservationDateTime))
    : "";

  const { mutate, error, isPending } = useMutation({
    mutationKey: ["reservation", "create"],
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      });
      // Reset form fields
      if (formRef.current) {
        formRef.current.reset();
      }
      onconfirm();
      setSelectedRestaurantId("");
    },
  });
  const {
    mutate: editMutate,
    error: editError,
    isPending: editPending,
  } = useMutation({
    mutationKey: ["reservation", "update"],
    mutationFn: (data: UpdateReservation) => {
      return updateReservation(reservation?.id || "", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      });
      // Reset form fields
      if (formRef.current) {
        formRef.current.reset();
      }
      onconfirm();
      setSelectedRestaurantId("");
    },
  });

  if (reservation?.restaurantInfo.id) {
    console.log("edit reservation", reservation);
  }

  // Find the selected restaurant based on selectedRestaurantId
  const selectedRestaurant = restaurants?.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const arrivalTime = formData.get("arrival_time");

    //TODO need check form data again
    if (isEditRestaurant) {
      const updateReservation: UpdateReservation = {
        guestEmail: userData?.email || "",
        reservationDateTime: new Date(arrivalTime as string).getTime(),
        tableInfo: {
          id: formData.get("size") as string,
        },
        specialRequests: formData.get("special_request") as string,
      };
      editMutate(updateReservation);
    } else {
      const newReservation: NewReservation = {
        restaurantInfo: {
          id: selectedRestaurantId,
        },
        reservationDateTime: new Date(arrivalTime as string).getTime(),
        tableInfo: {
          id: formData.get("size") as string,
        },
        specialRequests: formData.get("special_request") as string,
      };
      mutate(newReservation);
    }
  }

  function handleRestaurantChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRestaurantId(e.target.value);
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit}>
        <Fieldset>
          <Field>
            <Label>Guest Name:</Label>
            <Input
              disabled
              required
              type="text"
              name="name"
              defaultValue={userData?.username || ""}
            />
          </Field>
          <Field>
            <Label>Contact Information:</Label>
            <Input
              disabled
              required
              type="email"
              name="email"
              defaultValue={userData?.email || ""}
            />
          </Field>
          <Field>
            <Label>Restaurant Name:</Label>
            <Select
              required
              name="restaurant"
              onChange={handleRestaurantChange}
              value={selectedRestaurantId}
            >
              <option value="">Select a restaurant</option>
              {restaurants?.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>Table Size:</Label>
            <Select
              required
              name="size"
              disabled={!selectedRestaurantId}
              defaultValue={reservation?.tableInfo.id || ""}
            >
              {!selectedRestaurantId && (
                <option value="">Please select a restaurant first</option>
              )}
              {selectedRestaurantId &&
                selectedRestaurant?.tables.length === 0 && (
                  <option value="">No tables available</option>
                )}
              {selectedRestaurantId &&
                selectedRestaurant?.tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.size} - {table.capacity} available
                  </option>
                ))}
            </Select>
          </Field>
          <Field>
            <Label>Expected Arrival Time:</Label>
            <Input
              required
              type="datetime-local"
              name="arrival_time"
              defaultValue={defaultArrivalTime}
            />
          </Field>

          <Field>
            <Label>Special Requests:</Label>
            <Textarea
              name="special_request"
              defaultValue={reservation?.specialRequests || ""}
            />
          </Field>
        </Fieldset>
        <div className="h-5 text-base text-red-500">
          {error?.message || editError?.message}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <Button outline onClick={() => onconfirm(false)}>
            Cancel
          </Button>
          {isEditRestaurant && (
            <Button color="green" type="submit">
              {editPending ? "Updating" : "Update"}
            </Button>
          )}
          {!isEditRestaurant && (
            <Button color="green" type="submit">
              {isPending ? "Creating" : "Create"}
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

export { ReservationInfoForm };
