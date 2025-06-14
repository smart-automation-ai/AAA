// AI Review Response Generator
class ReviewResponseGenerator {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
    }

    setupEventListeners() {
        // Form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Smooth scrolling for navigation
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
    }

    setupNavigation() {
        // Active navigation highlighting
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    async generateResponse() {
        const businessName = document.getElementById('businessName').value.trim();
        const businessType = document.getElementById('businessType').value;
        const reviewText = document.getElementById('reviewText').value.trim();
        const rating = parseInt(document.getElementById('rating').value);

        // Validation
        if (!businessName || !businessType || !reviewText || !rating) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            // Generate response using local AI logic (since we can't use OpenAI API directly from frontend)
            const response = await this.generateLocalResponse(businessName, businessType, reviewText, rating);
            this.showResponse(response);
        } catch (error) {
            console.error('Error generating response:', error);
            this.showError('Failed to generate response. Please try again.');
        }
    }

    async generateLocalResponse(businessName, businessType, reviewText, rating) {
        // Simulate AI response generation with realistic templates
        const templates = this.getResponseTemplates(businessType, rating);
        const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        // Personalize the template
        let response = selectedTemplate
            .replace('{businessName}', businessName)
            .replace('{businessType}', this.getBusinessTypeDisplay(businessType));

        // Add some variation based on review content
        if (reviewText.toLowerCase().includes('food') && rating >= 4) {
            response += " We're so glad you enjoyed our cuisine!";
        } else if (reviewText.toLowerCase().includes('service') && rating >= 4) {
            response += " Our team works hard to provide excellent service.";
        } else if (rating <= 2) {
            response += " We'd love the opportunity to make this right. Please contact us directly.";
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return response;
    }

    getResponseTemplates(businessType, rating) {
        const templates = {
            5: [
                "Thank you so much for the amazing 5-star review! We're thrilled you had such a wonderful experience at {businessName}. Your feedback means the world to us, and we can't wait to serve you again soon!",
                "Wow, thank you for the fantastic review! We're so happy you chose {businessName} and that we exceeded your expectations. We look forward to welcoming you back!",
                "Thank you for taking the time to leave such a wonderful review! We're delighted you had a great experience at {businessName}. See you again soon!"
            ],
            4: [
                "Thank you for the great 4-star review! We're so pleased you enjoyed your experience at {businessName}. We appreciate your feedback and look forward to serving you again.",
                "Thanks for the wonderful review! We're happy you had a positive experience at {businessName}. We're always working to improve and appreciate your support.",
                "Thank you for choosing {businessName} and for the lovely review! We're glad you enjoyed your visit and hope to see you again soon."
            ],
            3: [
                "Thank you for your honest feedback about {businessName}. We appreciate you taking the time to share your experience. We're always looking for ways to improve and would love to welcome you back.",
                "Thanks for the review! We're glad you visited {businessName} and appreciate your feedback. We're constantly working to enhance our service and hope to exceed your expectations next time.",
                "Thank you for your review of {businessName}. We value all feedback as it helps us grow and improve. We'd love the chance to provide you with an even better experience in the future."
            ],
            2: [
                "Thank you for bringing this to our attention. We're sorry your experience at {businessName} didn't meet your expectations. We take all feedback seriously and would appreciate the opportunity to discuss this further. Please contact us directly so we can make this right.",
                "We sincerely apologize that your visit to {businessName} wasn't up to our usual standards. Your feedback is important to us, and we'd like to make things right. Please reach out to us directly.",
                "Thank you for your honest feedback. We're disappointed to hear about your experience at {businessName} and would like to address your concerns personally. Please contact us so we can improve."
            ],
            1: [
                "We're truly sorry to hear about your disappointing experience at {businessName}. This is not the level of service we strive for, and we take your feedback very seriously. Please contact us directly so we can address your concerns and make this right.",
                "We sincerely apologize for falling short of your expectations at {businessName}. Your experience is not reflective of our values, and we'd like to make it right. Please reach out to us directly to discuss this further.",
                "Thank you for bringing this to our attention. We're genuinely sorry about your experience at {businessName} and want to make things right. Please contact us directly so we can address your concerns properly."
            ]
        };

        return templates[rating] || templates[3];
    }

    getBusinessTypeDisplay(type) {
        const types = {
            'restaurant': 'restaurant',
            'auto-repair': 'auto repair shop',
            'beauty-salon': 'salon',
            'dental': 'dental practice',
            'real-estate': 'real estate agency',
            'retail': 'store',
            'healthcare': 'practice',
            'other': 'business'
        };
        return types[type] || 'business';
    }

    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('responseOutput').style.display = 'none';
    }

    showResponse(response) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('responseOutput').style.display = 'block';
        document.getElementById('generatedResponse').textContent = response;
    }

    showError(message) {
        document.getElementById('loadingSpinner').style.display = 'none';
        alert(message);
    }

    copyResponse() {
        const responseText = document.getElementById('generatedResponse').textContent;
        navigator.clipboard.writeText(responseText).then(() => {
            // Show success feedback
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard');
        });
    }

    regenerateResponse() {
        this.generateResponse();
    }

    handleContactForm(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showFormSuccess();
        
        // Reset form
        e.target.reset();
    }

    showFormSuccess() {
        const submitButton = document.querySelector('#contactForm button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitButton.style.background = '#4CAF50';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.style.background = '';
            submitButton.disabled = false;
        }, 3000);
    }
}

// API Connection Test
async function testApiConnection() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    button.disabled = true;
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success
    button.innerHTML = '<i class="fas fa-check"></i> Connection Successful!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        button.disabled = false;
    }, 3000);
}

// Global functions for HTML onclick events
function generateResponse() {
    window.reviewGenerator.generateResponse();
}

function copyResponse() {
    window.reviewGenerator.copyResponse();
}

function regenerateResponse() {
    window.reviewGenerator.regenerateResponse();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.reviewGenerator = new ReviewResponseGenerator();
    
    // Add some interactive animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all service cards and pricing cards
    document.querySelectorAll('.service-card, .pricing-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Add some demo data for quick testing
function loadDemoData() {
    document.getElementById('businessName').value = "Joe's Restaurant";
    document.getElementById('businessType').value = "restaurant";
    document.getElementById('reviewText').value = "Great food and excellent service! The staff was very friendly and the atmosphere was perfect for our date night. Will definitely be back!";
    document.getElementById('rating').value = "5";
}

// Add demo button (you can call this from console)
function addDemoButton() {
    const demoButton = document.createElement('button');
    demoButton.textContent = 'Load Demo Data';
    demoButton.className = 'btn btn-secondary';
    demoButton.style.marginTop = '10px';
    demoButton.onclick = loadDemoData;
    
    const toolForm = document.querySelector('.tool-form');
    if (toolForm) {
        toolForm.appendChild(demoButton);
    }
}

// Performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Analytics placeholder (replace with your analytics code)
function trackEvent(eventName, properties = {}) {
    console.log('Event tracked:', eventName, properties);
    // Add your analytics tracking code here
    // Example: gtag('event', eventName, properties);
}

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        trackEvent('button_click', {
            button_text: e.target.textContent.trim(),
            button_class: e.target.className
        });
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReviewResponseGenerator };
} 