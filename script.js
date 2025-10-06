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
    }

    // --- Gallery Filter & Lightbox Logic ---
    if (bodyId === 'gallery-page') {
        // ... (existing gallery logic remains unchanged)
    }

    // --- NEW LOGIC for Events Page ---
    if (bodyId === 'events-page') {
        const eventModal = document.getElementById('event-modal');
        const eventModalCloseButton = document.getElementById('event-modal-close-button');
        const allEventCards = document.querySelectorAll('.event-card');

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

        // Run on initial load
        checkHash();
    }
});
