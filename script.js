document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Logic ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Active Navigation Link Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath || (currentPath === 'home.html' && linkPath === 'index.html') || (currentPath === '' && (linkPath === 'index.html' || linkPath === 'home.html'))) {
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
                const imgPos = this.dataset.imgPos || '50% 50%'; // Default to center-center

                // --- Media Logic ---
                if (videoUrl) {
                    modalImg.classList.add('hidden');
                    modalVideoContainer.classList.remove('hidden');
                    modalVideoIframe.src = videoUrl;
                } else {
                    modalVideoContainer.classList.add('hidden');
                    modalImg.classList.remove('hidden');
                    modalImg.src = imgSrc;
                    modalImg.style.objectPosition = imgPos; // This is the magic line!
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
                    } catch (e) { /* Fails gracefully if JSON is empty/invalid */ }
                }

                document.getElementById('modal-schedule-button').dataset.teacherName = name;
                facultyModal.classList.add('active');
            });
        });

        const closeModal = () => {
            facultyModal.classList.remove('active');
            // Stop video from playing in background
            modalVideoIframe.src = ''; 
        };

        modalCloseButton.addEventListener('click', closeModal);
        facultyModal.addEventListener('click', e => { 
            if (e.target === facultyModal) closeModal(); 
        });

        // Pre-fill teacher name on contact form
        document.getElementById('modal-schedule-button').addEventListener('click', function(e) {
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
                input.addEventListener('input', calculatePrice)
                input.addEventListener('change', calculatePrice)
            });
            calculatePrice();
        }
    }

    // --- Logic for Contact Page ---
    if (bodyId === 'contact-page') {
        // Check if a preferred teacher was passed from the team page
        const preferredTeacher = localStorage.getItem('preferredTeacher');
        if (preferredTeacher) {
            const teacherInput = document.getElementById('preferred-teacher');
            if (teacherInput) {
                teacherInput.value = preferredTeacher;
            }
            // Clear the stored item so it doesn't persist
            localStorage.removeItem('preferredTeacher');
        }
    }
});
