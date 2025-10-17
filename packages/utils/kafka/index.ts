import { Kafka } from "kafkajs";
import { ConnectionOptions } from "tls"; 

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
  ssl: {} as ConnectionOptions,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  }
})