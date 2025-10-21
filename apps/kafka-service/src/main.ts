import { kafka } from "../../../packages/utils/kafka/index";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-events-group" });

const eventQueue: any[] = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || eventQueue.length === 0) return;
  
  isProcessing = true;
  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
      // update shop analytics
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_wishlist",
      "remove_from_cart"
    ];

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing event:", error);
    }
  }
  
  isProcessing = false;
};

setInterval(processQueue, 3000);

let isConnected = false;

// Kafka consumer for user events
export const consumeKafkaMessages = async () => {
  if (isConnected) {
    console.log("Kafka consumer already connected");
    return;
  }

  try {
    console.log("Starting Kafka consumer...");
    await consumer.connect();
    isConnected = true;
    console.log("Kafka consumer connected");

    await consumer.subscribe({ topic: "users-events", fromBeginning: false });
    console.log("Kafka consumer subscribed to users-events");

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message || !message?.value) return;
        try {
          const event = JSON.parse(message.value.toString());
          eventQueue.push(event);
        } catch (parseError) {
          console.log("Error parsing Kafka message:", parseError);
        }
      }
    });
  } catch (error) {
    console.error("Failed to start Kafka consumer:", error);
    isConnected = false;
    throw error;
  }
};

export const disconnectKafka = async () => {
  try {
    if (isConnected) {
      await consumer.disconnect();
      isConnected = false;
      console.log("Kafka consumer disconnected");
    }
  } catch (error) {
    console.error("Error disconnecting Kafka consumer:", error);
  }
};

export const bootstrapKafkaService = async () => {
  try {
    await consumeKafkaMessages();
  } catch (error) {
    console.error("Failed to bootstrap Kafka service:", error);
    // Retry after delay
    setTimeout(() => bootstrapKafkaService(), 5000);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Kafka consumer...');
  await disconnectKafka();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Kafka consumer...');
  await disconnectKafka();
  process.exit(0);
});

bootstrapKafkaService();