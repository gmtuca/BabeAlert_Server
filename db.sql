CREATE DATABASE IF NOT EXISTS BabeAlertDB;

CREATE TABLE BabeAlertDB.Alert(
    ID int NOT NULL AUTO_INCREMENT,
    ip varchar(32),
    latitude Float,
    longitude Float,
    time Datetime,

    PRIMARY KEY (ID)
);