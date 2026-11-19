USE invtestdb;

DROP TABLE IF EXISTS parts;

CREATE TABLE parts(
    id                                  INT NOT NULL AUTO_INCREMENT,
    subteam                             VARCHAR(32) NOT NULL,
    name                                VARCHAR(512) NOT NULL,
    manufacturer_name                   VARCHAR(512),
    part_number                         VARCHAR(64),
    manufacturer                        VARCHAR(128),
    categories                          VARCHAR(512),
    purchase_link                       VARCHAR(512),
    description                         VARCHAR(512) NOT NULL,
    location                            VARCHAR(512),
    quantity                            INT NOT NULL,
    is_special                          TINYINT NOT NULL,

    PRIMARY KEY (id)
);
