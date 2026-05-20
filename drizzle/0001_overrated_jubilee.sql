CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"min_purchase" numeric(12, 2) DEFAULT '0' NOT NULL,
	"max_discount" numeric(12, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_id" uuid NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "supplier_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'REQUEST';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "uom" text DEFAULT 'Pcs' NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");