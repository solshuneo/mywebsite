
create table `message` (
    `id` varchar(36) not null primary key,
    `sender_id` varchar(36) not null references `user` (`id`) on delete cascade,
    `content` text not null,
    `createdAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null
);

create index `message_sender_id_idx` on `message` (`sender_id`);
