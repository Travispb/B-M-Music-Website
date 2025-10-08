document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Logic ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Active Navigation Link Logic ---
    const navLinks = document.querySelectorAll('header .nav-link'); // Scoped to header
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Page-Specific Logic ---
    const bodyId = document.body.id;

    // --- Logic for Home Page ---
    if (bodyId === 'home-page') {
        // Scroll-in animation
        const sections = document.querySelectorAll('.fade-in-section');
        if (sections.length > 0) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });
            sections.forEach(section => {
                observer.observe(section);
            });
        }

        // Testimonial Carousel
        const testimonialContainer = document.querySelector('#testimonial-carousel');
        if (testimonialContainer) {
            const slides = testimonialContainer.querySelectorAll('.testimonial-slide');
            const dots = document.querySelectorAll('.testimonial-dot');
            let currentSlide = 0;
            let slideInterval;

            const showSlide = (index) => {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('hidden', i !== index);
                });
                dots.forEach((dot, i) => {
                    dot.classList.toggle('bg-white', i === index);
                    dot.classList.toggle('bg-gray-500', i !== index);
                });
                currentSlide = index;
            };

            const nextSlide = () => {
                showSlide((currentSlide + 1) % slides.length);
            };

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    clearInterval(slideInterval);
                    slideInterval = setInterval(nextSlide, 5000); // Restart interval
                });
            });

            if (slides.length > 0) {
                showSlide(0);
                slideInterval = setInterval(nextSlide, 5000);
            }
        }
        
        // Fetch and display upcoming events
        const eventsContainer = document.getElementById('upcoming-events-container');
        const seeAllEventsLink = document.getElementById('see-all-events-link');
        if (eventsContainer) {
            fetch('events.html')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const eventsDoc = parser.parseFromString(html, 'text/html');
                    const eventCards = eventsDoc.querySelectorAll('.event-card');
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcomingEvents = Array.from(eventCards)
                        .map(card => {
                            const dateStr = card.dataset.date;
                            if (!dateStr) return null;
                            const eventDate = new Date(dateStr + 'T00:00:00');
                            return { element: card, date: eventDate, id: dateStr };
                        })
                        .filter(event => event && event.date >= today)
                        .sort((a, b) => a.date - b.date);
                    
                    eventsContainer.innerHTML = ''; // Clear loading message

                    if (upcomingEvents.length > 0) {
                        const nextThreeEvents = upcomingEvents.slice(0, 3);
                        nextThreeEvents.forEach(event => {
                            const link = document.createElement('a');
                            link.href = `events.html#event-${event.id}`;
                            const clonedCard = event.element.cloneNode(true);
                            clonedCard.classList.remove('hover:scale-105');
                            link.appendChild(clonedCard);
                            eventsContainer.appendChild(link);
                        });
                    } else {
                        eventsContainer.innerHTML = `
                            <div class="bg-[#2a2a2a] p-8 rounded-lg shadow-lg border border-gray-700 lg:col-span-3">
                                <p class="text-xl text-gray-300">No upcoming events. Check back soon!</p>
                            </div>`;
                        if (seeAllEventsLink) seeAllEventsLink.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                    eventsContainer.innerHTML = `
                        <div class="bg-[#2a2a2a] p-8 rounded-lg shadow-lg border border-gray-700 lg:col-span-3">
                            <p class="text-xl text-red-500">Could not load events.</p>
                        </div>`;
                });
        }
    }

    // --- Logic for Team Page ---
    if (bodyId === 'team-page') {
        const facultyModal = document.getElementById('faculty-modal');
        const modalCloseButton = document.getElementById('modal-close-button');
        const modalImg = document.getElementById('modal-img');
        const modalVideoContainer = document.getElementById('modal-video-container');
        const modalVideoIframe = document.getElementById('modal-video-iframe');
        const achievementsContainer = document.getElementById('modal-achievements');

        document.querySelectorAll('.faculty-card').forEach(card => {
            card.addEventListener('click', function() {
                const name = this.dataset.name;
                const videoUrl = this.dataset.video;
                const imgSrc = this.dataset.imgSrc;
                const imgPos = this.dataset.imgPos || '50% 50%';

                if (videoUrl) {
                    modalImg.classList.add('hidden');
                    modalVideoContainer.classList.remove('hidden');
                    modalVideoIframe.src = videoUrl;
                } else {
                    modalVideoContainer.classList.add('hidden');
                    modalImg.classList.remove('hidden');
                    modalImg.src = imgSrc;
                    modalImg.style.objectPosition = imgPos;
                }

                document.getElementById('modal-name').textContent = name;
                document.getElementById('modal-instrument').textContent = this.dataset.instrument;
                document.getElementById('modal-bio').innerHTML = this.dataset.bio;
                
                achievementsContainer.innerHTML = '';
                if(this.dataset.achievements) {
                    try {
                        const achievements = JSON.parse(this.dataset.achievements);
                        achievements.forEach(item => {
                            const itemEl = document.createElement('div');
                            itemEl.className = 'timeline-item';
                            itemEl.innerHTML = `<div class="timeline-dot"></div><div class="text-sm text-gray-400">${item.date}</div><div class="font-semibold">${item.event}</div>`;
                            achievementsContainer.appendChild(itemEl);
                        });
                    } catch (e) { /* Fails gracefully */ }
                }

                document.getElementById('modal-schedule-button').dataset.teacherName = name;
                facultyModal.classList.add('active');
            });
        });

        const closeModal = () => {
            facultyModal.classList.remove('active');
            modalVideoIframe.src = ''; 
        };

        modalCloseButton.addEventListener('click', closeModal);
        facultyModal.addEventListener('click', e => { 
            if (e.target === facultyModal) closeModal(); 
        });

        document.getElementById('modal-schedule-button').addEventListener('click', function() {
            const teacherName = this.dataset.teacherName;
            if (teacherName) {
                localStorage.setItem('preferredTeacher', teacherName);
            }
        });
    }

    // --- Logic for Lessons Page ---
    if (bodyId === 'lessons-page') {
        const calculator = document.getElementById('price-calculator');
        if (calculator) {
            const PRICE_CONFIG = {
                basePrices: { 30: 40, 45: 55, 60: 70 },
                monthlyDiscount: 0.95,
                multiStudentDiscount: 0.95 
            };
            
            const inputs = calculator.querySelectorAll('input, select');
            const priceResultEl = document.getElementById('price-result');
            const pricePerEl = document.getElementById('price-per');

            function calculatePrice() {
                const duration = document.querySelector('input[name="duration"]:checked').value;
                const payment = document.querySelector('input[name="payment"]:checked').value;
                const students = parseInt(document.getElementById('students').value) || 1;

                let price = PRICE_CONFIG.basePrices[duration];
                let perText = "Per Lesson";

                if (payment === 'weekly') {
                    perText = "Per Week";
                } else if (payment === 'monthly') {
                    price = price * 4 * PRICE_CONFIG.monthlyDiscount;
                    perText = "Per Month";
                }
                
                price *= students;
                if (students > 1) {
                    price *= PRICE_CONFIG.multiStudentDiscount;
                }

                priceResultEl.textContent = `$${Math.round(price)}`;
                pricePerEl.textContent = perText;
            }
            inputs.forEach(input => {
                input.addEventListener('input', calculatePrice);
                input.addEventListener('change', calculatePrice);
            });
            calculatePrice();
        }
    }

    // --- Logic for Events Page ---
    if (bodyId === 'events-page') {
        const eventModal = document.getElementById('event-modal');
        const eventModalCloseButton = document.getElementById('event-modal-close-button');
        const allEventCards = document.querySelectorAll('.event-card');

        if (eventModal && eventModalCloseButton && allEventCards.length > 0) {
            const openEventModal = (card) => {
                const ds = card.dataset;
                document.getElementById('event-modal-title').textContent = ds.title;
                document.getElementById('event-modal-date').textContent = `${ds.day}, ${new Date(ds.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
                document.getElementById('event-modal-time').textContent = ds.time;
                document.getElementById('event-modal-description').textContent = ds.description;
                document.getElementById('event-modal-location').textContent = ds.location;
                
                const calendarBtn = document.getElementById('event-modal-calendar-button');
                if (ds.startIso && ds.endIso) {
                    const url = new URL('https://www.google.com/calendar/render');
                    url.searchParams.set('action', 'TEMPLATE');
                    url.searchParams.set('text', ds.title);
                    url.searchParams.set('dates', `${ds.startIso}/${ds.endIso}`);
                    url.searchParams.set('details', ds.description);
                    url.searchParams.set('location', ds.location);
                    url.searchParams.set('ctz', 'America/Chicago');
                    calendarBtn.href = url.toString();
                    calendarBtn.style.display = 'inline-block';
                } else {
                    calendarBtn.style.display = 'none';
                }
                eventModal.classList.add('active');
            };

            const closeEventModal = () => {
                eventModal.classList.remove('active');
            };

            allEventCards.forEach(card => {
                card.addEventListener('click', () => openEventModal(card));
            });

            eventModalCloseButton.addEventListener('click', closeEventModal);
            eventModal.addEventListener('click', e => {
                if (e.target === eventModal) closeEventModal();
            });

            // Check for URL hash to auto-open a modal
            const checkHash = () => {
                if (window.location.hash && window.location.hash.startsWith('#event-')) {
                    const eventId = window.location.hash.substring(7); // remove '#event-'
                    const cardToOpen = document.querySelector(`.event-card[data-date="${eventId}"]`);
                    if (cardToOpen) {
                        openEventModal(cardToOpen);
                    }
                }
            };
            checkHash();
        }
    }

    // --- Logic for Contact Page ---
    if (bodyId === 'contact-page') {
        const preferredTeacher = localStorage.getItem('preferredTeacher');
        if (preferredTeacher) {
            const teacherInput = document.getElementById('preferred-teacher');
            if (teacherInput) {
                teacherInput.value = preferredTeacher;
            }
            localStorage.removeItem('preferredTeacher');
        }

        const form = document.getElementById('contact-form');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');

            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }

                const formData = new FormData(form);
                
                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        form.classList.add('hidden');
                        if (successMessage) { // Check if the element exists
                            successMessage.classList.remove('hidden');
                        }
                    } else {
                        form.classList.add('hidden');
                        if (errorMessage) { // Check if the element exists
                            errorMessage.classList.remove('hidden');
                        }
                        console.error('Google Apps Script Error:', data.error);
                    }
                })
                .catch(error => {
                    form.classList.add('hidden');
                    if (errorMessage) { // Check if the element exists
                        errorMessage.classList.remove('hidden');
                    }
                    console.error('Network Error:', error);
                });
            });
        }
    }


    // --- Gallery Filter & Lightbox Logic ---
    if (bodyId === 'gallery-page') {
        const galleryImages = [
            { src: 'https://placehold.co/600x400/333/d2b48c?text=Recital+1', category: 'Recitals', caption: 'Winter Recital Performance' },
            { src: 'https://placehold.co/600x400/444/d2b48c?text=Lesson+1', category: 'Lessons', caption: 'Piano Lesson with Yibing' },
            { src: 'https://placehold.co/600x400/555/d2b48c?text=Concert+1', category: 'Concerts', caption: 'Orchestra Concert' },
            { src: 'https://placehold.co/600x400/333/d2b48c?text=Event+1', category: 'Events', caption: 'Community Outreach Event' },
            { src: 'https://placehold.co/600x400/444/d2b48c?text=Recital+2', category: 'Recitals', caption: 'Spring Recital' },
            { src: 'https://placehold.co/600x400/555/d2b48c?text=Lesson+2', category: 'Lessons', caption: 'Cello Masterclass' },
            { src: 'https://placehold.co/600x400/333/d2b48c?text=Recital+3', category: 'Recitals', caption: 'Student Showcase' },
            { src: 'https://placehold.co/600x400/444/d2b48c?text=Event+2', category: 'Events', caption: 'Music Festival' },
            { src: 'https://placehold.co/600x400/555/d2b48c?text=Concert+2', category: 'Concerts', caption: 'Chamber Music Night' },
            { src: 'https://placehold.co/600x400/333/d2b48c?text=Lesson+3', category: 'Lessons', caption: 'Violin Practice' },
            { src: 'https://placehold.co/600x400/444/d2b48c?text=Recital+4', category: 'Recitals', caption: 'Holiday Performance' },
            { src: 'https://placehold.co/600x400/555/d2b48c?text=Event+3', category: 'Events', caption: 'Workshop with Guest Artist' },
        ];

        const galleryGrid = document.getElementById('gallery-grid');
        const filtersContainer = document.getElementById('gallery-filters');
        const noResultsEl = document.getElementById('no-results');
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');

        if (galleryGrid && filtersContainer && lightboxModal) {
            const categories = ['All Photos', ...new Set(galleryImages.map(img => img.category))];

            filtersContainer.innerHTML = categories.map(cat => `
                <button class="gallery-filter ${cat === 'All Photos' ? 'active' : ''}" data-filter="${cat}">${cat}</button>
            `).join('');

            galleryGrid.innerHTML = galleryImages.map((img, index) => `
                <div class="gallery-item" data-category="${img.category}" data-index="${index}" style="display: block;">
                    <img src="${img.src}" alt="${img.caption}" class="w-full h-full object-cover">
                    <div class="gallery-overlay">
                        <p class="font-semibold">${img.caption}</p>
                    </div>
                </div>
            `).join('');

            const filterButtons = filtersContainer.querySelectorAll('.gallery-filter');
            const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
            let currentImageIndex = 0;
            let visibleItems = [...galleryItems];

            function filterGallery(category) {
                visibleItems = [];
                let hasVisibleItems = false;
                galleryItems.forEach(item => {
                    const itemCategory = item.dataset.category;
                    const shouldShow = (category === 'All Photos' || itemCategory === category);
                    item.style.display = shouldShow ? 'block' : 'none';
                    if (shouldShow) {
                        visibleItems.push(item);
                        hasVisibleItems = true;
                    }
                });
                noResultsEl.style.display = hasVisibleItems ? 'none' : 'block';
            }

            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    const filter = this.dataset.filter;
                    filterGallery(filter);
                });
            });

            function showImage(index) {
                if (index < 0) index = visibleItems.length - 1;
                if (index >= visibleItems.length) index = 0;
                currentImageIndex = index;
                
                const item = visibleItems[currentImageIndex];
                const originalIndex = item.dataset.index;
                const imgData = galleryImages[originalIndex];

                lightboxImg.src = imgData.src;
                lightboxCaption.textContent = imgData.caption;
            }
            
            function openLightbox(clickedItem) {
                const itemIndexInVisible = visibleItems.indexOf(clickedItem);
                if(itemIndexInVisible !== -1) {
                    lightboxModal.classList.add('active');
                    showImage(itemIndexInVisible);
                }
            }

            galleryItems.forEach(item => {
                item.addEventListener('click', () => openLightbox(item));
            });

            function closeLightbox() {
                lightboxModal.classList.remove('active');
            }

            lightboxClose.addEventListener('click', closeLightbox);
            lightboxModal.addEventListener('click', e => {
                if (e.target === lightboxModal) closeLightbox();
            });
            lightboxPrev.addEventListener('click', () => showImage(currentImageIndex - 1));
            lightboxNext.addEventListener('click', () => showImage(currentImageIndex + 1));

            document.addEventListener('keydown', e => {
                if (!lightboxModal.classList.contains('active')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
                if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
            });
        }
    }
});

