let currentStep = 0;
const totalSteps = 9; // 0-9 (10 steps total)

// Step configurations
const steps = [
    { id: 0, name: 'Introduction', file: '0-introduction.html' },
    { id: 1, name: 'Project Setup', file: '1-project-setup.html' },
    { id: 2, name: 'TypeScript Types', file: '2-typescript-types.html' },
    { id: 3, name: 'PartyKit Server', file: '3-partykit-server.html' },
    { id: 4, name: 'Home Page Setup', file: '4-home-page-setup.html' },
    { id: 5, name: 'Poll Creation Form', file: '5-poll-creation-form.html' },
    { id: 6, name: 'Poll Page Setup', file: '6-poll-page-setup.html' },
    { id: 7, name: 'Real-time Voting', file: '7-realtime-voting.html' },
    { id: 8, name: 'Running the App', file: '8-running-app.html' },
    { id: 9, name: 'Deployment', file: '9-deployment.html' }
];

async function loadStepContent(stepNumber) {
    const step = steps[stepNumber];
    if (!step) return;

    try {
        const response = await fetch(`steps/${step.file}`);
        if (!response.ok) throw new Error(`Failed to load step ${stepNumber}`);
        
        const content = await response.text();
        const contentWrapper = document.querySelector('.content-wrapper');
        contentWrapper.innerHTML = content;
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach(indicator => {
            indicator.textContent = `Step ${stepNumber + 1} of ${totalSteps + 1}`;
        });
        
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('step', stepNumber);
        window.history.pushState({ step: stepNumber }, '', url);
        
    } catch (error) {
        console.error('Error loading step content:', error);
        // Fallback to showing error message
        const contentWrapper = document.querySelector('.content-wrapper');
        contentWrapper.innerHTML = `
            <div class="error">
                <h1>Error Loading Step</h1>
                <p>Sorry, we couldn't load the content for step ${stepNumber + 1}. Please try again.</p>
            </div>
        `;
    }
}

function showStep(stepNumber) {
    // Update sidebar navigation
    document.querySelectorAll('.step-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');

    currentStep = stepNumber;

    // Load step content dynamically
    loadStepContent(stepNumber);

    // Scroll to top
    window.scrollTo(0, 0);
}

function nextStep() {
    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    }
}

function previousStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

// Handle step navigation clicks
function setupNavigation() {
    document.querySelectorAll('.step-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const stepNumber = parseInt(e.currentTarget.dataset.step);
            showStep(stepNumber);
        });
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        previousStep();
    } else if (e.key === 'ArrowRight') {
        nextStep();
    }
});

// Sidebar toggle functionality
function toggleSidebar() {
    const container = document.querySelector('.container');
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggle-icon');
    
    container.classList.toggle('collapsed');
    sidebar.classList.toggle('collapsed');
    
    // Update toggle icon
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.textContent = '→';
    } else {
        toggleIcon.textContent = '←';
    }
}

// Auto-collapse on mobile
function checkMobile() {
    const container = document.querySelector('.container');
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth <= 768) {
        container.classList.add('collapsed');
        sidebar.classList.add('collapsed');
        document.getElementById('toggle-icon').textContent = '→';
    }
}

// Initialize from URL or default to step 0
function initializeApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    const initialStep = stepParam ? parseInt(stepParam) : 0;
    
    // Validate step number
    const validStep = Math.max(0, Math.min(initialStep, totalSteps));
    
    // Setup navigation
    setupNavigation();
    
    // Check mobile layout
    checkMobile();
    
    // Show initial step
    showStep(validStep);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    const step = e.state?.step || 0;
    showStep(step);
});

// Check on load and resize
window.addEventListener('load', initializeApp);
window.addEventListener('resize', checkMobile);

// Export functions for global access
window.showStep = showStep;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.toggleSidebar = toggleSidebar;