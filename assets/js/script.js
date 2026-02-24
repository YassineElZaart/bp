/* =============================================
   BLACK PEARL TOURS — Main Script
   ============================================= */

(function () {
  'use strict';

  /* ----- Header scroll effect ----- */
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });


  /* ----- Fade-in on scroll (Intersection Observer) ----- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 100px 0px' });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });


  /* ----- Mobile nav toggle ----- */
  var mobileToggle = document.querySelector('.mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      document.querySelector('.nav-links').classList.toggle('show-mobile');
    });
  }


  /* ----- Smooth scroll for anchor links ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        var headerHeight = document.getElementById('header').offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        var nav = document.querySelector('.nav-links');
        if (nav) nav.classList.remove('show-mobile');
      }
    });
  });


  /* ----- Contact form submission ----- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  async function handleContactSubmit(e) {
    e.preventDefault();

    var form = e.target;
    var submitBtn = form.querySelector('.contact-submit .btn');
    var statusEl = form.querySelector('.form-status');
    var originalText = submitBtn.textContent;

    // Gather form data
    var formData = {
      name: form.querySelector('[name="name"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      subject: form.querySelector('[name="subject"]').value,
      message: form.querySelector('[name="message"]').value.trim()
    };

    // Basic validation
    if (!formData.name || !formData.email) {
      showStatus(statusEl, 'error', 'Please fill in your name and email.');
      return;
    }

    // UI: loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.className = 'form-status';
    statusEl.style.display = 'none';

    try {
      var response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      var result = await response.json();

      if (response.ok && result.success) {
        showStatus(statusEl, 'success', 'Message sent successfully! We will get back to you soon.');
        form.reset();
      } else {
        showStatus(statusEl, 'error', result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      showStatus(statusEl, 'error', 'Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  function showStatus(el, type, message) {
    el.className = 'form-status ' + type;
    el.textContent = message;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

})();
