import { createClient } from './supabase/client';

export type UserSubmissionData = {
    city_name: string;
    role: string;
    experience_level: string;
    gross_salary: number;
    rent: number;
};

export async function fetchUserSubmission(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return { data, error };
}

export async function submitUserData(data: UserSubmissionData) {
    const supabase = createClient();

    // First confirm we have an active session locally to prevent unnecessary network requests
    // if the user is completely unauthenticated.
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return { error: new Error('You must be logged in to submit data.') };
    }

    // Phase 1 Security: Strict Boundary Limits to prevent extreme outlier injection via API
    if (data.gross_salary < 0 || data.gross_salary > 2000000) return { error: new Error('Gross salary boundary violation.') };
    if (data.rent < 0 || data.rent > 100000) return { error: new Error('Rent boundary violation.') };

    // To prevent database bloat and bypass the missing Unique Constraint on user_id, 
    // we explicitly wipe any old submissions from this user before inserting the new reality.
    await supabase.from('user_submissions').delete().eq('user_id', session.user.id);

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
