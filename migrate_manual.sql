-- Manually add PricingType enum and column if Prisma is failing to sync
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricingtype') THEN
        CREATE TYPE "PricingType" AS ENUM ('paid', 'free');
    END IF;
END
$$;

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "pricingType" "PricingType" DEFAULT 'paid';
