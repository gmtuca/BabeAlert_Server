CREATE DATABASE IF NOT EXISTS babealert;

CREATE TABLE babealert.Alert(
    ID int NOT NULL AUTO_INCREMENT,
    ip varchar(32),
    latitude Float NOT NULL,
    longitude Float NOT NULL,
    time Datetime NOT NULL,

    PRIMARY KEY (ID)
);
