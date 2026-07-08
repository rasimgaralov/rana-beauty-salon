/* ============================================
   RANA BEAUTY SALON
   Main JavaScript — Loader, Hero & Animations
   ============================================ */

// Always start from top on page load / refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Fix mobile viewport height — set ONCE to prevent layout thrashing
// when mobile browser chrome hides/shows on scroll
(function setVH() {
  document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
})();

(function () {
  'use strict';

  // ── DOM ELEMENTS ──────────────────────────
  const loader      = document.getElementById('loader');
  const video       = document.getElementById('loaderVideo');
  const skipBtn     = document.getElementById('skipBtn');
  const heroCanvas  = document.getElementById('heroCanvas');
  const navbar      = document.getElementById('navbar');
  const infoLeft    = document.querySelector('.hero-info-left');
  const infoRight   = document.querySelector('.hero-info-right');
  const infoBottom  = document.querySelector('.hero-info-bottom');
  const heroScroll  = document.querySelector('.hero-scroll');
  const ctx         = heroCanvas.getContext('2d');

  let hasTransitioned = false;

  // ── RESPONSIVE VIDEO SOURCE ───────────────
  var isMobile = window.innerWidth <= 1024;
  video.src = isMobile
    ? 'assets/background/mobile/intro.mp4?v=raw_new'
    : 'assets/background/desktop/introDesktop.mp4?v=raw_new';
  video.load();

  // ── CANVAS SIZING ─────────────────────────
  var lastW = window.innerWidth;
  function sizeCanvas() {
    var rect = heroCanvas.getBoundingClientRect();
    heroCanvas.width  = rect.width || window.innerWidth;
    heroCanvas.height = rect.height;
    lastW = window.innerWidth;
  }
  sizeCanvas();
  window.addEventListener('resize', function () {
    // Only resize on actual width change (orientation/window),
    // ignore height-only changes from mobile browser chrome
    if (Math.abs(window.innerWidth - lastW) < 1) return;
    sizeCanvas();
    // Redraw if we already captured the frame
    if (hasTransitioned && video.readyState >= 2) {
      drawCover(ctx, video, heroCanvas.width, heroCanvas.height);
    }
  });

  // ── DRAW VIDEO FRAME WITH "COVER" FIT ─────
  function drawCover(context, videoEl, cw, ch) {
    var vw = videoEl.videoWidth;
    var vh = videoEl.videoHeight;
    if (!vw || !vh) return;

    var videoRatio  = vw / vh;
    var canvasRatio = cw / ch;
    var dw, dh, ox, oy;

    if (canvasRatio > videoRatio) {
      dw = cw;
      dh = cw / videoRatio;
      ox = 0;
      oy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * videoRatio;
      ox = (cw - dw) / 2;
      oy = 0;
    }

    context.drawImage(videoEl, ox, oy, dw, dh);
  }

  // ── CAPTURE LAST FRAME & START TRANSITION ─
  function captureAndTransition() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    // Draw last frame onto hero canvas
    sizeCanvas();
    drawCover(ctx, video, heroCanvas.width, heroCanvas.height);

    // Show canvas
    heroCanvas.classList.add('visible');

    // Fade out loader
    loader.classList.add('hidden');

    // Start hero animations (navbar, info blocks)
    // Small delay to let loader fade start
    setTimeout(startHeroAnimations, 200);
  }

  function startHeroAnimations() {
    // Navbar slides down (CSS handles the animation + delay)
    navbar.classList.add('visible');
    // Info blocks slide in (CSS transition-delay handles staggering)
    infoLeft.classList.add('visible');
    infoRight.classList.add('visible');
    if (infoBottom) infoBottom.classList.add('visible');
    // Scroll indicator
    if (heroScroll) heroScroll.classList.add('visible');
  }

  // ── VIDEO EVENTS ──────────────────────────
  video.addEventListener('ended', function () {
    captureAndTransition();
  });

  // Fallback: if video takes too long (12s max)
  setTimeout(function () {
    if (!hasTransitioned) {
      // Try to capture whatever frame is showing
      if (video.readyState >= 2) {
        captureAndTransition();
      } else {
        // Video didn't load at all — just show hero without frame
        hasTransitioned = true;
        loader.classList.add('hidden');
        setTimeout(startHeroAnimations, 200);
      }
    }
  }, 12000);

  // ── SKIP BUTTON ───────────────────────────
  skipBtn.addEventListener('click', function () {
    if (hasTransitioned) return;

    // Try to seek to end and capture
    if (video.readyState >= 2 && video.duration) {
      video.currentTime = video.duration - 0.05;
      video.addEventListener('seeked', function onSeeked() {
        video.removeEventListener('seeked', onSeeked);
        captureAndTransition();
      });
    } else {
      // Video not ready — just transition without frame
      hasTransitioned = true;
      loader.classList.add('hidden');
      setTimeout(startHeroAnimations, 200);
    }
  });

  // ── VIDEO ERROR HANDLING ──────────────────
  video.addEventListener('error', function () {
    if (!hasTransitioned) {
      hasTransitioned = true;
      loader.classList.add('hidden');
      setTimeout(startHeroAnimations, 200);
    }
  });

  // ── NAVBAR SCROLL EFFECT ──────────────────
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(237, 232, 223, 0.95)';
    } else {
      navbar.style.background = '';
    }
  });

  // ── MOBILE MENU TOGGLE ────────────────────
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.querySelector('.nav-links');
  var navOverlay = document.getElementById('navOverlay');

  if (menuToggle && navLinks) {
    function toggleMenu() {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (navOverlay) {
        navOverlay.classList.toggle('active');
      }
      
      // Lock body scroll when menu is open
      if (navLinks.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    function closeMenu() {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (navOverlay) {
        navOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', toggleMenu);

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // ── PARALLAX HERO CONTENT ─────────────────
  window.addEventListener('scroll', function () {
    var scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      var factor = scroll * 0.25;
      var opacity = 1 - (scroll / (window.innerHeight * 0.6));
      if (opacity < 0) opacity = 0;

      if (infoLeft) {
        infoLeft.style.transform = 'translateY(' + factor + 'px)';
        infoLeft.style.opacity = opacity;
      }
      if (infoRight) {
        infoRight.style.transform = 'translateY(' + factor + 'px)';
        infoRight.style.opacity = opacity;
      }
    }
  });

  // ── SCROLL REVEAL ─────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ── TESTIMONIAL CAROUSEL ──────────────────
  var testimonialItems = document.querySelectorAll('.testimonial-item');
  var dots = document.querySelectorAll('.t-dot');
  var currentTestimonial = 0;

  function showTestimonial(index) {
    testimonialItems.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    dots.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    currentTestimonial = index;
  }

  // Dot click handlers
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'));
      showTestimonial(idx);
    });
  });

  // Auto-rotate every 5 seconds
  if (testimonialItems.length > 0) {
    setInterval(function () {
      var next = (currentTestimonial + 1) % testimonialItems.length;
      showTestimonial(next);
    }, 5000);
  }

  // ── CATEGORY CARD GRID LOGIC ──────────────────
  var cardHeaders = document.querySelectorAll('.category-card-header');
  var categoryCards = document.querySelectorAll('.category-card');

  // Open the default active category card on page load
  var defaultActive = document.querySelector('.category-card.active');
  if (defaultActive) {
    var defaultContent = defaultActive.querySelector('.category-card-content');
    if (defaultContent) {
      setTimeout(function () {
        defaultContent.style.maxHeight = 'none';
      }, 300);
    }
  }

  cardHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      var item = this.parentElement;
      var content = this.nextElementSibling;
      var isActive = item.classList.contains('active');

      // Collapse all category cards and reset subcategories
      categoryCards.forEach(function (card) {
        var cardContent = card.querySelector('.category-card-content');
        if (card.classList.contains('active')) {
          if (cardContent) {
            // First, set max-height to current scrollHeight to enable transition
            cardContent.style.maxHeight = cardContent.scrollHeight + 'px';
            // Then collapse it in the next frame
            setTimeout(function () {
              cardContent.style.maxHeight = null;
            }, 10);
          }
          card.classList.remove('active');
        }
        
        // Reset subcategories inside all cards
        card.querySelectorAll('.services-subcategory').forEach(function (sub) {
          sub.classList.remove('active');
        });
        card.querySelectorAll('.services-list').forEach(function (list) {
          list.classList.remove('open');
          list.style.maxHeight = null;
        });
      });

      // If the clicked item wasn't active, expand it
      if (!isActive) {
        item.classList.add('active');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';

          // After transition finishes, set max-height to none to allow nested expansion
          setTimeout(function () {
            if (item.classList.contains('active')) {
              content.style.maxHeight = 'none';
            }
          }, 500);

          // Re-observe reveal elements inside the newly shown content
          content.querySelectorAll('.reveal').forEach(function (el) {
            revealObserver.observe(el);
          });
        }
      }
    });
  });

  // ── NESTED SUBCATEGORIES ACCORDION ─────────────
  var subcategoryHeaders = document.querySelectorAll('.services-subcategory');
  subcategoryHeaders.forEach(function (subHeader) {
    // Add service count next to each subcategory name dynamically
    var list = subHeader.nextElementSibling;
    if (list && list.classList.contains('services-list')) {
      var count = list.querySelectorAll('.service-item').length;
      var originalText = subHeader.textContent.trim();
      subHeader.innerHTML = '';

      var titleWrap = document.createElement('span');
      titleWrap.className = 'subcategory-title-wrap';
      titleWrap.textContent = originalText;

      var rightWrap = document.createElement('span');
      rightWrap.className = 'subcategory-right-wrap';

      if (count > 0) {
        var countSpan = document.createElement('span');
        countSpan.className = 'subcategory-count';
        countSpan.textContent = '(' + count + ')';
        rightWrap.appendChild(countSpan);
      }

      subHeader.appendChild(titleWrap);
      subHeader.appendChild(rightWrap);
    }

    subHeader.addEventListener('click', function () {
      var list = this.nextElementSibling;
      if (list && list.classList.contains('services-list')) {
        var isCurrentlyOpen = list.classList.contains('open');
        var parentCard = this.closest('.category-card');

        // Collapse all other subcategories inside the same category card
        if (parentCard) {
          parentCard.querySelectorAll('.services-subcategory').forEach(function (sub) {
            if (sub !== subHeader) {
              sub.classList.remove('active');
            }
          });
          parentCard.querySelectorAll('.services-list').forEach(function (l) {
            if (l !== list) {
              l.classList.remove('open');
              l.style.maxHeight = null;
            }
          });
        }

        // Toggle active classes for the clicked item
        this.classList.toggle('active');
        list.classList.toggle('open');

        if (!isCurrentlyOpen) {
          list.style.maxHeight = list.scrollHeight + 'px';
        } else {
          list.style.maxHeight = null;
        }
      }
    });
  });

})();

