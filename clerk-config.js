// Clerk Configuration for Vanilla JS
// Initialize Clerk with your publishable key

// Wait for Clerk to load
window.addEventListener('load', async () => {
    // Check if Clerk is available
    if (typeof window.Clerk === 'undefined') {
        console.error('Clerk not loaded. Make sure to include the Clerk script.');
        return;
    }

    try {
        // Initialize Clerk with your publishable key
        await window.Clerk.load({
            publishableKey: 'pk_test_cmVndWxhci1yYWNjb29uLTMuY2xlcmsuYWNjb3VudHMuZGV2JA'
        });

        console.log('Clerk initialized successfully');

        // Check authentication state
        checkAuthState();

        // Listen for auth state changes
        window.Clerk.addListener((state) => {
            console.log('Clerk state changed:', state);
            checkAuthState();
        });

    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
});

// Check authentication state and update UI
async function checkAuthState() {
    if (!window.Clerk) return;

    const user = window.Clerk.user;
    
    if (user) {
        console.log('User is signed in:', user);
        
        // Sync user with Supabase
        await syncUserWithSupabase(user);
        
        // Update UI for authenticated state
        updateUIForAuthenticatedUser(user);
    } else {
        console.log('User is not signed in');
        
        // Update UI for unauthenticated state
        updateUIForUnauthenticatedUser();
    }
}

// Sync Clerk user with Supabase
async function syncUserWithSupabase(clerkUser) {
    if (!window.supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', clerkUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching profile:', fetchError);
            return;
        }

        // Profile data
        const profileData = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            first_name: clerkUser.firstName || '',
            last_name: clerkUser.lastName || '',
            full_name: clerkUser.fullName || '',
            username: clerkUser.username || '',
            avatar_url: clerkUser.imageUrl || '',
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (!existingProfile) {
            // Create new profile
            profileData.created_at = new Date().toISOString();
            
            const { data, error } = await window.supabase
                .from('profiles')
                .insert([profileData]);

            if (error) {
                console.error('Error creating profile:', error);
            } else {
                console.log('Profile created successfully');
            }
        } else {
            // Update existing profile
            const { data, error } = await window.supabase
                .from('profiles')
                .update(profileData)
                .eq('id', clerkUser.id);

            if (error) {
                console.error('Error updating profile:', error);
            } else {
                console.log('Profile updated successfully');
            }
        }
    } catch (error) {
        console.error('Error syncing with Supabase:', error);
    }
}

// Update UI for authenticated users
function updateUIForAuthenticatedUser(user) {
    // Hide sign-in buttons
    const signInButtons = document.querySelectorAll('.sign-in-btn');
    signInButtons.forEach(btn => btn.style.display = 'none');
    
    // Show user menu
    const userMenuContainer = document.getElementById('userMenuContainer');
    if (userMenuContainer) {
        userMenuContainer.style.display = 'block';
        userMenuContainer.innerHTML = `
            <div class="user-menu">
                <img src="${user.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id}" alt="Profile" class="user-avatar">
                <span class="user-name">${user.firstName || 'User'}</span>
                <button onclick="handleSignOut()" class="btn btn-secondary btn-sm">Sign Out</button>
            </div>
        `;
    }
    
    // Update waitlist form to show different message
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.innerHTML = `
            <div class="authenticated-message">
                <h3>Welcome back, ${user.firstName || 'Founder'}! 👋</h3>
                <p>You're on the waitlist. We'll notify you at ${user.primaryEmailAddress?.emailAddress} when we launch.</p>
                <a href="/dashboard.html" class="btn btn-primary">Go to Dashboard</a>
            </div>
        `;
    }
}

// Update UI for unauthenticated users
function updateUIForUnauthenticatedUser() {
    // Show sign-in buttons
    const signInButtons = document.querySelectorAll('.sign-in-btn');
    signInButtons.forEach(btn => btn.style.display = 'block');
    
    // Hide user menu
    const userMenuContainer = document.getElementById('userMenuContainer');
    if (userMenuContainer) {
        userMenuContainer.style.display = 'none';
    }
}

// Handle sign out
window.handleSignOut = async function() {
    try {
        await window.Clerk.signOut();
        window.location.href = '/';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Handle sign in
async function handleSignIn() {
    try {
        await window.Clerk.openSignIn({
            redirectUrl: window.location.href,
            appearance: {
                elements: {
                    rootBox: 'clerk-modal',
                    card: 'clerk-card',
                    headerTitle: 'clerk-header-title',
                    formButtonPrimary: 'clerk-btn-primary'
                }
            }
        });
    } catch (error) {
        console.error('Error opening sign in:', error);
    }
}

// Handle sign up
async function handleSignUp() {
    try {
        await window.Clerk.openSignUp({
            redirectUrl: window.location.href,
            appearance: {
                elements: {
                    rootBox: 'clerk-modal',
                    card: 'clerk-card',
                    headerTitle: 'clerk-header-title',
                    formButtonPrimary: 'clerk-btn-primary'
                }
            }
        });
    } catch (error) {
        console.error('Error opening sign up:', error);
    }
}

// Export functions for global use
window.clerkAuth = {
    handleSignIn,
    handleSignUp,
    handleSignOut,
    checkAuthState,
    syncUserWithSupabase
};