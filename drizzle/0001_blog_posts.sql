create table if not exists "blog_posts" (
  "id" uuid primary key default gen_random_uuid() not null,
  "author_id" uuid not null references "users"("id") on delete cascade,
  "title" varchar(180) not null,
  "slug" varchar(180) not null,
  "excerpt" text not null,
  "content" text not null,
  "is_published" boolean default false not null,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create unique index if not exists "blog_posts_slug_idx" on "blog_posts" ("slug");
create index if not exists "blog_posts_author_idx" on "blog_posts" ("author_id");
create index if not exists "blog_posts_published_idx" on "blog_posts" ("is_published", "published_at");
