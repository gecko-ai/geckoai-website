// ============================
// Gecko AI — Interactive Scripts
// ============================

document.addEventListener('DOMContentLoaded', () => {

    // ----- Sticky Nav -----
    const nav = document.getElementById('nav');
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ----- Mobile Nav Toggle -----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
    });
    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // ----- Scroll Reveal -----
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => revealObserver.observe(el));

    // ----- Savings Calculator -----
    const calcState = {
        battery: 10,
        solar: 'yes',
        ev: 'yes',
        tariff: 'tou'
    };

    // Handle option clicks
    document.querySelectorAll('.calc-options').forEach(group => {
        const field = group.dataset.field;
        group.querySelectorAll('.calc-option').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.calc-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                calcState[field] = btn.dataset.value;
                updateCalculator();
            });
        });
    });

    function updateCalculator() {
        // Simple estimation model based on typical UK battery/solar setups
        let baseWaste = 300; // base annual waste for any unoptimised setup
        
        // Battery size impact
        const batterySize = parseInt(calcState.battery);
        if (batterySize >= 13) baseWaste += 250;
        else if (batterySize >= 10) baseWaste += 200;
        else if (batterySize >= 5) baseWaste += 120;

        // Solar adds export optimisation opportunity
        if (calcState.solar === 'yes') baseWaste += 100;

        // EV adds off-peak charging opportunity
        if (calcState.ev === 'yes') baseWaste += 150;

        // Tariff impact
        if (calcState.tariff === 'fixed') baseWaste += 80;
        else if (calcState.tariff === 'unsure') baseWaste += 60;
        else if (calcState.tariff === 'agile') baseWaste -= 40;

        // Gecko can save ~70% of waste
        const savings = Math.round(baseWaste * 0.70);
        
        // Estimate monthly bill
        const avgMonthlyBill = 95 + Math.round(baseWaste / 24);
        const optimisedMonthly = avgMonthlyBill - Math.round(savings / 12);

        // Animate values
        animateValue('wasteValue', `£${baseWaste}`);
        animateValue('saveValue', `£${savings}`);
        document.getElementById('billFrom').textContent = `£${avgMonthlyBill}`;
        document.getElementById('billTo').textContent = `£${optimisedMonthly}`;
    }

    function animateValue(id, newValue) {
        const el = document.getElementById(id);
        el.style.transform = 'scale(1.05)';
        el.textContent = newValue;
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    }

    // Initial calculation
    updateCalculator();

    // ----- Form Submissions -----
    document.getElementById('calcEmailForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('calcEmail').value;
        showToast('Thanks! We\'ll send your personalised savings report soon.');
        document.getElementById('calcEmail').value = '';
    });

    document.getElementById('waitlistForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('waitlistEmail').value;
        showToast('You\'re on the list! We\'ll be in touch when Gecko AI launches.');
        document.getElementById('waitlistEmail').value = '';
    });

    // ----- Toast Notification -----
    function showToast(message) {
        // Remove existing toast if any
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #7de300;
            color: #011022;
            padding: 16px 32px;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            z-index: 9999;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 30px rgba(125, 227, 0, 0.3);
            max-width: 90vw;
            text-align: center;
        `;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Auto-dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // ----- Smooth Scroll for Anchors -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});
