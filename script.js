document.addEventListener('DOMContentLoaded', function() {
    // --- Page Navigation Logic ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const allNavLinks = [...navLinks, ...mobileNavLinks];

    function showSection(hash) {
        const targetHash = hash || '#home';
        sections.forEach(section => section.classList.toggle('active', '#' + section.id === targetHash));
        allNavLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === targetHash));
        
        if (hash && document.querySelector(targetHash)) {
            // Smooth scroll for modern browsers
            document.querySelector(targetHash).scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, 0);
        }
    }

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetHash = this.getAttribute('href');
            // Update URL hash without jumping
            history.pushState(null, null, targetHash);
            // Manually trigger our showSection function
            showSection(targetHash);

            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Handle back/forward browser buttons
    window.addEventListener('popstate', () => showSection(window.location.hash));
    
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    
    // Initial load
    showSection(window.location.hash);

    // --- Faculty Modal Logic ---
    const facultyModal = document.getElementById('faculty-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalScheduleButton = document.getElementById('modal-schedule-button');
    const achievementsContainer = document.getElementById('modal-achievements');

    document.querySelectorAll('.faculty-card').forEach(card => {
        card.addEventListener('click', function() {
            const name = this.dataset.name;
            document.getElementById('modal-img').src = this.querySelector('img').src;
            document.getElementById('modal-name').textContent = name;
            document.getElementById('modal-instrument').textContent = this.dataset.instrument;
            document.getElementById('modal-bio').innerHTML = this.dataset.bio;
            
            achievementsContainer.innerHTML = '';
            if (this.dataset.achievements) {
                try {
                    const achievements = JSON.parse(this.dataset.achievements);
                    achievements.forEach(item => {
                        const itemEl = document.createElement('div');
                        itemEl.className = 'timeline-item';
                        itemEl.innerHTML = `
                            <div class="timeline-dot"></div>
                            <div class="text-sm text-gray-400">${item.date}</div>
                            <div class="font-semibold">${item.event}</div>
                        `;
                        achievementsContainer.appendChild(itemEl);
                    });
                } catch (e) {
                    console.error("Could not parse achievements JSON:", e);
                }
            }

            modalScheduleButton.textContent = `Schedule a Trial with ${name.split(' ')[0]}`;
            modalScheduleButton.dataset.teacherName = name;
            facultyModal.classList.add('active');
        });
    });

    const closeModal = () => facultyModal.classList.remove('active');
    modalCloseButton.addEventListener('click', closeModal);
    facultyModal.addEventListener('click', e => { if (e.target === facultyModal) closeModal(); });

    document.querySelectorAll('a[href="#book-trial"]').forEach(link => {
         link.addEventListener('click', function(e) {
            const teacherName = this.dataset.teacherName;
            if (teacherName) {
                document.getElementById('preferred-teacher').value = teacherName;
            }
            if (facultyModal.classList.contains('active')) {
                closeModal();
            }
        });
    });

    // --- Price Calculator Logic ---
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
        inputs.forEach(input => input.addEventListener('input', calculatePrice));
        inputs.forEach(input => input.addEventListener('change', calculatePrice));
        calculatePrice();
    }
});
