// Enterprise AI Website Manager
class EnterpriseAIWebsite {
    constructor() {
        this.apiEndpoint = '/api/generate-response';
        this.currentTheme = localStorage.getItem('theme') || this.getSystemPreference();
        this.chatWidget = null;
        this.chatMessages = [];
        this.animationQueue = [];
        this.isInitialized = false;
        this.observers = new Map();
        this.init();
    }

    // Get system color scheme preference
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    async init() {
        try {
            // Initialize core functionality
            this.setupTheme();
            this.setupEventListeners();
            this.setupNavigation();
            this.setupAIChat();
            this.setupAnalytics();
            this.setupRealTimeUpdates();
            this.setupAnimations();
            this.setupIntersectionObserver();
            this.isInitialized = true;
            
            // Fire ready event
            this.onReady();
        } catch (error) {
            console.error('Failed to initialize website:', error);
            this.handleError(error, 'initialization');
        }
    }

    onReady() {
        document.body.classList.add('website-loaded');
        console.log('Enterprise AI Website initialized successfully');
    }

    handleError(error, context = 'general') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message if needed
        if (context === 'api' || context === 'chat') {
            this.showNotification('Service temporarily unavailable. Please try again later.', 'error');
        }

        // Log to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${context}: ${error.message}`,
                fatal: false
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Theme Management - Enhanced and Fixed
    setupTheme() {
        // Ensure theme is properly applied on page load
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Use saved theme, or fall back to system preference
        this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Apply theme immediately to prevent flash
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.documentElement.classList.add('theme-transition');
        
        // Update the toggle button
        this.updateThemeIcon();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', this.currentTheme);
                this.updateThemeIcon();
            }
        });
    }

    toggleTheme() {
        // Toggle between light and dark
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply theme with smooth transition
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Save preference
        localStorage.setItem('theme', this.currentTheme);
        
        // Update icon and accessibility
        this.updateThemeIcon();
        
        // Add visual feedback
        this.showThemeChangeNotification();
        
        // Log theme change
        console.log('Theme changed to:', this.currentTheme);
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i') || document.createElement('i');
        if (!themeToggle.contains(icon)) {
            themeToggle.appendChild(icon);
        }
        
        // Update icon based on current theme
        if (this.currentTheme === 'light') {
            icon.className = 'fas fa-moon';
            themeToggle.style.color = '#dc2626'; // Red color for moon
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            themeToggle.setAttribute('title', 'Switch to dark mode');
        } else {
            icon.className = 'fas fa-sun';
            themeToggle.style.color = '#ef4444'; // Bright red color for sun
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
            themeToggle.setAttribute('title', 'Switch to light mode');
        }
    }

    showThemeChangeNotification() {
        const message = this.currentTheme === 'dark' 
            ? '🌙 Switched to dark mode' 
            : '☀️ Switched to light mode';
        
        this.showNotification(message, 'info');
    }

    // Animation System
    setupAnimations() {
        // Set up CSS custom properties for animations
        document.querySelectorAll('[data-delay]').forEach(element => {
            const delay = element.dataset.delay;
            element.style.setProperty('--delay', delay + 's');
        });

        // Enhanced scroll-triggered animations
        this.setupScrollAnimations();
        
        // Trigger hero animations on load
        this.triggerHeroAnimations();
        
        // Setup parallax effects
        this.setupParallaxEffects();
        
        // Setup magnetic buttons
        this.setupMagneticButtons();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in-view');
                    
                    // Add staggered animation for child elements
                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in-view');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.service-card, .case-study-card, .pricing-card, .animate-on-scroll').forEach(element => {
            scrollObserver.observe(element);
        });
    }

    setupParallaxEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    setupMagneticButtons() {
        const magneticElements = document.querySelectorAll('.btn, .theme-toggle, .nav-link');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = 50;
                
                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    const moveX = x * strength * 0.3;
                    const moveY = y * strength * 0.3;
                    
                    element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                }
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }

    triggerHeroAnimations() {
        // Enhanced hero animations with better timing
        const heroElements = document.querySelectorAll('.hero .animate-fade-in, .hero .animate-slide-up');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150 + 300);
        });

        // Animate stat numbers with enhanced easing
        this.animateStatNumbers();
        
        // Add floating animation to hero elements
        this.setupFloatingElements();
    }

    setupFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-icon');
        
        floatingElements.forEach((element, index) => {
            // Add random movement
            setInterval(() => {
                const randomX = (Math.random() - 0.5) * 20;
                const randomY = (Math.random() - 0.5) * 20;
                const currentTransform = element.style.transform || '';
                
                element.style.transform = currentTransform + ` translate(${randomX}px, ${randomY}px)`;
                
                setTimeout(() => {
                    element.style.transform = currentTransform;
                }, 2000);
            }, 5000 + index * 1000);
        });
    }

    animateStatNumbers() {
        const statItems = document.querySelectorAll('.stat-item[data-value]');
        statItems.forEach(item => {
            const targetValue = parseInt(item.dataset.value);
            const numberElement = item.querySelector('.stat-number');
            const duration = 2500; // Increased duration for smoother animation
            const startTime = Date.now();
            
            const updateNumber = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Enhanced easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(targetValue * easeOutQuart);
                
                // Add number formatting
                const formattedValue = currentValue.toLocaleString();
                const suffix = targetValue === 85 ? '%' : targetValue === 500 ? '+' : '';
                numberElement.textContent = formattedValue + suffix;
                
                // Add pulsing effect at milestones
                if (currentValue % 50 === 0 && currentValue > 0) {
                    numberElement.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        numberElement.style.transform = 'scale(1)';
                    }, 150);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    // Final pulse animation
                    numberElement.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        numberElement.style.transform = 'scale(1)';
                    }, 200);
                }
            };
            
            // Delay animation start with stagger
            setTimeout(() => {
                updateNumber();
            }, 1000 + (Array.from(statItems).indexOf(item) * 200));
        });
    }

    // Enhanced intersection observer with better performance
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in-view');
                    
                    // Trigger specific animations based on element type
                    if (entry.target.classList.contains('service-card')) {
                        this.animateServiceCard(entry.target);
                    } else if (entry.target.classList.contains('pricing-card')) {
                        this.animatePricingCard(entry.target);
                    } else if (entry.target.classList.contains('case-study-card')) {
                        this.animateCaseStudyCard(entry.target);
                    }
                    
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.service-card, .pricing-card, .case-study-card, .dashboard-card, .animate-on-scroll').forEach(card => {
            observer.observe(card);
        });

        this.observers.set('intersection', observer);
    }

    animateServiceCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.9)';
        card.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        // Animate icon separately
        const icon = card.querySelector('.service-icon');
        if (icon) {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            }, 400);
        }
    }

    animatePricingCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) rotateX(15deg)';
        card.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) rotateX(0deg)';
        });
        
        // Animate price with special effect
        const price = card.querySelector('.pricing-amount');
        if (price) {
            setTimeout(() => {
                price.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
                price.style.webkitBackgroundClip = 'text';
                price.style.webkitTextFillColor = 'transparent';
                price.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    price.style.transform = 'scale(1)';
                }, 300);
            }, 600);
        }
    }

    animateCaseStudyCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-30px) rotateY(15deg)';
        card.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateX(0) rotateY(0deg)';
        });
        
        // Animate metrics with counter effect
        const metrics = card.querySelectorAll('.case-study-metric-value');
        metrics.forEach((metric, index) => {
            setTimeout(() => {
                const text = metric.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number) {
                    this.animateCounter(metric, 0, number, text.replace(/\d/g, ''), 1000);
                }
            }, 800 + index * 200);
        });
    }

    animateCounter(element, start, end, suffix, duration) {
        const startTime = Date.now();
        
        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    }

    // AI Chat System
    setupAIChat() {
        this.chatWidget = document.getElementById('aiChatWidget');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatFloatingBtn = document.getElementById('chatFloatingBtn');
        
        // Initialize with welcome message
        this.addBotMessage("👋 Hello! I'm your AI Assistant. I can help you learn about our enterprise solutions, pricing, and answer any questions about AI automation for your business.");
    }

    toggleChat() {
        if (this.chatWidget.style.display === 'none' || !this.chatWidget.style.display) {
            this.chatWidget.style.display = 'flex';
            this.chatFloatingBtn.style.display = 'none';
            this.hideNotification();
        } else {
            this.chatWidget.style.display = 'none';
            this.chatFloatingBtn.style.display = 'flex';
        }
    }

    closeChat() {
        this.chatWidget.style.display = 'none';
        this.chatFloatingBtn.style.display = 'flex';
    }

    minimizeChat() {
        this.chatWidget.style.height = this.chatWidget.style.height === '60px' ? '600px' : '60px';
        const chatBody = document.getElementById('chatBody');
        const chatInput = document.querySelector('.chat-input');
        
        if (this.chatWidget.style.height === '60px') {
            chatBody.style.display = 'none';
            chatInput.style.display = 'none';
        } else {
            chatBody.style.display = 'flex';
            chatInput.style.display = 'block';
        }
    }

    hideNotification() {
        const notification = document.querySelector('.chat-notification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message, showQuickActions = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let quickActionsHtml = '';
        if (showQuickActions) {
            quickActionsHtml = `
                <div class="quick-actions">
                    <button class="quick-action" data-message="Tell me about your enterprise solutions">
                        <i class="fas fa-cogs"></i>
                        Enterprise Solutions
                    </button>
                    <button class="quick-action" data-message="What are your pricing options?">
                        <i class="fas fa-dollar-sign"></i>
                        Pricing Info
                    </button>
                    <button class="quick-action" data-message="How can AI help my business?">
                        <i class="fas fa-lightbulb"></i>
                        AI Benefits
                    </button>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                ${quickActionsHtml}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add event listeners to quick actions
        const quickActions = messageDiv.querySelectorAll('.quick-action');
        quickActions.forEach(button => {
            button.addEventListener('click', () => {
                this.sendMessage(button.dataset.message);
            });
        });
    }

    showTyping() {
        document.getElementById('chatTyping').style.display = 'flex';
        this.scrollToBottom();
    }

    hideTyping() {
        document.getElementById('chatTyping').style.display = 'none';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendMessage(message) {
        if (!message.trim()) return;
        
        this.addUserMessage(message);
        this.chatInput.value = '';
        this.showTyping();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateAIResponse(message);
            this.addBotMessage(response);
        }, 1500);
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('enterprise') || lowerMessage.includes('solution')) {
            return "🚀 Our enterprise solutions include Intelligent Process Automation, AI Customer Experience Platform, and Predictive Analytics Suite. Each solution is designed to scale with your business and deliver measurable ROI. Would you like to know more about a specific solution?";
        }
        
        if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
            return "💰 We offer three tiers: Professional ($2,500/month), Enterprise ($7,500/month), and Enterprise Plus (custom pricing). All plans include 24/7 support and come with our ROI guarantee. Would you like to schedule a demo to discuss your specific needs?";
        }
        
        if (lowerMessage.includes('ai') || lowerMessage.includes('benefit')) {
            return "🎯 AI can transform your business by automating repetitive tasks, improving decision-making with data insights, enhancing customer experiences, and reducing operational costs by up to 85%. Our clients typically see 300% ROI in the first year. What specific business challenges are you looking to solve?";
        }
        
        if (lowerMessage.includes('demo') || lowerMessage.includes('consultation')) {
            return "📅 I'd be happy to arrange a personalized demo! Our solutions specialists can show you exactly how our AI can benefit your specific industry and use case. You can schedule a consultation using the 'Schedule Enterprise Demo' button in our contact section. What's your primary area of interest?";
        }
        
        if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
            return "🛠️ We provide 24/7 enterprise support with dedicated account managers, priority response times, and comprehensive training. Our support includes technical assistance, best practices guidance, and ongoing optimization recommendations. How can I help you get started?";
        }
        
        return "Thank you for your question! I'm here to help you understand how our AI solutions can transform your business. Feel free to ask about our enterprise solutions, pricing, implementation process, or schedule a personalized demo. What would you like to know more about?";
    }

    setupEventListeners() {
        try {
            // Enhanced theme toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }

            // Enhanced AI chat controls
            const aiChatToggle = document.getElementById('aiChatToggle');
            const chatFloatingBtn = document.getElementById('chatFloatingBtn');
            const chatMinimize = document.getElementById('chatMinimize');
            const chatClose = document.getElementById('chatClose');
            const chatSend = document.getElementById('chatSend');
            const chatInput = document.getElementById('chatInput');

            if (aiChatToggle) {
                aiChatToggle.addEventListener('click', () => this.toggleChat());
            }
            if (chatFloatingBtn) {
                chatFloatingBtn.addEventListener('click', () => this.toggleChat());
            }
            if (chatMinimize) {
                chatMinimize.addEventListener('click', () => this.minimizeChat());
            }
            if (chatClose) {
                chatClose.addEventListener('click', () => this.closeChat());
            }
            if (chatSend) {
                chatSend.addEventListener('click', () => {
                    const message = chatInput?.value?.trim();
                    if (message) {
                        this.sendMessage(message);
                    }
                });
            }
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const message = chatInput.value.trim();
                        if (message) {
                            this.sendMessage(message);
                        }
                    }
                });
            }

            // Form submission with enhanced error handling
            const contactForm = document.getElementById('contactForm') || document.getElementById('enterpriseContactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', this.handleContactForm.bind(this));
            }

            // Enhanced smooth scrolling for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    const target = document.querySelector(targetId);
                    if (target) {
                        this.smoothScrollTo(target);
                        this.trackEvent('navigation_click', {
                            target: targetId
                        });
                    }
                });
            });

            // Form input validation
            document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
                input.addEventListener('input', () => {
                    input.classList.remove('error');
                });
                
                input.addEventListener('focus', () => {
                    input.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    input.classList.remove('focused');
                });
            });

            // Enhanced button interactions
            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.classList.add('hover-effect');
                });
                
                button.addEventListener('mouseleave', () => {
                    button.classList.remove('hover-effect');
                });
            });

        } catch (error) {
            this.handleError(error, 'event_listeners');
        }
    }

    smoothScrollTo(target, offset = 100) {
        const targetPosition = target.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }

    setupNavigation() {
        // Active navigation highlighting
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
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
        try {
            // Get form elements with error handling
            const businessNameEl = document.getElementById('businessName');
            const businessTypeEl = document.getElementById('businessType');
            const reviewTextEl = document.getElementById('reviewText');
            const ratingEl = document.getElementById('rating');

            if (!businessNameEl || !businessTypeEl || !reviewTextEl || !ratingEl) {
                throw new Error('Form elements not found');
            }

            const businessName = businessNameEl.value.trim();
            const businessType = businessTypeEl.value;
            const reviewText = reviewTextEl.value.trim();
            const rating = parseInt(ratingEl.value);

            // Enhanced validation
            const validationErrors = this.validateFormInput({
                businessName,
                businessType,
                reviewText,
                rating
            });

            if (validationErrors.length > 0) {
                this.showError(validationErrors.join(', '));
                this.highlightErrorFields(validationErrors);
                return;
            }

            // Show loading with skeleton
            this.showLoading();

            // Add artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate response using local AI logic
            const response = await this.generateLocalResponse(businessName, businessType, reviewText, rating);
            this.showResponse(response);

            // Track successful generation
            this.trackEvent('response_generated', {
                business_type: businessType,
                rating: rating,
                response_length: response.length
            });

        } catch (error) {
            console.error('Error generating response:', error);
            this.handleError(error, 'response_generation');
            this.showError('Failed to generate response. Please try again.');
        }
    }

    validateFormInput({ businessName, businessType, reviewText, rating }) {
        const errors = [];

        if (!businessName || businessName.length < 2) {
            errors.push('Business name must be at least 2 characters');
        }

        if (!businessType) {
            errors.push('Please select a business type');
        }

        if (!reviewText || reviewText.length < 10) {
            errors.push('Review text must be at least 10 characters');
        }

        if (reviewText && reviewText.length > 1000) {
            errors.push('Review text must be less than 1000 characters');
        }

        if (!rating || rating < 1 || rating > 5) {
            errors.push('Please select a valid rating (1-5 stars)');
        }

        return errors;
    }

    highlightErrorFields(errors) {
        // Remove existing error highlights
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
            field.classList.remove('error');
        });

        // Add error highlights based on error messages
        if (errors.some(e => e.includes('Business name'))) {
            document.getElementById('businessName')?.classList.add('error');
        }
        if (errors.some(e => e.includes('business type'))) {
            document.getElementById('businessType')?.classList.add('error');
        }
        if (errors.some(e => e.includes('Review text'))) {
            document.getElementById('reviewText')?.classList.add('error');
        }
        if (errors.some(e => e.includes('rating'))) {
            document.getElementById('rating')?.classList.add('error');
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
        const loadingElement = document.getElementById('loadingSpinner');
        const responseElement = document.getElementById('responseOutput');
        
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner-enhanced">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                    <p>AI is crafting your response...</p>
                    <div class="loading-progress">
                        <div class="progress-bar-loading"></div>
                    </div>
                </div>
            `;
            
            // Add pulsing effect to loading text
            const loadingText = loadingElement.querySelector('p');
            if (loadingText) {
                let dots = 0;
                const originalText = loadingText.textContent;
                const interval = setInterval(() => {
                    dots = (dots + 1) % 4;
                    loadingText.textContent = originalText + '.'.repeat(dots);
                }, 500);
                
                // Store interval to clear it later
                loadingElement.dataset.interval = interval;
            }
        }
        
        if (responseElement) {
            responseElement.style.display = 'none';
        }

        // Add skeleton loading to response area
        this.showSkeletonLoader();
    }

    showSkeletonLoader() {
        const outputArea = document.querySelector('.tool-output');
        if (!outputArea) return;

        const skeletonHTML = `
            <div class="skeleton-loader">
                <div class="skeleton-text skeleton" style="width: 80%;"></div>
                <div class="skeleton-text skeleton" style="width: 95%;"></div>
                <div class="skeleton-text skeleton" style="width: 70%;"></div>
                <div class="skeleton-text skeleton" style="width: 90%;"></div>
                <div class="skeleton-button skeleton"></div>
            </div>
        `;

        let skeletonContainer = outputArea.querySelector('.skeleton-container');
        if (!skeletonContainer) {
            skeletonContainer = document.createElement('div');
            skeletonContainer.className = 'skeleton-container';
            outputArea.appendChild(skeletonContainer);
        }

        skeletonContainer.innerHTML = skeletonHTML;
        skeletonContainer.style.display = 'block';
    }

    hideSkeletonLoader() {
        const skeletonContainer = document.querySelector('.skeleton-container');
        if (skeletonContainer) {
            skeletonContainer.style.display = 'none';
        }
    }

    showResponse(response) {
        const loadingElement = document.getElementById('loadingSpinner');
        const responseElement = document.getElementById('responseOutput');
        const generatedResponseElement = document.getElementById('generatedResponse');
        
        // Clear loading interval
        if (loadingElement && loadingElement.dataset.interval) {
            clearInterval(parseInt(loadingElement.dataset.interval));
        }
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        this.hideSkeletonLoader();
        
        if (responseElement) {
            responseElement.style.display = 'block';
            responseElement.classList.add('response-fade-in');
        }
        
        if (generatedResponseElement) {
            // Enhanced typewriter effect with cursor
            this.typeWriterEffectEnhanced(generatedResponseElement, response);
        }

        // Show success animation with confetti effect
        setTimeout(() => {
            responseElement?.classList.add('success-animation');
            this.showSuccessConfetti();
        }, 1000);
    }

    typeWriterEffectEnhanced(element, text, speed = 25) {
        element.innerHTML = '<span class="typing-cursor">|</span>';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Remove cursor after completion
                setTimeout(() => {
                    element.innerHTML = text;
                }, 500);
            }
        };
        
        typeWriter();
    }

    showSuccessConfetti() {
        // Create confetti effect
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfettiParticle();
            }, i * 20);
        }
    }

    createConfettiParticle() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${['#dc2626', '#ef4444', '#f87171'][Math.floor(Math.random() * 3)]};
            top: 50%;
            left: 50%;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: confettiFall 3s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }

    showError(message) {
        const loadingElement = document.getElementById('loadingSpinner');
        const responseElement = document.getElementById('responseOutput');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        this.hideSkeletonLoader();
        
        // Show error notification instead of alert
        this.showNotification(message, 'error');
        
        // Shake the form for visual feedback
        const form = document.querySelector('.tool-form');
        if (form) {
            form.classList.add('error-shake');
            setTimeout(() => {
                form.classList.remove('error-shake');
            }, 500);
        }
    }

    copyResponse(event) {
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

    // Analytics & Real-time Features
    setupAnalytics() {
        this.metrics = {
            conversionRate: 4.8,
            avgOrderValue: 156,
            customerSat: 92,
            activeVisitors: 247,
            pageViewsPerMin: 89,
            avgSessionDuration: '4m 32s'
        };

        this.campaigns = [
            { name: 'Summer Promotion', roi: 324, ctr: 2.8, progress: 75 },
            { name: 'Product Launch', roi: 256, ctr: 3.2, progress: 60 }
        ];

        this.updateMetrics();
    }

    setupRealTimeUpdates() {
        // Update metrics every 5 seconds
        setInterval(() => this.updateMetrics(), 5000);
        
        // Update campaigns every 30 seconds
        setInterval(() => this.updateCampaigns(), 30000);
        
        // Update AI recommendations every minute
        setInterval(() => this.updateAIRecommendations(), 60000);
    }

    updateMetrics() {
        // Simulate real-time metric changes
        this.metrics.conversionRate += (Math.random() - 0.5) * 0.2;
        this.metrics.avgOrderValue += (Math.random() - 0.5) * 5;
        this.metrics.activeVisitors += Math.floor((Math.random() - 0.5) * 10);
        this.metrics.pageViewsPerMin += Math.floor((Math.random() - 0.5) * 5);

        // Update DOM
        document.getElementById('conversionRate').textContent = this.metrics.conversionRate.toFixed(1) + '%';
        document.getElementById('avgOrderValue').textContent = '$' + Math.round(this.metrics.avgOrderValue);
        document.getElementById('customerSat').textContent = this.metrics.customerSat + '%';
        document.getElementById('activeVisitors').textContent = this.metrics.activeVisitors;
        document.getElementById('pageViewsPerMin').textContent = this.metrics.pageViewsPerMin;
        document.getElementById('avgSessionDuration').textContent = this.metrics.avgSessionDuration;

        // Update trends
        this.updateMetricTrends();
    }

    updateMetricTrends() {
        const trends = document.querySelectorAll('.metric-trend');
        trends.forEach(trend => {
            const value = Math.random() > 0.5;
            trend.className = `metric-trend ${value ? 'positive' : 'negative'}`;
            trend.textContent = `${value ? '↑' : '↓'} ${(Math.random() * 2).toFixed(1)}%`;
        });
    }

    updateCampaigns() {
        // Simulate campaign progress updates
        this.campaigns.forEach(campaign => {
            campaign.progress = Math.min(100, campaign.progress + (Math.random() * 5));
            campaign.roi += (Math.random() - 0.5) * 10;
            campaign.ctr += (Math.random() - 0.5) * 0.2;
        });

        // Update campaign display
        const campaignList = document.getElementById('adCampaigns');
        campaignList.innerHTML = this.campaigns.map(campaign => `
            <div class="campaign-item">
                <div class="campaign-info">
                    <h4>${campaign.name}</h4>
                    <div class="campaign-stats">
                        <span>ROI: ${Math.round(campaign.roi)}%</span>
                        <span>CTR: ${campaign.ctr.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="campaign-progress">
                    <div class="progress-bar" style="width: ${campaign.progress}%"></div>
                </div>
            </div>
        `).join('');
    }

    updateAIRecommendations() {
        const recommendations = [
            { icon: 'lightbulb', text: 'Increase ad spend on high-performing campaigns' },
            { icon: 'chart-line', text: 'Optimize landing pages for better conversion' },
            { icon: 'users', text: 'Target new audience segments based on data' },
            { icon: 'clock', text: 'Adjust posting schedule for peak engagement' },
            { icon: 'bullseye', text: 'Refine targeting parameters for better ROI' },
            { icon: 'comments', text: 'Increase social media engagement strategies' }
        ];

        // Randomly select 3 recommendations
        const shuffledRecs = recommendations.toSorted(() => Math.random() - 0.5);
        const selectedRecs = shuffledRecs.slice(0, 3);

        // Update recommendations display
        document.getElementById('aiRecommendations').innerHTML = selectedRecs.map(rec => `
            <div class="recommendation-item">
                <i class="fas fa-${rec.icon}"></i>
                <p>${rec.text}</p>
            </div>
        `).join('');
    }

    refreshAdMetrics() {
        const button = document.querySelector('.btn-refresh');
        if (button) {
            button.style.transform = 'rotate(360deg)';
            this.updateCampaigns();
            setTimeout(() => button.style.transform = '', 500);
        }
    }

    // Performance optimization methods
    preloadCriticalResources() {
        // Preload critical fonts
        const fontUrls = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
        ];

        fontUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = 'style';
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    // Enhanced analytics tracking
    trackEvent(eventName, properties = {}) {
        try {
            // Console logging for development
            console.log('Event tracked:', eventName, properties);
            
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, properties);
            }
            
            // Custom analytics endpoint (if available)
            if (this.analyticsEndpoint) {
                fetch(this.analyticsEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event: eventName,
                        properties: properties,
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        userAgent: navigator.userAgent
                    })
                }).catch(error => {
                    console.warn('Analytics tracking failed:', error);
                });
            }
        } catch (error) {
            console.warn('Event tracking failed:', error);
        }
    }

    // Cleanup method for memory management
    cleanup() {
        // Clear intervals
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        if (this.campaignsInterval) {
            clearInterval(this.campaignsInterval);
        }
        if (this.recommendationsInterval) {
            clearInterval(this.recommendationsInterval);
        }

        // Disconnect observers
        this.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        this.observers.clear();

        // Clear animation queue
        this.animationQueue = [];
    }

    // Method to handle page visibility changes for performance
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause non-critical animations
            this.pauseAnimations();
        } else {
            // Page is visible, resume animations
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
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
    try {
        // Initialize the main website class
        window.enterpriseAI = new EnterpriseAIWebsite();
        
        // Backward compatibility for review generator
        window.reviewGenerator = window.enterpriseAI;
        
        // Add enhanced floating elements animation based on scroll
        let lastScrollTop = 0;
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const isScrollingDown = scrollTop > lastScrollTop;
            
            floatingIcons.forEach((icon, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = scrollTop * speed;
                icon.style.transform = `translateY(${isScrollingDown ? yPos : -yPos}px)`;
            });
            
            lastScrollTop = scrollTop;
        });

        // Add enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // ESC key to close chat or modals
            if (e.key === 'Escape') {
                if (window.enterpriseAI && window.enterpriseAI.chatWidget) {
                    const chatWidget = window.enterpriseAI.chatWidget;
                    if (chatWidget.style.display !== 'none') {
                        window.enterpriseAI.closeChat();
                    }
                }
            }
            
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Performance optimization: Preload critical resources
        window.enterpriseAI.preloadCriticalResources();

    } catch (error) {
        console.error('Failed to initialize website:', error);
    }
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