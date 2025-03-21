import { connect } from "couchbase";
import { env } from "@/common/utils/envConfig";

const restaurant = {
  type: "restaurant",
  id: "f225cf45-0c44-40ea-8d29-0be756626dcf",
  name: "Hilton Shanghai Hongqiao International Airport",
  address:
    "No. 1 Kong Gang 8th Road, Changning District, Shanghai, 200335, China",
  phone: "+862133236666",
  tables: [
    { id: "55d0e558-16f0-4b39-8e77-77745f435596", capacity: 10, size: 1 },
    { id: "eab78ae4-8510-495b-acfe-6b8518614107", capacity: 10, size: 2 },
    { id: "77820980-3f8f-4fe8-a75c-cc9be3817126", capacity: 10, size: 4 },
    { id: "934e605f-0b36-46a9-90fa-611842536cd4", capacity: 5, size: 6 },
    { id: "bc47398c-8b2a-45ca-afba-ccfe1485b8b2", capacity: 4, size: 8 },
    { id: "c195e714-d37d-41f8-abdc-d167000e5262", capacity: 3, size: 10 },
  ],
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
    const collection = bucket.scope("quiz").collection("restaurant");
    // create a document
    const json = {
      cuisine: ["Italian", "Pizza"],
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    };

    //   const result = await collection.upsert(docId, json);
    //   console.log(result);

    let result = await collection.replace(
      "f225cf45-0c44-40ea-8d29-0be756626dcf",
      restaurant
    );
    console.log(result);

    let result2 = await bucket
      .scope("quiz")
      .query(`SELECT r.* FROM restaurant r`);
    console.log(result2);
  } catch (error) {
    console.error("Error connecting to Couchbase:", error);
    return;
  }
}

main();
