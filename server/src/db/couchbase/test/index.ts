import { connect } from "couchbase";
import { env } from "@/common/utils/envConfig";

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

      configProfile: "wanDevelopment",
    });
    const bucket = cluster.bucket(bucketName);
    const collection = bucket.scope("quiz").collection("restaurant");
    // Create query context for index creation
    const queryContext = `\`interview-quiz\`.\`quiz\`.\`reservations\``;

    // Create index on reservationDateTime
    await cluster.query(
      `CREATE INDEX idx_reservation_datetime ON ${queryContext}(reservationDateTime)`
    );
    console.log("Index on reservationDateTime created successfully");

    // Create index on guestName
    await cluster.query(
      `CREATE INDEX idx_guest_name ON ${queryContext}(guestName)`
    );
    console.log("Index on guestName created successfully");

    // Create composite index on both fields
    await cluster.query(
      `CREATE INDEX idx_reservation_datetime_guest_name ON ${queryContext}(reservationDateTime, guestName)`
    );
    console.log("Composite index created successfully");

    // Close connection
    await cluster.close();
  } catch (error) {
    console.error("Error connecting to Couchbase:", error);
    return;
  }
}

main();
