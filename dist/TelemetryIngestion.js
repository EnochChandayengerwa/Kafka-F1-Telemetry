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
Object.defineProperty(exports, "__esModule", { value: true });
const f1_22_udp_1 = require("f1-22-udp");
const kafkajs_1 = require("kafkajs");
const KAFKA_CONFIG_1 = require("./KAFKA_CONFIG");
function sendData() {
    return __awaiter(this, void 0, void 0, function* () {
        const kafka = new kafkajs_1.Kafka(KAFKA_CONFIG_1.KAFKA_CONFIG);
        const producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner });
        ;
        try {
            var lapData, motionData, telemetryData;
            yield producer.connect();
            console.log('Connected to cluster successfully!');
        }
        catch (error) {
            console.error('Kafka connection error:', error);
        }
        const f122 = new f1_22_udp_1.F122UDP();
        f122.start();
        // Positional Telemetry
        f122.on('motion', function (data) {
            return __awaiter(this, void 0, void 0, function* () {
                const playerCarIndex = data.m_header.m_playerCarIndex;
                motionData = {
                    PLAYERCARPOSITIONX: data.m_carMotionData[playerCarIndex].m_worldPositionX,
                    PLAYERCARPOSITIONY: data.m_carMotionData[playerCarIndex].m_worldPositionY,
                    PLAYERCARPOSITIONZ: data.m_carMotionData[playerCarIndex].m_worldPositionZ,
                    OTHERCARPOSITIONS: data.m_carMotionData
                        .filter((_, index) => index !== playerCarIndex)
                        .map(car => ({
                        X: car.m_worldPositionX,
                        Y: car.m_worldPositionY,
                        Z: car.m_worldPositionZ
                    }))
                };
                // if(motionData&&lapData&&telemetryData){
                //     var combinedData = {
                //         PLAYERCARPOSITIONX: motionData.PLAYERCARPOSITIONX,
                //         PLAYERCARPOSITIONY: motionData.PLAYERCARPOSITIONY,
                //         CURRENTLAPTIME: lapData.CURRENT_LAP_TIME,
                //         SPEED: telemetryData.SPEED,
                //         THROTTLE: telemetryData.THROTTLE,
                //         STEER: telemetryData.STEER,
                //         BRAKE: telemetryData.BRAKE,
                //         GEAR: telemetryData.GEAR
                //     }
                //     const key = 'mlStream';
                //     const value = JSON.stringify(combinedData);
                //     producer.send({
                //     topic: 'mlStream',
                //     messages: [{ key, value }],
                // });
                //     console.log(combinedData);
                // }
                const key = 'positionStream';
                const value = JSON.stringify(motionData);
                producer.send({
                    topic: 'positionStream',
                    messages: [{ key, value }],
                });
            });
        });
        // // Car Telemetry
        f122.on('carTelemetry', function (data) {
            return __awaiter(this, void 0, void 0, function* () {
                telemetryData = {
                    SPEED: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_speed,
                    THROTTLE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_throttle,
                    STEER: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_steer,
                    BRAKE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_brake,
                    CLUTCH: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_clutch,
                    GEAR: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_gear,
                    ENGINERPM: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_engineRPM,
                    DRS: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_drs,
                    BRAKESTEMPERATURE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_brakesTemperature,
                    TYRESSURFACETEMPERATURE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_tyresSurfaceTemperature,
                    TYRESINNERTEMPERATURE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_tyresInnerTemperature,
                    ENGINETEMPERATURE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_engineTemperature,
                    TYRESPRESSURE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_tyresPressure,
                    SURFACETYPE: data.m_carTelemetryData[data.m_header.m_playerCarIndex].m_surfaceType
                };
                const key = 'telemetryStream';
                const value = JSON.stringify(telemetryData);
                producer.send({
                    topic: 'telemetryStream',
                    messages: [{ key, value }],
                });
                console.log(telemetryData);
            });
        });
        // // Lap Telemetry
        f122.on('lapData', function (data) {
            return __awaiter(this, void 0, void 0, function* () {
                lapData = {
                    LAST_LAP_TIME: data.m_lapData[data.m_header.m_playerCarIndex].m_lastLapTimeInMS,
                    CURRENT_LAP_TIME: data.m_lapData[data.m_header.m_playerCarIndex].m_currentLapTimeInMS,
                    SECTOR1_TIME: data.m_lapData[data.m_header.m_playerCarIndex].m_sector1TimeInMS,
                    SECTOR2_TIME: data.m_lapData[data.m_header.m_playerCarIndex].m_sector2TimeInMS,
                    LAP_DISTANCE: data.m_lapData[data.m_header.m_playerCarIndex].m_lapDistance,
                    TOTAL_DISTANCE: data.m_lapData[data.m_header.m_playerCarIndex].m_totalDistance,
                    CAR_POSITION: data.m_lapData[data.m_header.m_playerCarIndex].m_carPosition,
                    CURRENT_LAP_NUM: data.m_lapData[data.m_header.m_playerCarIndex].m_currentLapNum,
                    PIT_STATUS: data.m_lapData[data.m_header.m_playerCarIndex].m_pitStatus,
                    NUM_PIT_STOPS: data.m_lapData[data.m_header.m_playerCarIndex].m_numPitStops,
                    SECTOR: data.m_lapData[data.m_header.m_playerCarIndex].m_sector,
                    WARNINGS: data.m_lapData[data.m_header.m_playerCarIndex].m_warnings,
                    GRID_POSITION: data.m_lapData[data.m_header.m_playerCarIndex].m_gridPosition,
                    PIT_LANE_TIME_IN_LANE: data.m_lapData[data.m_header.m_playerCarIndex].m_pitLaneTimeInLaneInMS,
                    PIT_STOP_TIMER: data.m_lapData[data.m_header.m_playerCarIndex].m_pitStopTimerInMS,
                };
                const key = 'lapDataStream';
                const value = JSON.stringify(lapData);
                producer.send({
                    topic: 'lapDataStream',
                    messages: [{ key, value }],
                });
            });
        });
    });
}
sendData();
//# sourceMappingURL=TelemetryIngestion.js.map