export const restaurantSchema = `
  type Restaurant {
    id: String
    name: String
    cuisine: String
    address: String
    city: String
    state: String
    zip: String
    phone: String
    website: String
    hours: String
  }
`;

export const restaurants = `
 restaurants: [Restaurant]
`;
