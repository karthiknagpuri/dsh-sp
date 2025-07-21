// Script.js - Updated: ${new Date().toISOString()}

// Global error handler
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Safe element selector with fallback
function safeGetElement(selector, context = document) {
    try {
        return context.querySelector(selector) || context.getElementById(selector);
    } catch (e) {
        console.warn(`Failed to find element: ${selector}`);
        return null;
    }
}

// Safe function wrapper to prevent errors from breaking the entire script
function safeFn(fn, fallback = () => {}) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error('Function error:', error);
            return fallback.apply(this, args);
        }
    };
}
// Typing Effect
const typingWords = ['Addictive Experience', 'Gaming Platform', 'Reward System', 'Community Hub'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.getElementById('typingText');

function typeEffect() {
    // Check if required elements exist
    if (!typingElement || !typingWords || typingWords.length === 0) {
        console.warn('TypeEffect: Required elements not found');
        return;
    }
    
    const currentWord = typingWords[wordIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % typingWords.length;
        setTimeout(typeEffect, 500);
    } else {
        setTimeout(typeEffect, isDeleting ? 50 : 100);
    }
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
    }

    // Header scroll effect
    const header = document.getElementById('header');
    if (header && scrollTop > 50) {
        header.classList.add('scrolled');
    } else if (header) {
        header.classList.remove('scrolled');
    }
});

// Email Form Submission with Validation
const emailForm = document.getElementById('emailForm');
const emailInput = document.querySelector('.email-input');


function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

if (emailForm && emailInput) {
    emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
    }
    
    // Show loading state
    const submitBtn = emailForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            emailForm.style.display = 'none';
        }
        showNotification('Welcome! Check your email for next steps.', 'success');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
    });
}

// Demo Modal
function openDemo() {
    const modal = document.getElementById('demoModal');
    if (!modal) {
        console.error('demoModal element not found');
        return;
    }
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus trap for accessibility
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.focus();
    }
}

function closeDemo() {
    const modal = document.getElementById('demoModal');
    if (!modal) {
        console.error('demoModal element not found');
        return;
    }
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('demoModal');
        if (modal && modal.style.display === 'flex') {
            closeDemo();
        }
    }
});

// XP System Demo
let currentXP = 0;
let level = 1;

function earnXP() {
    currentXP += 50;
    const xpBar = document.getElementById('xpBar');
    const levelUp = document.getElementById('levelUp');
    
    if (!xpBar || !levelUp) {
        console.error('XP elements not found');
        return;
    }
    
    if (currentXP >= 200) {
        currentXP = 0;
        level++;
        xpBar.style.width = '100%';
        xpBar.textContent = '200 / 200 XP';
        levelUp.style.display = 'block';
        setTimeout(() => {
            xpBar.style.width = '0%';
            xpBar.textContent = '0 / 200 XP';
            levelUp.style.display = 'none';
        }, 2000);
    } else {
        const percent = (currentXP / 200) * 100;
        xpBar.style.width = percent + '%';
        xpBar.textContent = currentXP + ' / 200 XP';
    }
}

// Count Up Animation with Performance Optimization
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const duration = 2000;
                const startTime = performance.now();
                
                const animateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function for smooth animation
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = target * easeOutQuart;
                    
                    counter.textContent = target % 1 !== 0 ? current.toFixed(2) : Math.floor(current);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                requestAnimationFrame(animateCounter);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);


// Comparison Toggle
function showComparison(type, event) {
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const tbody = document.getElementById('comparisonBody');
    if (!tbody) {
        console.error('comparisonBody element not found');
        return;
    }
    let content = '';

    if (type === 'features') {
        content = `
            <tr>
                <td>XP & Leveling System</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
            <tr>
                <td>Dynamic Leaderboards</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
            <tr>
                <td>Quest System</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
            <tr>
                <td>Built-in Monetization</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="check">✓</span></td>
                <td><span class="check">✓</span></td>
            </tr>
            <tr>
                <td>NFT Rewards</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
        `;
    } else if (type === 'pricing') {
        content = `
            <tr>
                <td>Monthly Cost</td>
                <td>$9.99</td>
                <td>Free</td>
                <td>$89-399</td>
                <td>Free</td>
            </tr>
            <tr>
                <td>Transaction Fee</td>
                <td>5%</td>
                <td>N/A</td>
                <td>4%</td>
                <td>30%</td>
            </tr>
            <tr>
                <td>Free Members</td>
                <td>100</td>
                <td>Unlimited</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr>
                <td>Revenue Share</td>
                <td>95%</td>
                <td>N/A</td>
                <td>96%</td>
                <td>70%</td>
            </tr>
        `;
    } else if (type === 'support') {
        content = `
            <tr>
                <td>24/7 Support</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
            <tr>
                <td>Onboarding Help</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="check">✓</span></td>
                <td><span class="check">✓</span></td>
            </tr>
            <tr>
                <td>API Access</td>
                <td><span class="check">✓</span></td>
                <td><span class="check">✓</span></td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
            <tr>
                <td>Migration Help</td>
                <td><span class="check">✓</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
                <td><span class="cross">✗</span></td>
            </tr>
        `;
    }

    tbody.innerHTML = content;
    console.log('Comparison table updated:', type, content);
}

// Feature Details
function showFeatureDetails(feature) {
    showNotification(`Learn more about ${feature} features coming soon!`);
}

// Testimonial Slider
let currentSlide = 0;
const testimonials = document.querySelectorAll('.testimonial-card');

