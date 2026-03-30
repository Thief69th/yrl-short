CREATE TYPE "public"."device_type" AS ENUM('desktop', 'mobile', 'tablet', 'bot', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'paid');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "click_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"country_code" varchar(2) DEFAULT 'UN' NOT NULL,
	"device_type" "device_type" DEFAULT 'unknown' NOT NULL,
	"referrer" text,
	"served_interstitial" boolean DEFAULT false NOT NULL,
	"impression_tracked" boolean DEFAULT false NOT NULL,
	"ad_clicked" boolean DEFAULT false NOT NULL,
	"revenue_amount" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"clicks_count" integer DEFAULT 0 NOT NULL,
	"revenue" double precision DEFAULT 0 NOT NULL,
	"period_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"long_url" text NOT NULL,
	"short_code" varchar(40) NOT NULL,
	"custom_alias" varchar(32),
	"clicks" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(191) NOT NULL,
	"email" varchar(320) NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "click_events_link_idx" ON "click_events" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "click_events_user_idx" ON "click_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "click_events_created_at_idx" ON "click_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "earnings_link_idx" ON "earnings" USING btree ("link_id");--> statement-breakpoint
CREATE UNIQUE INDEX "earnings_link_period_idx" ON "earnings" USING btree ("link_id","period_date");--> statement-breakpoint
CREATE INDEX "links_user_idx" ON "links" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "links_short_code_idx" ON "links" USING btree ("short_code");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");