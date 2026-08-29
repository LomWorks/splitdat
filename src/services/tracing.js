import { getPerformance, trace } from "firebase/performance";
import { app } from "./firebase.js";

const perf = getPerformance(app);

export async function traceFirestoreOperation(name, operation) {
const operationTrace = trace(perf, name);
operationTrace.start();

try {
const result = await operation();

operationTrace.putMetric("success", 1);
return result;
} catch (error) {
operationTrace.putMetric("success", 0);
operationTrace.putAttribute("error_code", error.code ?? "unknown");
throw error;
} finally {
operationTrace.stop();
}
}
