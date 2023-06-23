import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { EachMessagePayload, Kafka } from 'kafkajs';
import { KAFKA_CONFIG } from './KAFKA_CONFIG';
import { v4 as uuid } from 'uuid';

const kafka = new Kafka(KAFKA_CONFIG);

// Create an Express app
const app = express();
const server = createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  // Subscribe to Kafka topics when a client connects
  const groupId = uuid();
  const consumer = kafka.consumer({ groupId });

  const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'telemetryStream' });
    await consumer.subscribe({ topic: 'positionStream' });
    await consumer.subscribe({ topic: 'lapDataStream' });

    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const key = message.key ? message.key.toString() : null;
        const value = message.value ? JSON.parse(message.value.toString()) : null;

        // Send the value object as JSON to the WebSocket client
        ws.send(JSON.stringify({ topic, key, value }));
      },
    });
  };

  runConsumer().catch((error) => {
    console.error('Error running Kafka consumer:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');

    // Disconnect the Kafka consumer when a client disconnects
    consumer.disconnect();
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
