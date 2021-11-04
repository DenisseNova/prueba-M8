CREATE TABLE public.skaters (
	id serial4 NOT NULL,
	email varchar(50) NOT NULL,
	nombre varchar(25) NOT NULL,
	"password" varchar(25) NOT NULL,
	anos_experiencia int4 NOT NULL,
	especialidad varchar(50) NOT NULL,
	foto varchar(255) NOT NULL,
	estado boolean NOT NULL,
	CONSTRAINT skaters_pk PRIMARY KEY (id)
);