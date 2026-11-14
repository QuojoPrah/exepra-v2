-- Small-business rule (Kleinunternehmer, § 19 UStG): no VAT is charged or shown.
ALTER TABLE "StoreSettings" ADD COLUMN "smallBusiness" BOOLEAN NOT NULL DEFAULT false;

-- EXEPRA trades under the small-business rule.
UPDATE "StoreSettings" SET "smallBusiness" = true WHERE "id" = 'store';
