DROP TABLE IF EXISTS chime_user;
DROP TABLE IF EXISTS chime_address;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS chimes;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS coins;

CREATE TABLE coins (
	id INT GENERATED ALWAYS AS IDENTITY,
	coin_num VARCHAR,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE users (
	id INT GENERATED ALWAYS AS IDENTITY,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	first_name VARCHAR NOT NULL,
	last_name VARCHAR NOT NULL,
	email VARCHAR NOT NULL,
	is_ambassador BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY(id)
);

CREATE TABLE chimes (
	id INT GENERATED ALWAYS AS IDENTITY,
	coin_id INT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	title VARCHAR NOT NULL,
	description VARCHAR,
	image VARCHAR,
	PRIMARY KEY(id),
	CONSTRAINT fk_coin
      FOREIGN KEY(coin_id) 
	  REFERENCES coins(id)
	  ON DELETE CASCADE
);

CREATE TABLE chime_user (
	id INT GENERATED ALWAYS AS IDENTITY,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	chime_id INT,
	user_id INT,
	PRIMARY KEY(id),
	CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	  REFERENCES users(id)
	  ON DELETE CASCADE,
	CONSTRAINT fk_chime
      FOREIGN KEY(chime_id) 
	  REFERENCES chimes(id)
	  ON DELETE CASCADE
);

CREATE TABLE addresses (
	id INT GENERATED ALWAYS AS IDENTITY,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	latitude DECIMAL NOT NULL,
	longitude DECIMAL NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE chime_address (
	id INT GENERATED ALWAYS AS IDENTITY,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	chime_id INT,
	address_id INT,
	PRIMARY KEY(id),
	CONSTRAINT fk_address
      FOREIGN KEY(address_id) 
	  REFERENCES addresses(id)
	  ON DELETE CASCADE,
	CONSTRAINT fk_chime
      FOREIGN KEY(chime_id) 
	  REFERENCES chimes(id)
	  ON DELETE CASCADE
);

INSERT INTO coins (coin_num)
VALUES('12345abc'),
	('abcd123');

INSERT INTO users (first_name, last_name, email)
VALUES('Alexis', 'Schindel', 'lexichasney@gmail.com'),
	('Tyler', 'Schindel', 'wyicked@gmail.com'),
	('Harry', 'Potter', 'wizardsrcool@gmail.com'),
	('Santa', 'Clause', 'mrkringle@yahoo.com');

INSERT INTO chimes (title, coin_id)
Values('Test Chime', 1),
	('Kindness', 2),
	('Hogwarts Clean Up', 2),
	('Reindeer Food Drive', 2);

INSERT INTO chime_user (chime_id, user_id)
VALUES((Select id from chimes where title = 'Test Chime'), (Select id from users where email = 'lexichasney@gmail.com')),
	((Select id from chimes where title = 'Kindness'), (Select id from users where email = 'wyicked@gmail.com')),
	((Select id from chimes where title = 'Kindness'), (Select id from users where email = 'wizardsrcool@gmail.com')),
	((Select id from chimes where title = 'Kindness'), (Select id from users where email = 'mrkringle@yahoo.com'));

INSERT INTO addresses (latitude, longitude)
VALUES(29.761993, -95.366302),
	(51.5361, -0.1251),
	(90.0000, 0.0000);

INSERT INTO chime_address (address_id, chime_id)
VALUES(1, 1),
	(1, 2),
	(2, 3),
	(3, 4);