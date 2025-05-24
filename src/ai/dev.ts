
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-food-photo.ts';
import '@/ai/flows/analyze-food-text-flow.ts';
import '@/ai/flows/generate-health-schedule-flow.ts';
import '@/ai/flows/summarize-daily-log-flow.ts'; // Added new flow
