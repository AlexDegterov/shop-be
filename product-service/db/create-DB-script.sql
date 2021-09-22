
--create database task4;

--create table products (
--	id uuid primary key default uuid_generate_v4(),
--	title text not null,
--	description text,
--	price integer,
--	logo text
--)

--create table stocks (
--	product_id uuid, 
--	count integer,
--	foreign key ("product_id") references "products" ("id")
--)

--drop table products;
--drop table stocks;

--create extension if not exists "uuid-ossp"