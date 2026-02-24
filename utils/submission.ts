import { createClient } from './supabase/client';

export type UserSubmissionData = {
    city_name: string;
    role: string;
    experience_level: string;
    gross_salary: number;
    rent: number;
};

export async function submitUserData(data: UserSubmissionData) {
    const supabase = createClient();

    // First confirm we have an active session locally to prevent unnecessary network requests
    // if the user is completely unauthenticated.
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return { error: new Error('You must be logged in to submit data.') };
    }

    // Insert the row into user_submissions.
    // Row Level Security (RLS) in Supabase will enforce that `user_id` MUST match the active session.
    const { data: insertedData, error } = await supabase.from('user_submissions').insert([
        {
            user_id: session.user.id,
            city_name: data.city_name,
            role: data.role,
            experience_level: data.experience_level,
            gross_salary: data.gross_salary,
            rent: data.rent
        }
    ]).select().single();

    return { data: insertedData, error };
}
