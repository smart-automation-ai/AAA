// Smart Automation AI - Enhanced Analytics & Performance Monitoring
// Updated: 2025-06-14

class WebsiteAnalytics {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {
            pageViews: 0,
            interactions: 0,
            reviewsGenerated: 0,
            formSubmissions: 0,
            errors: 0
        };
        this.init();
    }

    init() {
        this.setupGoogleAnalytics();
        this.setupPerformanceMonitoring();
        this.setupUserBehaviorTracking();
        this.setupErrorTracking();
        this.setupBusinessMetrics();
    }

    // Google Analytics 4 Setup
    setupGoogleAnalytics() {
        // Replace 'G-XXXXXXXXXX' with your actual GA4 measurement ID
        const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
        
        // Load Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
                'custom_parameter_1': 'business_type',
                'custom_parameter_2': 'user_location'
            }
        });

        // Make gtag globally available
        window.gtag = gtag;

        // Track initial page view
        this.trackPageView();
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.trackMetric('LCP', entry.startTime);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'web_vitals', {
                            name: 'LCP',
                            value: entry.startTime,
                            event_category: 'Performance'
                        });
                    }
                }
            }).observe({entryTypes: ['largest-contentful-paint']});

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.trackMetric('FID', entry.processingStart - entry.startTime);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'web_vitals', {
                            name: 'FID',
                            value: entry.processingStart - entry.startTime,
                            event_category: 'Performance'
                        });
                    }
                }
            }).observe({entryTypes: ['first-input']});

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.trackMetric('CLS', clsValue);
            }).observe({entryTypes: ['layout-shift']});
        }

        // Page Load Performance
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            this.trackMetric('page_load_time', loadTime);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'page_load',
                    value: Math.round(loadTime)
                });
            }
        });
    }

    // User Behavior Tracking
    setupUserBehaviorTracking() {
        // Scroll depth tracking
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll', {
                            event_category: 'Engagement',
                            event_label: `${scrollPercent}%`
                        });
                    }
                }
            }
        });

        // Click tracking for important elements
        document.addEventListener('click', (e) => {
            const element = e.target.closest('a, button, .btn');
            if (element) {
                const elementText = element.textContent.trim();
                const elementClass = element.className;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'User Interaction',
                        event_label: elementText || elementClass,
                        value: 1
                    });
                }
                
                this.metrics.interactions++;
            }
        });

        // Form interaction tracking
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, select, textarea')) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_start', {
                        event_category: 'Form Interaction',
                        event_label: e.target.name || e.target.id
                    });
                }
            }
        }, true);
    }

    // Error Tracking
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('JavaScript Error', e.message, e.filename, e.lineno);
            this.metrics.errors++;
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('Promise Rejection', e.reason);
            this.metrics.errors++;
        });

        // Resource loading errors
        document.addEventListener('error', (e) => {
            if (e.target !== window) {
                this.trackError('Resource Error', `Failed to load: ${e.target.src || e.target.href}`);
            }
        }, true);
    }

    // Business-Specific Metrics
    setupBusinessMetrics() {
        // Track review generator usage
        const originalGenerateResponse = window.generateResponse;
        if (originalGenerateResponse) {
            window.generateResponse = async () => {
                this.metrics.reviewsGenerated++;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'review_response_generated', {
                        event_category: 'Business Tool Usage',
                        value: 1
                    });
                }
                
                return await originalGenerateResponse();
            };
        }

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || 'unknown_form';
            
            this.metrics.formSubmissions++;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    event_category: 'Lead Generation',
                    event_label: formId,
                    value: 1
                });
            }
        });
    }

    // Utility Methods
    trackPageView(path = window.location.pathname) {
        this.metrics.pageViews++;
        
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-XXXXXXXXXX', {
                page_path: path
            });
        }
    }

    trackMetric(name, value) {
        console.log(`Performance Metric - ${name}: ${value}`);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'custom_metric', {
                metric_name: name,
                metric_value: value,
                event_category: 'Performance'
            });
        }
    }

    trackError(type, message, source = '', line = 0) {
        console.error(`${type}: ${message}`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${type}: ${message}`,
                fatal: false,
                event_category: 'Error'
            });
        }
    }

    // Lead Quality Scoring
    scoreLeadQuality(formData) {
        let score = 0;
        
        // Company size scoring
        const companySize = formData.employees;
        if (companySize === '1000+') score += 30;
        else if (companySize === '201-1000') score += 25;
        else if (companySize === '51-200') score += 15;
        else score += 5;
        
        // Industry scoring
        const highValueIndustries = ['manufacturing', 'healthcare', 'finance'];
        if (highValueIndustries.includes(formData.industry)) {
            score += 20;
        }
        
        // Requirements length (shows engagement)
        if (formData.requirements && formData.requirements.length > 100) {
            score += 15;
        }
        
        return score;
    }

    // Business Intelligence Dashboard
    getDashboardData() {
        return {
            ...this.metrics,
            sessionDuration: Math.round((performance.now() - this.startTime) / 1000),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    // Export data for external analysis
    exportAnalytics() {
        const data = this.getDashboardData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.siteAnalytics = new WebsiteAnalytics();
    });
} else {
    window.siteAnalytics = new WebsiteAnalytics();
}

// Tipton County Business Intelligence
class TiptonCountyBI {
    constructor() {
        this.localBusinessData = {
            targetIndustries: ['restaurant', 'auto-repair', 'beauty-salon', 'dental', 'real-estate', 'retail'],
            serviceArea: ['Covington', 'Atoka', 'Brighton', 'Munford'],
            marketSize: 500,
            averageContractValue: 4800
        };
    }

    trackLocalEngagement(city, industry) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'local_business_interest', {
                event_category: 'Geographic',
                event_label: `${city}_${industry}`,
                custom_parameter_1: industry,
                custom_parameter_2: city
            });
        }
    }

    calculateMarketPenetration() {
        const currentClients = window.siteAnalytics?.metrics.formSubmissions || 0;
        return (currentClients / this.localBusinessData.marketSize * 100).toFixed(2);
    }
}

// Initialize Tipton County specific tracking
window.tiptonBI = new TiptonCountyBI();