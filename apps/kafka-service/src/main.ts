import { kafka } from "../../../packages/utils/kafka/index";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-events-group" });

const eventQueue: any[] = []; // Batch Processing

const processQueue = async () => {
  if (eventQueue.length === 0) return;

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

};

setInterval(processQueue, 3000);

// Kafka consumer for user events
export const consumeKafkaMessages = async () => {
  // connect to the Kafka broker
  console.log("Starting Kafka consumer...");
  await consumer.connect();
  console.log("Kafka consumer connecteddd");
  await consumer.subscribe({topic: "users-events", fromBeginning: false});

  console.log("Kafka consumer subscribed too users-events");
  await consumer.run({
    eachMessage: async({message}) => {
      if(!message || !message?.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event)
    }
  })
};

export const bootstrapKafkaService = async () => {
  await consumeKafkaMessages();
};

bootstrapKafkaService();