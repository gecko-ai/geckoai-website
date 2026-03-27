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
        importKwh: 4500,
        exportKwh: 2000,
        battery: 10,
        panels: 12,
        ev: 'yes',
        tariff: 'standard'
    };

    // Handle number inputs
    document.querySelectorAll('.calc-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 0;
            if (e.target.id === 'calcImport') calcState.importKwh = val;
            if (e.target.id === 'calcExport') calcState.exportKwh = val;
            if (e.target.id === 'calcPanels') calcState.panels = val;
            updateCalculator();
        });
    });

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
        const importKwh = calcState.importKwh;
        const exportKwh = calcState.exportKwh;
        
        // 1. Current Cost Calculation
        let currentImportRate = 0.24; // 24p standard
        let currentExportRate = 0.04; // 4p standard
        
        if (calcState.tariff === 'ev') {
            currentImportRate = 0.15; // Blended EV rate
        } else if (calcState.tariff === 'agile') {
            currentImportRate = 0.18; // Blended Agile rate
            currentExportRate = 0.06; // Slightly better standard export
        }
        
        // If they have an EV but are on standard tariff, they overpay significantly
        if (calcState.ev === 'yes' && calcState.tariff !== 'ev') {
            currentImportRate = 0.25;
        }

        const currentCost = (importKwh * currentImportRate) - (exportKwh * currentExportRate);
        const actualCost = Math.max(0, currentCost); // Can't have negative current bill in simple model
        
        // 2. Gecko Ideal Scenario
        // Gecko shifts import to off-peak (avg 8p) and export to peak (avg 12p)
        let idealImportRate = 0.08;
        const idealExportRate = 0.12;
        
        // Penalty for smaller batteries unable to shift entirely to off-peak
        const batterySize = parseInt(calcState.battery);
        if (batterySize < 10) idealImportRate = 0.10;
        if (batterySize < 5) idealImportRate = 0.12;

        const idealCost = (importKwh * idealImportRate) - (exportKwh * idealExportRate);
        
        // 3. Waste & Savings Calculation
        let totalWaste = currentCost - idealCost;
        if (totalWaste < 0) totalWaste = 0; // Already optimal
        
        // Gecko saves 90% of the wasted potential
        const savings = Math.round(totalWaste * 0.90);
        const displayWaste = Math.round(totalWaste);
        
        // Estimate monthly bill (Add ~£180/year for standing charges to base cost)
        const annualBill = actualCost + 180;
        const avgMonthlyBill = Math.round(annualBill / 12);
        const optimisedMonthly = Math.max(0, avgMonthlyBill - Math.round(savings / 12));

        // Animate values
        animateValue('wasteValue', `£${displayWaste}`);
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
