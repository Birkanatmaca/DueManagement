// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Login button click handler
document.querySelector('.login-btn').addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Aidat Takip Sistemi yakında açılacak! Üye girişi için hazırlanıyor...', 'info');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.99)';
        navbar.style.boxShadow = '0 2px 20px rgba(220, 38, 38, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for Animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.vision-card, .program-card, .coach-card, .stat-item, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Map interaction
const contactMap = document.querySelector('.contact-map iframe');
if (contactMap) {
    contactMap.addEventListener('load', () => {
        console.log('Harita yüklendi');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-item h3');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / speed;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-placeholder');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});



// CTA Buttons click handlers
const primaryButton = document.querySelector('.cta-button.primary');
const secondaryButton = document.querySelector('.cta-button.secondary');

if (primaryButton) {
    primaryButton.addEventListener('click', () => {
        showNotification('Kayıt formu yakında açılacak!', 'info');
    });
}

if (secondaryButton) {
    secondaryButton.addEventListener('click', () => {
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Add hover effects to vision, program and coach cards
document.querySelectorAll('.vision-card, .program-card, .coach-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }
});

// Programs Slider
const programsSlider = {
    track: document.querySelector('.programs-track'),
    cards: document.querySelectorAll('.program-card'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    dots: document.querySelectorAll('.dot'),
    currentSlide: 0,
    cardsPerView: 3,
    totalSlides: 0,
    
    init() {
        if (!this.track) return;
        
        // Check screen size for responsive cards per view
        this.updateCardsPerView();
        this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
        this.updateSlider();
        this.bindEvents();
        
        // Update on window resize
        window.addEventListener('resize', () => {
            const oldCardsPerView = this.cardsPerView;
            this.updateCardsPerView();
            if (oldCardsPerView !== this.cardsPerView) {
                this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
                this.currentSlide = 0;
                this.updateSlider();
            }
        });
    },
    
    updateCardsPerView() {
        if (window.innerWidth <= 768) {
            this.cardsPerView = 1; // Mobil ve tablet: 1 kart
        } else if (window.innerWidth <= 1200) {
            this.cardsPerView = 2; // Orta desktop: 2 kart
        } else {
            this.cardsPerView = 3; // Büyük desktop: 3 kart
        }
    },
    
    updateSlider() {
        if (this.cardsPerView === 1) {
            // Mobil için basit slide geçişi
            const translateX = -(this.currentSlide * 100);
            this.track.style.transform = `translateX(${translateX}%)`;
        } else {
            // Desktop için çoklu kart geçişi
            const cardWidth = 100 / this.cardsPerView;
            const gapWidth = (2 * 100) / (this.cards.length * this.cardsPerView);
            const slideWidth = cardWidth + gapWidth;
            const translateX = -(this.currentSlide * slideWidth);
            this.track.style.transform = `translateX(${translateX}%)`;
        }
        
        // Update dots visibility and active state
        this.dots.forEach((dot, index) => {
            if (index < this.totalSlides) {
                dot.style.display = 'block';
                dot.classList.toggle('active', index === this.currentSlide);
            } else {
                dot.style.display = 'none';
            }
        });
        
        // Update dots for infinite loop (show correct dot even when looping)
        if (this.currentSlide >= this.totalSlides) {
            this.dots[0].classList.add('active');
            this.dots.forEach((dot, index) => {
                if (index !== 0) dot.classList.remove('active');
            });
        } else if (this.currentSlide < 0) {
            this.dots[this.totalSlides - 1].classList.add('active');
            this.dots.forEach((dot, index) => {
                if (index !== this.totalSlides - 1) dot.classList.remove('active');
            });
        }
        
        // Update button states - always active in infinite loop
        if (this.prevBtn) this.prevBtn.style.opacity = '1';
        if (this.nextBtn) this.nextBtn.style.opacity = '1';
        
        // Hide dots if only one slide
        if (this.totalSlides <= 1) {
            this.dots.forEach(dot => dot.style.display = 'none');
        }
    },
    
    nextSlide() {
        this.currentSlide++;
        if (this.currentSlide >= this.totalSlides) {
            this.currentSlide = 0;
        }
        this.updateSlider();
    },
    
    prevSlide() {
        this.currentSlide--;
        if (this.currentSlide < 0) {
            this.currentSlide = this.totalSlides - 1;
        }
        this.updateSlider();
    },
    
    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateSlider();
    },
    
    bindEvents() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });
        
        this.track.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            this.track.addEventListener('mouseup', (e) => {
                endX = e.clientX;
                this.handleSwipe();
            }, { once: true });
        });
    },
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
};

