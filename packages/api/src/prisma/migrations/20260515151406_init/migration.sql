-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'COACH', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RUN', 'WALK', 'TRAIL_RUN', 'VIRTUAL_RUN');

-- CreateEnum
CREATE TYPE "ActivityPrivacy" AS ENUM ('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PaceCategory" AS ENUM ('5K', '10K', 'HALF', 'FULL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "line_user_id" TEXT,
    "apple_user_id" TEXT,
    "google_user_id" TEXT,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "home_latitude" DOUBLE PRECISION,
    "home_longitude" DOUBLE PRECISION,
    "pace_band" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'RUN',
    "privacy" "ActivityPrivacy" NOT NULL DEFAULT 'PRIVATE',
    "distance_m" DOUBLE PRECISION NOT NULL,
    "duration_sec" INTEGER NOT NULL,
    "avg_pace_sec" DOUBLE PRECISION NOT NULL,
    "elevation_gain_m" DOUBLE PRECISION,
    "avg_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "started_at" TIMESTAMPTZ NOT NULL,
    "finished_at" TIMESTAMPTZ NOT NULL,
    "gps_track" JSONB,
    "title" TEXT,
    "description" TEXT,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pace_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "user_id" UUID NOT NULL,
    "category" "PaceCategory" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "recent_pace_sec" DOUBLE PRECISION,

    CONSTRAINT "pace_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_line_user_id_key" ON "users"("line_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_user_id_key" ON "users"("apple_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_user_id_key" ON "users"("google_user_id");

-- CreateIndex
CREATE INDEX "activities_user_id_started_at_idx" ON "activities"("user_id", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "pace_ratings_user_id_category_key" ON "pace_ratings"("user_id", "category");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pace_ratings" ADD CONSTRAINT "pace_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
