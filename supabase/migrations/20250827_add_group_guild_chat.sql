-- Migration: Add group and guild chat support to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS group_id VARCHAR;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS guild_name VARCHAR;
-- group_id: for group chat (null for private/guild)
-- guild_name: for guild chat (null for private/group)
-- For private chat: both group_id and guild_name are null
-- For group chat: group_id is set, others null
-- For guild chat: guild_name is set, others null
