"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const kafkajs_1 = require("kafkajs");
const KAFKA_CONFIG_1 = require("./KAFKA_CONFIG");
const uuid_1 = require("uuid");
const kafka = new kafkajs_1.Kafka(KAFKA_CONFIG_1.KAFKA_CONFIG);
// Create an Express app
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Create a WebSocket server
const wss = new ws_1.default.Server({ server });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    // Subscribe to Kafka topics when a client connects
    const groupId = (0, uuid_1.v4)();
    const consumer = kafka.consumer({ groupId });
    const runConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
        yield consumer.connect();
        yield consumer.subscribe({ topic: 'telemetryStream' });
        yield consumer.subscribe({ topic: 'positionStream' });
        yield consumer.subscribe({ topic: 'lapDataStream' });
        yield consumer.run({
            eachMessage: ({ topic, message }) => __awaiter(void 0, void 0, void 0, function* () {
                const key = message.key ? message.key.toString() : null;
                const value = message.value ? JSON.parse(message.value.toString()) : null;
                // Send the value object as JSON to the WebSocket client
                ws.send(JSON.stringify({ topic, key, value }));
            }),
        });
    });
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
//# sourceMappingURL=TelemetryConsumption.js.map