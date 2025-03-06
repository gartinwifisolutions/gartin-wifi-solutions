// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mobile navigation toggle
const createMobileNav = () => {
    const nav = document.querySelector('.nav-container');
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.style.display = 'none';

    // Add mobile menu button styles
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block !important;
                font-size: 1.5rem;
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                position: absolute;
                right: 1rem;
                top: 1rem;
            }
            .nav-links {
                display: none !important;
            }
            .nav-links.active {
                display: flex !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Insert button into nav
    nav.insertBefore(mobileMenuBtn, nav.firstChild);
};

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Format the email body
            const mailtoLink = `mailto:Gartinwifisolutions@gmail.com?subject=Website Inquiry from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0AMessage:%0D%0A${message}`;
            
            // Open email client with pre-filled content
            window.location.href = mailtoLink;
            
            // Clear the form
            contactForm.reset();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Opening your email client...';
            contactForm.appendChild(successMessage);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
});

// Consultation form handling
document.addEventListener('DOMContentLoaded', function() {
    const consultationForm = document.getElementById('consultationForm');
    
    if (consultationForm) {
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 10) {
                value = `(${value.substring(0,3)}) ${value.substring(3,6)}-${value.substring(6,10)}`;
            }
            e.target.value = value;
        });

        // ZIP code validation for Central Ohio
        const zipInput = document.getElementById('zip');
        const centralOhioZips = [
            '43001', '43002', '43004', '43008', '43009', '43011', '43013', '43015', '43016', '43017',
            '43019', '43021', '43022', '43023', '43025', '43026', '43028', '43029', '43031', '43032',
            '43033', '43035', '43036', '43040', '43041', '43044', '43045', '43046', '43047', '43048',
            '43050', '43054', '43055', '43056', '43058', '43060', '43061', '43062', '43064', '43065',
            '43066', '43067', '43068', '43069', '43070', '43071', '43072', '43073', '43074', '43076',
            '43077', '43078', '43080', '43081', '43082', '43083', '43084', '43085', '43086', '43093',
            '43102', '43103', '43105', '43106', '43109', '43110', '43112', '43113', '43115', '43116',
            '43119', '43123', '43125', '43126', '43137', '43140', '43142', '43143', '43144', '43145',
            '43146', '43147', '43148', '43150', '43151', '43152', '43153', '43154', '43155', '43156',
            '43157', '43158', '43160', '43162', '43164', '43194', '43195', '43196', '43198', '43199',
            '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211',
            '43212', '43213', '43214', '43215', '43216', '43217', '43218', '43219', '43220', '43221',
            '43222', '43223', '43224', '43226', '43227', '43228', '43229', '43230', '43231', '43232',
            '43234', '43235', '43236', '43240', '43251', '43260', '43266', '43268', '43270', '43271',
            '43272', '43279', '43287', '43291'
        ];

        zipInput.addEventListener('input', function(e) {
            const zip = e.target.value;
            if (zip.length === 5) {
                if (!centralOhioZips.includes(zip)) {
                    zipInput.setCustomValidity('Sorry, we currently only service Central Ohio area.');
                } else {
                    zipInput.setCustomValidity('');
                }
            }
        });

        consultationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            const formData = {
                name: document.getElementById('name').value,
                address: document.getElementById('address').value,
                address2: document.getElementById('address2').value || '',
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value || 'No additional details provided'
            };

            try {
                const response = await fetch('/submit-consultation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.innerHTML = `
                        <div class="success-content">
                            <h3>Thank You!</h3>
                            <p>Your consultation request has been submitted successfully.</p>
                            <p>We'll contact you within 24 hours to schedule your consultation.</p>
                        </div>
                    `;
                    
                    // Replace form with success message
                    consultationForm.style.opacity = '0';
                    setTimeout(() => {
                        consultationForm.parentNode.replaceChild(successMessage, consultationForm);
                        successMessage.style.opacity = '1';
                    }, 300);
                } else {
                    throw new Error('Failed to submit form');
                }
            } catch (error) {
                console.error('Error:', error);
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'There was an error submitting your request. Please try again or contact us directly.';
                
                // Insert error message before the submit button
                submitButton.parentNode.insertBefore(errorDiv, submitButton);
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Consultation Request';
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
            }
        });
    }
});

// Mobile Menu Handler with Military Precision
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
});

// Scroll animations
const createScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation classes and observers to elements
    const animateElements = document.querySelectorAll('.service-card, .feature, .contact-form');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
};

// Handle navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createMobileNav();

    // Initialize mobile navigation
    const nav = document.querySelector('.nav-container');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        const navLinksItems = document.querySelectorAll('.nav-links a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // Initialize scroll animations
    createScrollAnimations();
});

// Add scroll-based header styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.backgroundColor = 'var(--white)';
        header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
});
