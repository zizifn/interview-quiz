export const restaurantSchema = `
  type Restaurant {
    id: String!
    name: String!
    email: String
    address: String!
    phone: String!
    tables: [Table!]!
  }

  type Table {
    id: String!
    capacity: Int!
    size: Int!
  }
`;

export const restaurants = `
  restaurants: [Restaurant]
`;
