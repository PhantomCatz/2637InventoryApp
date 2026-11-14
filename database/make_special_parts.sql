USE testdb;

DROP TABLE IF EXISTS special_parts;

CREATE TABLE parts(
    id                                  INT NOT NULL AUTO_INCREMENT,
    part_id                             INT NOT NULL
    unit_name                           VARCHAR(512) NOT NULL,
    unit_status                         VARCHAR(512) NOT NULL,
    status_last_updated_by              VARCHAR(32) NOT NULL
    status_last_updated_on              VARCHAR(32) NOT NULL
    unit_description                    VARCHAR(512) NOT NULL,
    unit_location                       VARCHAR(512) NOT NULL,

    PRIMARY KEY (id)
);