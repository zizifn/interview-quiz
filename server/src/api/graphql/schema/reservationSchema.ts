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

  enum UpdateReservationStatus {
    completed
    canceled
  }

  type Reservation {
    id: String!
    restaurantInfo: RestaurantInfo!
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
    id: String!
    guestEmail: String!
    tableInfo: TableInfoInput!
    reservationDateTime: Float!
    specialRequests: String
  }

  input UpdateStatusReservationInput {
  id: String!
    status: UpdateReservationStatus!
  }
`;

export const reservationQueries = `
  reservations: [Reservation]
`;

export const reservationMutations = `
  createReservation(input: NewReservationInput!): Reservation
  updateReservation(input: UpdateReservationInput!): Reservation
  updateReservationStatus(input: UpdateStatusReservationInput!): Reservation
`;
