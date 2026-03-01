import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
    id: varchar('id', { length: 255 }).primaryKey(), // Clerk User ID
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
