drop table donation;
create table donation (
    id integer not null  AUTO_INCREMENT primary key,
    `sender_id` varchar(36) not null references `user` (`id`) on delete cascade,
    amount decimal(20,2) not null default 0.00,
    message varchar(255) not null default '',
    code varchar(255) not null default '',
    created_at timestamp(3) default CURRENT_TIMESTAMP(3),
    transfered boolean not null default false
);
-- create index idx_donation_sender_id on donation(sender_id);
-- create index idx_donation_code on donation(code);
