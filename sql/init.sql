-- Clear all old DB tables.
DROP DATABASE IF EXISTS ch_helper;

-- Create new database + tables
CREATE DATABASE ch_helper;
USE ch_helper;

-- ****** `ch_chartqueue` ******

CREATE TABLE `ch_chartqueue`
(
 `user_id`         varchar(255) NOT NULL ,
 `chart_id`         varchar(255) NOT NULL ,
 `dateSubmitted`   varchar(255) NOT NULL ,
 `link_type`       varchar(255) NOT NULL ,
 `link_address`    varchar(255) NOT NULL ,
 `status`          varchar(255) NOT NULL ,
 `last_updated`    varchar(255) NOT NULL ,
 `judgement_reason` varchar(255) NOT NULL ,
 `judgement_outcome` varchar(255) NOT NULL ,
 `ProcessedBy` varchar(255) NOT NULL ,

PRIMARY KEY (`user_id`)
);



-- ****** `ch_serverconfig` ******

CREATE TABLE `ch_serverconfig`
(
 `server_id`           varchar(255) NOT NULL ,
 `queue_chart_channel` varchar(255) NOT NULL ,
 `logchan_id`          varchar(255) NOT NULL ,
 `reviewer_role_id`    varchar(255) NOT NULL ,

PRIMARY KEY (`server_id`)
);
