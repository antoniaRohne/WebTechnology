SET CHARACTER SET utf8;
USE radio;

ALTER TABLE person ADD COLUMN IF NOT EXISTS negotiationOffer VARCHAR(1500) NULL;
ALTER TABLE person ADD COLUMN IF NOT EXISTS negotiationAnswer VARCHAR(1500) NULL;
ALTER TABLE person ADD COLUMN IF NOT EXISTS negotiationTimestamp BIGINT NULL;

ALTER TABLE person ADD INDEX (negotiationOffer);
ALTER TABLE person ADD INDEX (negotiationAnswer);
ALTER TABLE person ADD INDEX (negotiationTimestamp);