// Hero Image Slider
const heroSlider = {
    slides: document.querySelectorAll('.hero-slide'),
    dots: document.querySelectorAll('.hero-dot'),
    currentSlide: 0,
    interval: null,
    slideInterval: 4000, // 4 saniye
    
    init() {
        if (this.slides.length === 0) return;
        
        this.bindEvents();
        this.startAutoSlide();
    },
    
    showSlide(index) {
        // Remove active class from all slides and dots
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
        
        this.currentSlide = index;
    },
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    },
    
    prevSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.showSlide(prevIndex);
    },
    
    goToSlide(index) {
        this.showSlide(index);
        this.restartAutoSlide();
    },
    
    startAutoSlide() {
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.slideInterval);
    },
    
    stopAutoSlide() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    restartAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    },
    
    bindEvents() {
        // Dot click events
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        

        
        // Pause auto-slide on hover
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });
            
            heroSlider.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        }
        
        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        
        heroSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        heroSlider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });
        
        heroSlider.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            heroSlider.addEventListener('mouseup', (e) => {
                endX = e.clientX;
                this.handleSwipe();
            }, { once: true });
        });
    },
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
            this.restartAutoSlide();
        }
    }
};

// Initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    programsSlider.init();
    heroSlider.init();
});

// Coach Modal Functions
const coachData = {
    ahmet: {
        name: 'Orhan Şenel',
        title: 'Baş Antrenör',
        icon: 'fas fa-user-tie',
        image: 'images/orhan.jpg',
        description: 'Deneyimli antrenör Orhan Şenel, çocukların futbol gelişiminde uzman. Modern eğitim metodları ile çocukların hem teknik hem de karakter gelişimine odaklanır. Futbol sevgisini aşılayarak geleceğin yıldızlarını yetiştiriyor.',
        stats: {
            experience: '10+',
            students: '300+',
            license: 'UEFA B'
        },
        expertise: [
            'Teknik beceri geliştirme',
            'Takım oyunu stratejileri',
            'Fiziksel kondisyon',
            'Çocuk gelişimi ve psikolojisi'
        ]
    },
    mehmet: {
        name: 'Mehmet Kaya',
        title: 'Teknik Antrenör',
        icon: 'fas fa-user-graduate',
        image: null,
        description: 'Teknik beceriler ve taktik eğitiminde uzman. Modern futbol metodlarını çocuklara uyarlayan deneyimli antrenör. Özellikle pas, şut ve top kontrolü konularında uzmanlaşmış.',
        stats: {
            experience: '10+',
            students: '300+',
            license: 'UEFA B'
        },
        expertise: [
            'Teknik beceri eğitimi',
            'Pas ve şut teknikleri',
            'Top kontrolü geliştirme',
            'Taktik analiz'
        ]
    }
};

function openCoachModal(coachId) {
    const modal = document.getElementById('coachModal');
    const coach = coachData[coachId];
    
    if (coach) {
        // Update modal content
        document.getElementById('modalCoachName').textContent = coach.name;
        document.getElementById('modalCoachTitle').textContent = coach.title;
        document.getElementById('modalCoachDescription').textContent = coach.description;
        
        // Update coach image
        const modalCoachImage = document.getElementById('modalCoachImage');
        if (coach.image) {
            modalCoachImage.src = coach.image;
            modalCoachImage.style.display = 'block';
        } else {
            modalCoachImage.style.display = 'none';
        }
        
        // Update stats
        const statsContainer = document.querySelector('.modal-coach-stats');
        statsContainer.innerHTML = `
            <div class="modal-coach-stat">
                <span class="modal-stat-number">${coach.stats.experience}</span>
                <span class="modal-stat-label">Yıl Deneyim</span>
            </div>
            <div class="modal-coach-stat">
                <span class="modal-stat-number">${coach.stats.students}</span>
                <span class="modal-stat-label">Öğrenci</span>
            </div>
            <div class="modal-coach-stat">
                <span class="modal-stat-number">${coach.stats.license}</span>
                <span class="modal-stat-label">Lisans</span>
            </div>
        `;
        
        // Update expertise
        const expertiseContainer = document.querySelector('.modal-coach-expertise ul');
        expertiseContainer.innerHTML = coach.expertise.map(item => `<li>${item}</li>`).join('');
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCoachModal() {
    const modal = document.getElementById('coachModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('coachModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCoachModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCoachModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCoachModal();
        }
    });
}); 