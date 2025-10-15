import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["pkc"]
})