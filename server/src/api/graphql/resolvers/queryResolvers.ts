import { getRestaurant } from "../../restaurant/restaurantController";

export const queryResolvers = {
  restaurants: async () => {
    // const restaurants = await getRestaurant({} as any, {} as any, () => {});
    const restaurants = [] as any;
    return restaurants;
  },
};
