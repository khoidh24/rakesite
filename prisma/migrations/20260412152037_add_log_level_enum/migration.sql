-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('info', 'warning', 'error', 'debug');

-- AlterTable: convert existing string values to enum
ALTER TABLE "ExecutionLog"
  ALTER COLUMN "logLevel" TYPE "LogLevel" USING (
    CASE "logLevel"
      WHEN 'info' THEN 'info'::"LogLevel"
      WHEN 'warning' THEN 'warning'::"LogLevel"
      WHEN 'debug' THEN 'debug'::"LogLevel"
      ELSE 'error'::"LogLevel"
    END
  );
