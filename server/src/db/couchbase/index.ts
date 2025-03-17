import { env } from "@/common/utils/envConfig";
import { Bucket, Cluster, connect, Scope } from "couchbase";

const clusterConnStr = env.COUCHBASE_URL;
const username = env.COUCHBASE_USER;
const password = env.COUCHBASE_PASSWORD;
const bucketName = "interview-quiz";
const scope = "quiz";

let couchbaseCluster: Cluster | null = null;
let quizBucket: Bucket | null = null;
let quizScope: Scope | null = null;

async function initConnection() {
  try {
    couchbaseCluster = await connect(clusterConnStr, {
      username: username,
      password: password,
      // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
      // when accessing Capella from a different Wide Area Network
      // or Availability Zone (e.g. your laptop).
      configProfile: "wanDevelopment",
    });
    quizBucket = couchbaseCluster.bucket(bucketName);
    quizScope = quizBucket.scope(scope);
  } catch (error) {
    console.error("Error connecting to Couchbase:", error);
  }
}

export async function getCouchbaseConnection() {
  if (!couchbaseCluster) {
    await initConnection();
  }
  return { couchbaseCluster, quizBucket, quizScope };
}
