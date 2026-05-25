ALTER TABLE "discounts" ADD COLUMN "scope" text DEFAULT 'TRANSACTION' NOT NULL;--> statement-breakpoint
ALTER TABLE "discounts" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "discounts" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;