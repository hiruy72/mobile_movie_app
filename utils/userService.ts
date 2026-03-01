import { eq } from 'drizzle-orm';
import { db } from './db';
import { usersTable } from './schema';

/**
 * Ensures a user exists in the database. 
 * If the user doesn't exist, it creates one based on Clerk metadata.
 */
export async function syncUserToDB(clerkUser: any) {
    if (!clerkUser) return null;

    try {
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, clerkUser.id))
            .limit(1);

        if (existingUser.length > 0) {
            return existingUser[0];
        }

        const newUser = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0].emailAddress,
            fullName: clerkUser.fullName || '',
            avatarUrl: clerkUser.imageUrl || '',
            bio: '',
        };

        console.log(`Syncing new user ${clerkUser.id} to Neon DB...`);
        const result = await db.insert(usersTable).values(newUser).returning();
        return result[0];
    } catch (error) {
        console.error('Error syncing user to Neon DB:', error);
        return null;
    }
}

/**
 * Updates a user's profile in the database.
 */
export async function updateUserProfile(userId: string, data: { fullName?: string; bio?: string; avatarUrl?: string }) {
    try {
        const updated = await db
            .update(usersTable)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, userId))
            .returning();
        return updated[0];
    } catch (error) {
        console.error('Error updating profile in Neon DB:', error);
        return null;
    }
}
