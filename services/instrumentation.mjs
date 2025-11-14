import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
// exporters
const traceExporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces"
});

const metricExporter = new OTLPMetricExporter({
    url: "http://localhost:4318/v1/metrics"
});

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000, // every 5 seconds
});
// SDK
const sdk = new NodeSDK({
    traceExporter,
    metricReader,
    instrumentations: [getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-runtime-node": {
                enabled: true,
                metricsEnabled: true,
            },
            "@opentelemetry/instrumentation-express": {
                enabled: true,
                requestHook: () => { },
            },
            "@opentelemetry/instrumentation-http": {
                enabled: true,
            }
        })]
});

// --- FIX: use await instead of .then() ---
await sdk.start();
console.log("OpenTelemetry initialized");

// graceful shutdown
process.on("SIGTERM", async () => {
    await sdk.shutdown();
    console.log("OpenTelemetry shutdown completed");
});
