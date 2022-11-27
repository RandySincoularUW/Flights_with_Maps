--
-- GEOG 576
-- create aviation database and add postgis extension
-- use \i switch to run sql script
-- or: psql -U <username> <database>

create database aviation;
create extension postgis;
\! echo done creating the flights table ....