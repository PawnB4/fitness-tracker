import type { Config } from 'drizzle-kit';

export default {
    dialect: "sqlite",
    schema: "./db/schema.ts",
    casing: "snake_case",
    out: "./drizzle",
    driver: 'expo',
} satisfies Config;;
