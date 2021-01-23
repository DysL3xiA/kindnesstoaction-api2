DROP TABLE IF EXISTS chime_user;
DROP TABLE IF EXISTS chime_address;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_type;
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
	user_name VARCHAR NOT NULL,
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

CREATE TABLE user_type (
	id INT GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE chime_user (
	id INT GENERATED ALWAYS AS IDENTITY,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	chime_id INT,
	user_id INT,
	user_type INT,
	PRIMARY KEY(id),
	CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	  REFERENCES users(id)
	  ON DELETE CASCADE,
	CONSTRAINT fk_user_type
      FOREIGN KEY(user_type) 
	  REFERENCES user_type(id),
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
	('abcd123'),
	('012104');

INSERT INTO user_type (name)
VALUES('Giver'),
	('Receiver');

INSERT INTO users (user_name, email)
VALUES('Alexis Schindel', 'lexichasney@gmail.com'),
	('Tyler Schindel', 'wyicked@gmail.com'),
	('Harry Potter', 'wizardsrcool@gmail.com'),
	('Santa Clause', 'mrkringle@yahoo.com'),
	('Elijah Knight', 'e.knight@gmail.com');

INSERT INTO chimes (title, coin_id, description)
Values('Test Chime', 1, null),
	('Kindness', 2, null),
	('Hogwarts Clean Up', 2, 'Cleaned up the Hogwarts campus'),
	('Reindeer Food Drive', 2, 'Elves did a food drive for local reindeer in need'),
	('It all starts here.', 3, 'Elijah James Knight infuses the world with light and joy. 3 weeks before his tragic death, he made this profound statement: "Start everything with kindness and the end will be okay." Through his example, Elijah inspires us to turn kindness to action according to our unique talents and interests to remake the world as it should be. If you have received a Kindness Coin, thank you for doing the work of kindness. Now, recognize and encourage others to go do! https://www.dignitymemorial.com/obituaries/houston-tx/elijah-knight-7898454');

INSERT INTO chime_user (chime_id, user_id, user_type)
VALUES ((Select id from chimes where title = 'Test Chime'), (Select id from users where email = 'lexichasney@gmail.com'), (Select id from user_type where name = 'Giver')),
	((Select id from chimes where title = 'Test Chime'), (Select id from users where email = 'wyicked@gmail.com'), (Select id from user_type where name = 'Receiver')),
	((Select id from chimes where title = 'Kindness'), (Select id from users where email = 'wyicked@gmail.com'), (Select id from user_type where name = 'Giver')),
	((Select id from chimes where title = 'Hogwarts Clean Up'), (Select id from users where email = 'wizardsrcool@gmail.com'), (Select id from user_type where name = 'Giver')),
	((Select id from chimes where title = 'Reindeer Food Drive'), (Select id from users where email = 'mrkringle@yahoo.com'), (Select id from user_type where name = 'Receiver')),
	((Select id from chimes where title = 'Reindeer Food Drive'), (Select id from users where email = 'wizardsrcool@gmail.com'), (Select id from user_type where name = 'Giver')),
	((Select id from chimes where title = 'It all starts here.'), (Select id from users where email = 'e.knight@gmail.com'), (Select id from user_type where name = 'Giver'));

INSERT INTO addresses (latitude, longitude)
VALUES(29.761993, -95.366302),
	(51.5361, -0.1251),
	(90.0000, -135.0000),
	(29.9717, -95.6938);

INSERT INTO chime_address (address_id, chime_id)
VALUES(1, 1),
	(1, 2),
	(2, 3),
	(3, 4),
	(4, 5);