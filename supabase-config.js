// Supabase Configuration
const SUPABASE_URL = 'https://vnaqpyzjpqjqqottgtlq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYXFweXpqcHFqcXFvdHRndGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzAwNjYsImV4cCI6MjA2ODY0NjA2Nn0.gI7ztTwib19_wbxdfTi0_PEaMXrE_z29SokApm3Kn38';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabase = supabase;

// Helper functions for common operations
const supabaseHelpers = {
    // Add user to waitlist
    async addToWaitlist(email) {
        try {
            const { data, error } = await supabase
                .from('waitlist')
                .insert([{ email: email, created_at: new Date().toISOString() }]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error adding to waitlist:', error);
            return { success: false, error: error.message };
        }
    },

    // Get waitlist count
    async getWaitlistCount() {
        try {
            const { count, error } = await supabase
                .from('waitlist')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return { success: true, count };
        } catch (error) {
            console.error('Error getting waitlist count:', error);
            return { success: false, error: error.message };
        }
    },

    // Save user preferences
    async saveUserPreference(userId, key, value) {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .upsert([{ 
                    user_id: userId, 
                    preference_key: key, 
                    preference_value: value,
                    updated_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving user preference:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user preferences
    async getUserPreferences(userId) {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export helpers
window.supabaseHelpers = supabaseHelpers; 