// ── BOOKING MODAL (global scope) ──────────────
function openBookingModal(branch) {
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Set min date to today
    var dateInput = document.getElementById('bookDate');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
    // Pre-select branch if provided
    if (branch) {
      var branchSelect = document.getElementById('bookBranch');
      if (branchSelect) {
        branchSelect.value = branch;
      }
    }
    // Close mobile menu if open
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.querySelector('.nav-links');
    var navOverlay = document.getElementById('navOverlay');
    if (menuToggle && navLinks) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (navOverlay) {
        navOverlay.classList.remove('active');
      }
    }
  }
}

function closeBookingModal() {
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.querySelector('.booking-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeBookingModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBookingModal();
  });

  // ── SPECIALIST DATA PER SERVICE ─────────────
  var specialists = {
    // Hair
    'Style Cut': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Trim Cut': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Blow Dry': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Hair Color': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Highlights': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Keratin Treatment': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Hair Extension': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Hair Treatment': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Boys Haircut': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Kids Haircut': ['Rania B.', 'Sara J.', 'Dina F.'],

    // Nail
    'Manicure & Pedicure': ['Amira K.', 'Leyla M.', 'Nadia R.'],
    'Gel Polish': ['Amira K.', 'Leyla M.', 'Nadia R.'],
    'Russian Manicure': ['Amira K.', 'Leyla M.', 'Nadia R.'],
    'Acrylic Extension': ['Amira K.', 'Farida S.', 'Hana T.'],
    'Nail Art': ['Farida S.', 'Zahra H.', 'Maryam A.'],
    'Nail Removal': ['Amira K.', 'Leyla M.', 'Nadia R.'],

    // Face & Eye
    'Hydro Facial': ['Noura W.', 'Layla D.', 'Yasmin E.'],
    'Lash Extensions': ['Noura W.', 'Layla D.', 'Yasmin E.'],
    'Lash Refill': ['Noura W.', 'Layla D.', 'Yasmin E.'],
    'Eyebrow Lamination': ['Noura W.', 'Layla D.', 'Yasmin E.'],
    'Permanent Makeup': ['Noura W.', 'Layla D.', 'Yasmin E.'],

    'Other': []
  };

  var serviceSelect = document.getElementById('bookService');
  var specialistRow = document.getElementById('specialistRow');
  var specialistSelect = document.getElementById('bookSpecialist');

  if (serviceSelect && specialistRow && specialistSelect) {
    serviceSelect.addEventListener('change', function () {
      var selected = this.value;
      var list = specialists[selected] || [];
      var isAr = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
      var noPrefText = isAr ? 'بدون تفضيل' : 'No preference';
      
      specialistSelect.innerHTML = '<option value="" selected>' + noPrefText + '</option>';
      if (list.length > 0) {
        list.forEach(function (name) {
          var opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          specialistSelect.appendChild(opt);
        });
        specialistRow.style.display = '';
      } else {
        specialistRow.style.display = 'none';
      }
    });
  }

  // Form submission
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('bookName').value.trim();
      var phone = document.getElementById('bookPhone').value.trim();
      var branch = document.getElementById('bookBranch').value;
      var service = document.getElementById('bookService').value;
      var specialist = document.getElementById('bookSpecialist') ? document.getElementById('bookSpecialist').value : '';
      var date = document.getElementById('bookDate').value;
      var time = document.getElementById('bookTime').value;
      var notes = document.getElementById('bookNotes').value.trim();

      // Format date nicely
      var dateObj = new Date(date + 'T00:00:00');
      var formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Branch display name and WhatsApp number
      var branchName = 'Qurm (DoubleTree by Hilton)';
      var waNumber = '96898999262';

      // Build WhatsApp message
      var message = '✨ *RANA BEAUTY — Appointment Request*\n\n';
      message += '👤 *Name:* ' + name + '\n';
      message += '📞 *Phone:* ' + phone + '\n';
      message += '📍 *Branch:* ' + branchName + '\n';
      message += '💅 *Service:* ' + service + '\n';
      if (specialist) {
        message += '👩‍🎨 *Specialist:* ' + specialist + '\n';
      }
      message += '📅 *Date:* ' + formattedDate + '\n';
      message += '🕐 *Time:* ' + time + '\n';
      if (notes) {
        message += '📝 *Notes:* ' + notes + '\n';
      }
      message += '\nThank you! Looking forward to your confirmation. ✨';

      var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank');

      // Close modal and reset form
      closeBookingModal();
      form.reset();
      if (specialistRow) specialistRow.style.display = 'none';
    });
  }
});
