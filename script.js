// Initialisation après chargement du DOM
$(document).ready(function() {
    // Mettre à jour l'année dans le footer
    $('#current-year').text(new Date().getFullYear());
    
    // Navigation sticky au défilement
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });
    
    // Animation des statistiques
    function animateStats() {
        $('.stat-number').each(function() {
            const $this = $(this);
            const countTo = parseInt($this.attr('data-count'));
            const duration = 2000;
            const step = countTo / (duration / 30);
            let current = 0;
            
            const timer = setInterval(function() {
                current += step;
                if (current >= countTo) {
                    $this.text(countTo);
                    clearInterval(timer);
                } else {
                    $this.text(Math.floor(current));
                }
            }, 30);
        });
    }
    
    // Animation au défilement
    // Animation au défilement: remplacement par IntersectionObserver pour meilleure performance
    function initRevealOnScroll() {
        const animatedSelector = '.animate-fade-in, .animate-slide-up, .animate-slide-left, .animate-slide-right, .animate-zoom-in';
        const elements = document.querySelectorAll(animatedSelector);

        // Si IntersectionObserver n'est pas supporté, fallback vers l'ancienne fonction
        if (!('IntersectionObserver' in window)) {
            // fallback simple
            $(window).on('scroll', function() {
                $(animatedSelector).each(function() {
                    const $el = $(this);
                    const elementTop = $el.offset().top;
                    const elementBottom = elementTop + $el.outerHeight();
                    const viewportTop = $(window).scrollTop();
                    const viewportBottom = viewportTop + $(window).height();
                    if (elementBottom > viewportTop && elementTop < viewportBottom) {
                        $el.addClass('animated');
                    }
                });
            });
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;

                    // Si le conteneur possède plusieurs éléments enfants à animer, appliquer un stagger
                    // On cherche des enfants avec les classes animate-* à l'intérieur du target
                    if (target.classList.contains('hero-content') || target.classList.contains('section-header') || target.classList.contains('content-block') || target.classList.contains('image-stack')) {
                        // Inclure le target lui-même s'il a déjà une classe animate-*
                        const selector = '.animate-fade-in, .animate-slide-up, .animate-slide-left, .animate-slide-right, .animate-zoom-in';
                        let children = [];
                        try {
                            if (target.matches && target.matches(selector)) {
                                children.push(target);
                            }
                        } catch (e) {
                            // matches pourrait lancer sur certains nodes; ignore
                        }
                        children = children.concat(Array.from(target.querySelectorAll(selector)));
                        children.forEach((child, i) => {
                            // délai échelonné; certains éléments peuvent avoir un delay inline existant
                            const inlineDelay = parseFloat(child.style.animationDelay) || 0;
                            const delay = inlineDelay + (i * 120) / 1000; // en secondes
                            child.style.animationDelay = delay + 's';
                            child.classList.add('animated');
                        });
                    } else {
                        // élément simple
                        // respecter un delay inline si présent
                        entry.target.classList.add('animated');
                    }

                    // Si ce sont des statistiques, déclencher l'animation des chiffres
                    if (entry.target.classList.contains('stat-item') || entry.target.querySelector('.stat-number')) {
                        if (!entry.target.classList.contains('counted')) {
                            entry.target.classList.add('counted');
                            animateStats();
                        }
                    }

                    // Une fois animé, on arrête d'observer cet élément
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.15
        });

        elements.forEach(el => observer.observe(el));

        // Observer aussi certains conteneurs pour stagger (hero-content etc.)
    const containers = document.querySelectorAll('.hero-content, .section-header, .content-block, .image-stack, .section-padding, .col-lg-6, .services-track, .services-slider');
        containers.forEach(c => observer.observe(c));
    }
    
    // Exécuter l'initialisation des reveals
    initRevealOnScroll();

    // Forcer l'animation du hero au chargement si visible (stagger)
    const hero = document.querySelector('.hero-content');
    if (hero) {
        const children = hero.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-zoom-in, .animate-slide-left, .animate-slide-right');
        children.forEach((child, i) => {
            const inlineDelay = parseFloat(child.style.animationDelay) || 0;
            const delay = inlineDelay + (i * 120) / 1000;
            child.style.animationDelay = delay + 's';
            child.classList.add('animated');
        });
    }
    
    // Navigation fluide
    $('a[href*="#"]').on('click', function(e) {
        if (this.pathname === window.location.pathname && this.hash !== "") {
            e.preventDefault();
            
            const target = $(this.hash);
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 800);
            }
        }
    });
    
    // Effet de survol amélioré pour les cartes de service
    $('.service-card').hover(
        function() {
            $(this).find('.service-icon').css('transform', 'scale(1.1) rotate(5deg)');
        },
        function() {
            $(this).find('.service-icon').css('transform', 'scale(1) rotate(0)');
        }
    );
    
    // Effet de parallaxe sur l'image hero
    $(window).on('scroll', function() {
        const scrolled = $(window).scrollTop();
        $('.hero-image').css('transform', 'scale(' + (1 + scrolled/2000) + ')');
    });
    
    // Slider des témoignages
    function initTestimonialSlider() {
        let currentTestimonial = 0;
        const testimonials = $('.testimonial-item');
        const totalTestimonials = testimonials.length;
        const dots = $('.dot');
        
        function showTestimonial(index) {
            testimonials.removeClass('active');
            dots.removeClass('active');
            
            testimonials.eq(index).addClass('active');
            dots.eq(index).addClass('active');
            currentTestimonial = index;
        }
        
        // Navigation avec les boutons
        $('.next-testimonial').on('click', function() {
            let nextIndex = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(nextIndex);
        });
        
        $('.prev-testimonial').on('click', function() {
            let prevIndex = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
            showTestimonial(prevIndex);
        });
        
        // Navigation avec les dots
        dots.on('click', function() {
            const index = $(this).data('index');
            showTestimonial(index);
        });
        
        // Défilement automatique
        setInterval(function() {
            let nextIndex = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(nextIndex);
        }, 6000);
    }
    
    // Initialiser le slider de témoignages
    initTestimonialSlider();
    
    // Slider des services
    function initServicesSlider() {
    const track = $('.services-track');
    const cards = $('.service-card');
    let cardWidth = cards.outerWidth(true);
    const visibleCards = 3;
    let position = 0;
    let maxPosition = (cards.length - visibleCards) * cardWidth;
        
        $('.next-btn').on('click', function() {
            if (position > -maxPosition) {
                position -= cardWidth;
                track.css('transform', `translateX(${position}px)`);
            }
            updateSliderButtons();
        });
        
        $('.prev-btn').on('click', function() {
            if (position < 0) {
                position += cardWidth;
                track.css('transform', `translateX(${position}px)`);
            }
            updateSliderButtons();
        });
        
        function updateSliderButtons() {
            $('.prev-btn').prop('disabled', position >= 0);
            $('.next-btn').prop('disabled', position <= -maxPosition);
        }
        
        // Initialiser l'état des boutons
        updateSliderButtons();
        
        // Ajuster pour le responsive
        $(window).on('resize', function() {
            const newCardWidth = $('.service-card').outerWidth(true);
            // recalculer la position en fonction de l'ancienne largeur puis appliquer la nouvelle
            position = Math.round(position / cardWidth) * newCardWidth;
            cardWidth = newCardWidth;
            // recalculer la position maximale en fonction de la nouvelle largeur
            maxPosition = (cards.length - visibleCards) * cardWidth;
            track.css('transform', `translateX(${position}px)`);
            updateSliderButtons();
        });
    }
    
    // Initialiser le slider des services
    initServicesSlider();
    
    // Animation de la navigation mobile
    $('.navbar-toggler').on('click', function() {
        $('.navbar-collapse').toggleClass('show');
    });
    
    // Fermer le menu mobile après clic sur un lien
    $('.navbar-nav .nav-link').on('click', function() {
        $('.navbar-collapse').removeClass('show');
    });
    
    // Effet de chargement initial
    $(window).on('load', function() {
        $('body').addClass('loaded');
    });
    
    // Validation du formulaire de contact
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        // Validation basique
        let isValid = true;
        $(this).find('input, textarea').each(function() {
            if ($(this).val().trim() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        if (isValid) {
            // Simulation d'envoi
            const submitBtn = $(this).find('button[type="submit"]');
            const originalText = submitBtn.text();
            
            submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Envoi en cours...');
            submitBtn.prop('disabled', true);
            
            setTimeout(function() {
                submitBtn.html('<i class="fas fa-check me-2"></i>Message envoyé!');
                submitBtn.removeClass('btn-primary').addClass('btn-success');
                
                setTimeout(function() {
                    submitBtn.text(originalText);
                    submitBtn.prop('disabled', false);
                    submitBtn.removeClass('btn-success').addClass('btn-primary');
                    $('#contact-form')[0].reset();
                }, 3000);
            }, 2000);
        }
    });
    
    // Initialiser les tooltips Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});