CREATE DATABASE IF NOT EXISTS BabeAlertDB;

CREATE TABLE BabeAlertDB.BabeVote(
    ID int NOT NULL AUTO_INCREMENT,
    ip varchar(32),
    latitude Float,
    longitude Float,
    vote_time Datetime,

    PRIMARY KEY (ID));