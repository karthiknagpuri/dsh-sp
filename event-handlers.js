// Event handlers initialization
document.addEventListener('DOMContentLoaded', () => {
    // Sign In button - Updated for Clerk
    const signInBtn = document.querySelector('.sign-in-btn');
    if (signInBtn) {
        // Remove the onclick handler since it's now inline
        // The button already has onclick="clerkAuth.handleSignIn()"
    }

    // Demo button
    const demoBtn = document.querySelector('.demo-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', openDemo);
    }

    // Close modal button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeDemo);
    }

    // Earn XP button
    const earnXPBtn = document.querySelector('.game-preview .btn-primary');
    if (earnXPBtn) {
        earnXPBtn.addEventListener('click', earnXP);
    }

    // Feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        const featureType = card.querySelector('.feature-title').textContent.toLowerCase();
        card.addEventListener('click', () => {
            if (featureType.includes('quest')) showFeatureDetails('quest');
            else if (featureType.includes('leaderboard')) showFeatureDetails('leaderboard');
            else if (featureType.includes('nft')) showFeatureDetails('nft');
            else if (featureType.includes('economy')) showFeatureDetails('economy');
            else if (featureType.includes('analytics')) showFeatureDetails('analytics');
            else if (featureType.includes('setup')) showFeatureDetails('setup');
        });
    });

    // Comparison toggle buttons
    const comparisonBtns = document.querySelectorAll('.comparison-toggle .toggle-btn');
    comparisonBtns.forEach((btn, index) => {
        const types = ['features', 'pricing', 'support'];
        btn.addEventListener('click', (e) => showComparison(types[index], e));
    });

    // Testimonial slider buttons
    const prevSlideBtn = document.querySelector('.slider-btn:first-of-type');
    const nextSlideBtn = document.querySelector('.slider-btn:last-of-type');
    if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => slideTestimonial(-1));
    if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => slideTestimonial(1));

    // CTA buttons - Updated for Clerk
    // These buttons now use inline onclick handlers

    const bookDemoBtn = document.querySelector('.cta .btn-secondary');
    if (bookDemoBtn) {
        bookDemoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCalendar();
        });
    }
});