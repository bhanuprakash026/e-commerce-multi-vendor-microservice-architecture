"use server"
import { kafka } from "../../../../packages/utils/kafka/index";

// Single producer instance
const producer = kafka.producer();
let isProducerConnected = false;

const ensureProducerConnected = async () => {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
  }
};

export async function sendKafkaEvent(eventData: {
  userId?: string
  productId?: string
  shopId?: string
  action?: string
  device?: string
  country?: string
  city?: string
}) {
  try {
    await ensureProducerConnected();
    
    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(eventData) }],
    });
    
    console.log("Kafka event sent successfully:", eventData.action);
  } catch (error) {
    console.error("Error sending Kafka event:", error);
    // Reset connection state on error
    isProducerConnected = false;
    throw error;
  }
}

// Optional: Export disconnect for graceful shutdown
export const disconnectKafkaProducer = async () => {
  try {
    if (isProducerConnected) {
      await producer.disconnect();
      isProducerConnected = false;
      console.log("Kafka producer disconnected");
    }
  } catch (error) {
    console.error("Error disconnecting Kafka producer:", error);
  }
};