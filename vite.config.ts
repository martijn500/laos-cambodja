import { defineConfig } from "vite";
import { tripDiary } from "@martijn500/vite-plugin";
import trip from "./trip.config.ts";

// The app and its build come from @martijn500/vite-plugin; this file
// only picks the trip
export default defineConfig(tripDiary(trip));
