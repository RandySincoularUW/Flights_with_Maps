--
-- GEOG 576
-- create flights table
--
create table flights
( id bigserial primary key,
time_stamp timestamp with time zone not null default now(),
reg_number varchar(10),
altitude INTEGER,
direction INTEGER,
speed integer,
latitude float8,
longitude float8,
dep_iata varchar(12),
flight_icao varchar(12),
status varchar(12));
\! echo done creating the flights table ....