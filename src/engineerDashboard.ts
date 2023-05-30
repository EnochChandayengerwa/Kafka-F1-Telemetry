import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { EachMessagePayload, Kafka } from 'kafkajs';
import { KAFKA_CONFIG, SCHEMA_REGISTRY_CONFIG } from './KAFKA_CONFIG';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { v4 as uuid } from 'uuid';

const kafka = new Kafka(KAFKA_CONFIG);
const schemaRegistryClient = new SchemaRegistry(SCHEMA_REGISTRY_CONFIG);

// Create an Express app
const app = express();
const server = createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  // Subscribe to Kafka topic when a client connects
  const groupId = uuid();
  const consumer = kafka.consumer({ groupId });
  consumer.connect().then(() => {
    consumer.subscribe({ topic: 'telemetryDataStream' });

    consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        const key = message.key ? message.key.toString() : null;
        const value = message.value ? await schemaRegistryClient.decode(message.value) : null;

        // Send the value object as JSON to the WebSocket client
        ws.send(JSON.stringify(value));
      },
    });
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