function slideTestimonial(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = testimonials.length - 1;
    if (currentSlide >= testimonials.length) currentSlide = 0;
    
    const track = document.getElementById('testimonialsTrack');
    if (!track) {
        console.error('testimonialsTrack element not found');
        return;
    }
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}


// ROI Calculator with Validation
function calculateROI() {
    const memberCountEl = document.getElementById('memberCount');
    const avgPriceEl = document.getElementById('avgPrice');
    const calculatorResults = document.getElementById('calculatorResults');
    
    if (!memberCountEl || !avgPriceEl || !calculatorResults) {
        console.error('ROI calculator elements not found');
        return;
    }
    
    const members = parseFloat(memberCountEl.value) || 0;
    const price = parseFloat(avgPriceEl.value) || 0;
    
    if (members <= 0 || price <= 0) {
        document.getElementById('calculatorResults').style.display = 'none';
        return;
    }
    
    if (members > 1000000) {
        showNotification('Please enter a realistic number of members (max 1M).', 'warning');
        return;
    }
    
    if (price > 10000) {
        showNotification('Please enter a realistic price (max $10,000).', 'warning');
        return;
    }
    
    const monthly = members * price;
    const earnings = monthly * 0.95;
    const yearly = earnings * 12;

    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    const yourEarningsEl = document.getElementById('yourEarnings');
    const yearlyEarningsEl = document.getElementById('yearlyEarnings');
    
    if (monthlyRevenueEl && yourEarningsEl && yearlyEarningsEl) {
        monthlyRevenueEl.textContent = '$' + monthly.toLocaleString();
        yourEarningsEl.textContent = '$' + earnings.toLocaleString();
        yearlyEarningsEl.textContent = '$' + yearly.toLocaleString();
        calculatorResults.style.display = 'block';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('notification element not found');
        return;
    }
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Add icon based on type
    let icon = '💡';
    if (type === 'error') icon = '❌';
    else if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `${icon} ${message}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Calendar Demo
function openCalendar() {
    showNotification('Calendar integration coming soon!');
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Save user preferences
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`spaecs_${key}`, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save preference:', e);
    }
}

function getUserPreference(key, defaultValue = null) {
    try {
        const stored = localStorage.getItem(`spaecs_${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn('Could not load preference:', e);
        return defaultValue;
    }
}

// Remember user's email if they've entered it before
const savedEmail = getUserPreference('email');
if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
}

// Save email when form is submitted
if (emailForm && emailInput) {
    emailForm.addEventListener('submit', () => {
        const email = emailInput.value.trim();
        if (email) {
            saveUserPreference('email', email);
        }
    });
}

// Add loading state for page
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });
}

// Network status monitoring
window.addEventListener('online', () => {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may not work.', 'warning');
});

// Error handling for failed operations
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Only show notification for critical errors, not null reference errors
    if (e.error && !e.error.message.includes('null') && !e.error.message.includes('undefined')) {
        showNotification('Something went wrong. Please try again.', 'error');
    }
});

// Prevent form resubmission
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.history.state);
}

// Initialize typing effect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded successfully - version:', Date.now());
    
    // Detect which page we're on and initialize accordingly
    const isResourcesPage = window.location.pathname.includes('resources.html');
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    
    if (isIndexPage) {
        initializeIndexPage();
    } else if (isResourcesPage) {
        initializeResourcesPage();
    }
});

// Resources page functionality
function initializeResourcesPage() {
    console.log('Initializing resources page...');
    
    // Check if we're on the resources page
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.log('Not on resources page - sidebar not found');
        return;
    }
    
    console.log('Resources page detected, setting up functionality...');
    
    // Mobile menu toggle
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    // Navigation item click handling
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Nav item clicked:', this.textContent.trim());
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
    
    // Resource card click handling
    const resourceCards = document.querySelectorAll('.resource-card');
    console.log('Found resource cards:', resourceCards.length);
    
    resourceCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log('Resource card clicked');
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Add resource button click
    const addResourceBtn = document.querySelector('.add-resource-btn');
    if (addResourceBtn) {
        console.log('Add resource button found');
        addResourceBtn.addEventListener('click', function() {
            console.log('Add resource button clicked');
            showNotification('Add Resource functionality coming soon!');
        });
    } else {
        console.log('Add resource button not found');
    }
    
    // Add navigation links
    addNavigationLinks();
    
    console.log('Resources page initialization complete');
}

// Initialize index page specific functionality
function initializeIndexPage() {
    console.log('Initializing index page...');
    
    // Initialize typing effect
    if (document.querySelector('.typing-text')) {
        typeEffect();
    }
    
    // Initialize stats observer
    const statsElement = document.getElementById('stats');
    if (statsElement) {
        observer.observe(statsElement);
    }
    
    // Initialize testimonial slider auto-slide
    if (document.querySelectorAll('.testimonial-card').length > 0) {
        setInterval(() => slideTestimonial(1), 5000);
    }
    
    // Add link to resources page in main navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const resourcesLink = navLinks.querySelector('a[href="#resources"]');
        if (resourcesLink) {
            resourcesLink.href = 'resources.html';
            resourcesLink.textContent = 'Resources';
        }
    }
    
    console.log('Index page initialization complete');
}

// Add navigation links between pages
function addNavigationLinks() {
    // Add link to home page in resources sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const spaecsHeader = sidebar.querySelector('.sidebar-header h2');
        if (spaecsHeader) {
            spaecsHeader.style.cursor = 'pointer';
            spaecsHeader.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
} 