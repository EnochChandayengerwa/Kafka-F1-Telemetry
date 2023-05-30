import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { F122UDP } from "f1-22-udp";
import { Kafka } from "kafkajs";
import { KAFKA_CONFIG, SCHEMA_REGISTRY_CONFIG } from "./KAFKA_CONFIG";

async function sendData() {
    const kafka = new Kafka(KAFKA_CONFIG);
    const schemaRegistryClient = new SchemaRegistry(SCHEMA_REGISTRY_CONFIG)
    const telemetryDataSchema = await schemaRegistryClient.getLatestSchemaId('telemetryDataStream-value')
    const producer = kafka.producer();
    await producer.connect()
    var sessionData, lapData, setupData, historyData, telemetryData;

    const f122: F122UDP = new F122UDP();
    f122.start();

    f122.on('session', async function (data) {
        sessionData = {
            weather: data.m_weather,
            trackTemperature: data.m_trackTemperature,
            airTemperature: data.m_airTemperature,
            totalLaps: data.m_totalLaps,
            trackLength: data.m_trackLength,
            sessionType: data.m_sessionType,
            numWeatherForecastSamples: data.m_numWeatherForecastSamples,
            forecastAccuracy: data.m_forecastAccuracy,
            pitStopWindowIdealLap: data.m_pitStopWindowIdealLap,
            pitStopWindowLatestLap: data.m_pitStopWindowLatestLap,
            pitStopRejoinPosition: data.m_pitStopRejoinPosition
        };
        // console.log(sessionData)

        // const key = 'session_data'
        // const value = await schemaRegistryClient.encode(sessionDataSchema,{
        //     weather: data.m_weather,
        //     trackTemperature: data.m_trackTemperature,
        //     airTemperature: data.m_airTemperature,
        //     totalLaps: data.m_totalLaps,
        //     trackLength: data.m_trackLength,
        //     sessionType: data.m_sessionType,
        //     numWeatherForecastSamples: data.m_numWeatherForecastSamples,
        //     forecastAccuracy: data.m_forecastAccuracy,
        //     pitStopWindowIdealLap: data.m_pitStopWindowIdealLap,
        //     pitStopWindowLatestLap: data.m_pitStopWindowLatestLap,
        //     pitStopRejoinPosition: data.m_pitStopRejoinPosition
        // })
        
        // producer.send({
        //     topic: 'session_data',
        //     messages: [{key,value}]
        // })
    });

    f122.on('lapData', function (data) {
        lapData = {
            lastLapTime: data.m_lapData[data.m_header.m_playerCarIndex].m_lastLapTimeInMS,
            currentLapTime: data.m_lapData[data.m_header.m_playerCarIndex].m_currentLapTimeInMS,
            sector1Time: data.m_lapData[data.m_header.m_playerCarIndex].m_sector1TimeInMS,
            sector2Time: data.m_lapData[data.m_header.m_playerCarIndex].m_sector2TimeInMS,
            lapDistance: data.m_lapData[data.m_header.m_playerCarIndex].m_lapDistance,
            totalDistance: data.m_lapData[data.m_header.m_playerCarIndex].m_totalDistance,
            carPosition: data.m_lapData[data.m_header.m_playerCarIndex].m_carPosition,
            currentLapNum: data.m_lapData[data.m_header.m_playerCarIndex].m_currentLapNum,
            pitStatus: data.m_lapData[data.m_header.m_playerCarIndex].m_pitStatus,
            numPitStops: data.m_lapData[data.m_header.m_playerCarIndex].m_numPitStops,
            sector: data.m_lapData[data.m_header.m_playerCarIndex].m_sector,
            warnings: data.m_lapData[data.m_header.m_playerCarIndex].m_warnings,
            gridPosition: data.m_lapData[data.m_header.m_playerCarIndex].m_gridPosition,
            pitLaneTimeInLane: data.m_lapData[data.m_header.m_playerCarIndex].m_pitLaneTimeInLaneInMS,
            pitStopTimer: data.m_lapData[data.m_header.m_playerCarIndex].m_pitStopTimerInMS,
        }
        // console.log(lapData)
    });

    f122.on('carSetups', function (data) {
        setupData = {
            frontWing: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontWing,
            rearWing: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearWing,
            onThrottle: data.m_carSetups[data.m_header.m_playerCarIndex].m_onThrottle,
            offThrottle: data.m_carSetups[data.m_header.m_playerCarIndex].m_offThrottle,
            frontCamber: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontCamber,
            rearCamber: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearCamber,
            frontToe: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontToe,
            rearToe: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearToe,
            frontSuspension: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontSuspension,
            rearSuspension: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearSuspension,
            frontSuspensionHeight: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontSuspensionHeight,
            rearSuspensionHeight: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearSuspensionHeight,
            brakePressure: data.m_carSetups[data.m_header.m_playerCarIndex].m_brakePressure,
            brakeBias: data.m_carSetups[data.m_header.m_playerCarIndex].m_brakeBias,
            rearLeftTyrePressure: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearLeftTyrePressure,
            rearRightTyrePressure: data.m_carSetups[data.m_header.m_playerCarIndex].m_rearRightTyrePressure,
            frontLeftTyrePressure: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontLeftTyrePressure,
            frontRightTyrePressure: data.m_carSetups[data.m_header.m_playerCarIndex].m_frontRightTyrePressure,
            ballast: data.m_carSetups[data.m_header.m_playerCarIndex].m_ballast,
            fuelLoad: data.m_carSetups[data.m_header.m_playerCarIndex].m_fuelLoad
        }
        // console.log(setupData)
    });

    f122.on('carTelemetry', async function (data) {
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
          
        console.log(telemetryData)
        const key = 'telemetryData'
        const value = await schemaRegistryClient.encode(telemetryDataSchema,telemetryData)
        producer.send({
            topic:'telemetryDataStream',
            messages:[{key,value}]
        })

    });

    f122.on('sessionHistory', function (data) {
        historyData = {
            lapTimeInMS: data.m_lapHistoryData[data.m_header.m_playerCarIndex].m_lapTimeInMS,
            sector1TimeInMS: data.m_lapHistoryData[data.m_header.m_playerCarIndex].m_sector1TimeInMS,
            sector2TimeInMS: data.m_lapHistoryData[data.m_header.m_playerCarIndex].m_sector2TimeInMS,
            sector3TimeInMS: data.m_lapHistoryData[data.m_header.m_playerCarIndex].m_sector3TimeInMS,
            //@ts-ignore
            tyreActualCompound: data.tyreActualCompound,
            numLaps: data.m_numLaps,
            numTyreStints: data.m_numTyreStints,
            bestLapTimeLapNum: data.m_bestLapTimeLapNum,
            bestSector1LapNum: data.m_bestSector1LapNum,
            bestSector2LapNum: data.m_bestSector2LapNum,
            bestSector3LapNum: data.m_bestSector3LapNum
        };
        // console.log(historyData)

    });
}
sendData();

