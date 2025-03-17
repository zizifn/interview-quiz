import { connect } from "couchbase";
import { env } from "@/common/utils/envConfig";

const restaurant = {
  type: "reservation",
  id: "954a6da0-3d71-45d2-b131-f8130b6476ca",
  guestId: "01",
  restaurantInfo: {
    id: "3a6772a5-a818-44cc-9f31-aba97c7f1b90",
    name: "Hilton Shanghai Hongqiao International Airport",
    address:
      "No. 1 Kong Gang 8th Road, Changning District, Shanghai, 200335, China",
  },
  guestName: "John Doe",
  guestEmail: "john.doe@example.com",
  reservationDateTime: 1742189385775,
  partySize: 4,
  tableInfo: {
    id: "77820980-3f8f-4fe8-a75c-cc9be3817126",
    size: 4,
  },
  status: "confirmed", // confirmed, seated, completed, canceled, no-show
  specialRequests: "Window seat preferred",
};
async function main() {
  const clusterConnStr = env.COUCHBASE_URL;
  const username = env.COUCHBASE_USER;
  const password = env.COUCHBASE_PASSWORD;
  const bucketName = "interview-quiz";
  console.log(clusterConnStr, username, password);

  try {
    const cluster = await connect(clusterConnStr, {
      username: username,
      password: password,
      // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
      // when accessing Capella from a different Wide Area Network
      // or Availability Zone (e.g. your laptop).
      configProfile: "wanDevelopment",
    });
    const bucket = cluster.bucket(bucketName);
    const collection = bucket.scope("quiz").collection("reservations");

    const result = await collection.upsert(
      "ee688b2c-b782-4d2d-b50d-4f39fcc03be1",
      restaurant
    );
    console.log(result);

    // const result = await collection.replace(
    //   "f225cf45-0c44-40ea-8d29-0be756626dcf",
    //   restaurant
    // );
    console.log(result);
  } catch (error) {
    console.error("Error connecting to Couchbase:", error);
    return;
  }
}

main();
