-- Run once in Supabase → SQL Editor, then seed-projects.sql and seed-experiences.sql.
--
-- No RLS. Instead the public API roles (anon, authenticated) get no privileges
-- on these tables, so any request made with the publishable key, e.g. curl
-- against /rest/v1/projects, fails with "permission denied". Only the
-- SvelteKit server, using the secret key (service_role), can read or write.

create table projects (
	id bigint generated always as identity primary key,
	slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
	name text not null,
	description text not null default '',
	details text not null default '',
	visit_link text,
	images text[] not null default '{}',
	technologies jsonb not null default '[]', -- [{ "name": "...", "icon": "url" }]
	sort int not null default 0, -- lower shows first
	created_at timestamptz not null default now()
);

-- Work, education, organization and achievements share one shape.
create table experiences (
	id bigint generated always as identity primary key,
	category text not null check (category in ('work', 'education', 'organization', 'achievement')),
	name text not null,
	title text not null default '',
	date text not null default '',
	description text not null default '',
	sort int not null default 0,
	created_at timestamptz not null default now()
);

revoke all on projects, experiences from anon, authenticated;

-- Images are public to view by URL. With no storage policies, only the
-- server (secret key) can upload, list or delete.
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('images', 'images', true, '{image/*}');

-- Public bucket for the CV; replaced from /backstage.
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('files', 'files', true, '{application/pdf}');
