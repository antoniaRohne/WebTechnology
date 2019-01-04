SET CHARACTER SET utf8;
USE radio;

ALTER TABLE person
DROP COLUMN WebAdress;

ALTER TABLE person
DROP COLUMN LastTransmissionTimestamp;

ALTER TABLE person
ADD COLUMN webAdress varchar(1024);

ALTER TABLE person
ADD COLUMN lastTransmissionTimestamp BIGINT;
