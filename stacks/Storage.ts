import { StackContext, Table, Bucket } from "sst/constructs";

export function Storage({ stack }: StackContext) {
  const historyTable = new Table(stack, "UserHistoryTable", {
    fields: {
      UserId: "string",
      Timestamp: "number",
    },
    primaryIndex: { partitionKey: "UserId", sortKey: "Timestamp" },
  });

  const resumeBucket = new Bucket(stack, "UserResumesBucket", {
    cors: [
      {
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      },
    ],
  });

  return {
    historyTable,
    resumeBucket,
  };
}