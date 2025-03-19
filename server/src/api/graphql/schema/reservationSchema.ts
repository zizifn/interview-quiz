export const reservationSchema = `
  type RestaurantInfo {
    id: String!
    name: String
    address: String
  }

  type TableInfo {
    id: String!
    size: Int!
  }

  enum ReservationStatus {
    confirmed
    completed
    canceled
  }

  type Reservation {
    id: String!
    restaurantInfo: RestaurantInfo!
    guestId: String!
    guestName: String!
    guestEmail: String!
    reservationDateTime: Float!
    tableInfo: TableInfo!
    status: ReservationStatus!
    specialRequests: String
  }

  input RestaurantInfoInput {
    id: String!
  }

  input TableInfoInput {
    id: String!
  }

  input NewReservationInput {
    restaurantInfo: RestaurantInfoInput!
    reservationDateTime: Float!
    tableInfo: TableInfoInput!
    specialRequests: String
  }

  input UpdateReservationInput {
    guestEmail: String!
    tableInfo: TableInfoInput!
    reservationDateTime: Float!
    specialRequests: String
  }

  input UpdateStatusReservationInput {
    status: ReservationStatus!
  }
`;

export const reservationQueries = `
  reservations: [Reservation]
  reservation(id: String!): Reservation
`;

export const reservationMutations = `
  createReservation(input: NewReservationInput!): Reservation
  updateReservation(id: String!, input: UpdateReservationInput!): Reservation
  updateReservationStatus(id: String!, input: UpdateStatusReservationInput!): Reservation
`;
