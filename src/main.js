// AuraPet - Modern Senior-Crafted Client Architecture
// Zero errors, high-responsiveness, elegant micro-interactions

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initNavigation();
  initSpaCalculator();
  initBeforeAfterSlider();
  initPricingToggle();
  initServicesTabs();
  initFaqAccordion();
  initBookingModal();
  initNewsletterForm();
});

/* ==========================================================================
   1. NAVIGATION & SCROLL
   ========================================================================== */
function initNavigation() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navHeader = document.getElementById('nav-header');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Header blur on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navHeader.classList.add('shadow-md', 'bg-opacity-95');
    } else {
      navHeader.classList.remove('shadow-md');
    }
  }, { passive: true });
}

/* ==========================================================================
   2. INTERACTIVE SPA CALCULATOR
   ========================================================================== */
const SPA_RATES = {
  petMultipliers: {
    'dog-mini': { multiplier: 1.0, label: 'Cão Mini/Pequeno (até 10kg)' },
    'dog-medium': { multiplier: 1.25, label: 'Cão Médio (11 a 22kg)' },
    'dog-large': { multiplier: 1.6, label: 'Cão Grande/Gigante (+23kg)' },
    'cat-short': { multiplier: 1.1, label: 'Gato de Pelo Curto' },
    'cat-long': { multiplier: 1.35, label: 'Gato Persa/Pelo Longo' }
  },
  services: {
    'ozonio': { basePrice: 85, durationMin: 45, name: 'Banho Hidratante com Ozonioterapia' },
    'tosa-hig': { basePrice: 45, durationMin: 25, name: 'Tosa Higiênica & Patinhas Seguras' },
    'tosa-tesoura': { basePrice: 95, durationMin: 60, name: 'Tosa na Tesoura / Estilo Bebê' },
    'aroma-spa': { basePrice: 60, durationMin: 30, name: 'Sessão Spa de Aromaterapia com Lavanda' },
    'argan-caviar': { basePrice: 55, durationMin: 20, name: 'Hidratação Profunda Caviar & Argan' },
    'unhas-orelhas': { basePrice: 35, durationMin: 15, name: 'Corte de Unhas Suave & Limpeza Auricular' },
    'dentes-enzim': { basePrice: 30, durationMin: 15, name: 'Higienização Oral Enzimática' }
  }
};

function initSpaCalculator() {
  const petSelect = document.getElementById('calc-pet-type');
  const serviceCheckboxes = document.querySelectorAll('.calc-service-checkbox');
  const totalPriceEl = document.getElementById('calc-total-price');
  const totalTimeEl = document.getElementById('calc-total-time');
  const selectedCountEl = document.getElementById('calc-services-count');
  const bookCalcBtn = document.getElementById('calc-book-btn');

  if (!petSelect) return;

  function calculate() {
    const selectedPetKey = petSelect.value;
    const petData = SPA_RATES.petMultipliers[selectedPetKey] || { multiplier: 1.0, label: 'Pet' };

    let totalRaw = 0;
    let totalMinutes = 0;
    let selectedCount = 0;
    const selectedServicesNames = [];

    serviceCheckboxes.forEach(cb => {
      if (cb.checked) {
        const sKey = cb.value;
        const sData = SPA_RATES.services[sKey];
        if (sData) {
          totalRaw += sData.basePrice;
          totalMinutes += sData.durationMin;
          selectedCount++;
          selectedServicesNames.push(sData.name);
        }
      }
    });

    const finalPrice = Math.round(totalRaw * petData.multiplier);

    // Format Duration
    let durationText = '';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0 && mins > 0) {
      durationText = `${hours}h ${mins}min`;
    } else if (hours > 0) {
      durationText = `${hours}h`;
    } else {
      durationText = `${mins} min`;
    }

    if (totalPriceEl) totalPriceEl.textContent = `R$ ${finalPrice}`;
    if (totalTimeEl) totalTimeEl.textContent = selectedCount > 0 ? durationText : '0 min';
    if (selectedCountEl) selectedCountEl.textContent = `${selectedCount} selecionado${selectedCount > 1 ? 's' : ''}`;

    return {
      petKey: selectedPetKey,
      petLabel: petData.label,
      services: selectedServicesNames,
      price: finalPrice,
      duration: durationText
    };
  }

  // Event Listeners
  petSelect.addEventListener('change', calculate);
  serviceCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      calculate();
      // visual border highlight on parent card
      const label = cb.closest('label');
      if (label) {
        if (cb.checked) {
          label.classList.add('border-emerald-700', 'bg-emerald-50/50');
        } else {
          label.classList.remove('border-emerald-700', 'bg-emerald-50/50');
        }
      }
    });
  });

  // Action button: Pre-fill and open modal
  if (bookCalcBtn) {
    bookCalcBtn.addEventListener('click', () => {
      const calcData = calculate();
      if (calcData.services.length === 0) {
        showToast('Atenção', 'Selecione ao menos um serviço para agendar.', 'alert-circle');
        return;
      }
      openBookingModalWithData(calcData);
    });
  }

  calculate();
}

/* ==========================================================================
   3. BEFORE / AFTER COMPARISON SLIDER
   ========================================================================== */
function initBeforeAfterSlider() {
  const container = document.getElementById('grooming-ba-container');
  const beforeImg = document.getElementById('grooming-ba-before');
  const handle = document.getElementById('grooming-ba-handle');

  if (!container || !beforeImg || !handle) return;

  let isDragging = false;

  function updateSlider(xPos) {
    const rect = container.getBoundingClientRect();
    let offsetX = xPos - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));

    beforeImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
    handle.style.left = `${percentage}%`;
  }

  // Pointer & Touch handling
  const startDrag = (e) => {
    isDragging = true;
    updateSlider(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (clientX !== undefined) {
      updateSlider(clientX);
    }
  };

  const stopDrag = () => {
    isDragging = false;
  };

  container.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);

  container.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', onDrag, { passive: true });
  window.addEventListener('touchend', stopDrag);
}

/* ==========================================================================
   4. PRICING TOGGLE (MONTHLY VS ANNUAL)
   ========================================================================== */
function initPricingToggle() {
  const toggleBtn = document.getElementById('pricing-toggle');
  const monthlyLabel = document.getElementById('pricing-label-monthly');
  const annualLabel = document.getElementById('pricing-label-annual');
  const priceCards = document.querySelectorAll('.pricing-card-amount');

  if (!toggleBtn) return;

  let isAnnual = false;

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggleBtn.setAttribute('aria-checked', isAnnual);

    // Switch indicator style
    const dot = toggleBtn.querySelector('.toggle-indicator');
    if (dot) {
      if (isAnnual) {
        dot.style.transform = 'translateX(24px)';
        toggleBtn.classList.replace('bg-stone-300', 'bg-emerald-700');
        if (annualLabel) annualLabel.classList.add('text-emerald-900', 'font-bold');
        if (monthlyLabel) monthlyLabel.classList.remove('text-emerald-900', 'font-bold');
      } else {
        dot.style.transform = 'translateX(0px)';
        toggleBtn.classList.replace('bg-emerald-700', 'bg-stone-300');
        if (monthlyLabel) monthlyLabel.classList.add('text-emerald-900', 'font-bold');
        if (annualLabel) annualLabel.classList.remove('text-emerald-900', 'font-bold');
      }
    }

    // Update prices
    priceCards.forEach(card => {
      const monthly = card.getAttribute('data-monthly');
      const annual = card.getAttribute('data-annual');
      const valueSpan = card.querySelector('.amount-val');
      const periodSpan = card.querySelector('.period-val');

      if (valueSpan) {
        valueSpan.textContent = isAnnual ? annual : monthly;
      }
      if (periodSpan) {
        periodSpan.textContent = isAnnual ? '/mês (no plano anual)' : '/mês';
      }
    });

    if (isAnnual) {
      showToast('Desconto Anual Ativado', 'Economia de 20% + 1 Banho Aromático cortesia!', 'sparkles');
    }
  });
}

/* ==========================================================================
   5. SERVICES TABS / FILTER
   ========================================================================== */
function initServicesTabs() {
  const tabButtons = document.querySelectorAll('.service-tab-btn');
  const serviceCards = document.querySelectorAll('.service-catalog-card');

  if (!tabButtons.length) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('bg-emerald-800', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-stone-700', 'hover:bg-emerald-50');
      });

      button.classList.add('bg-emerald-800', 'text-white', 'shadow-md');
      button.classList.remove('bg-white', 'text-stone-700', 'hover:bg-emerald-50');

      const filter = button.getAttribute('data-tab');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const chevron = item.querySelector('.faq-chevron');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');

      // Close all others
      items.forEach(otherItem => {
        const otherContent = otherItem.querySelector('.faq-content');
        const otherChevron = otherItem.querySelector('.faq-chevron');
        if (otherContent && otherContent !== content) {
          otherContent.classList.add('hidden');
          if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current
      if (isOpen) {
        content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ==========================================================================
   7. VIP BOOKING MODAL (3-STEP WIZARD)
   ========================================================================== */
let modalCurrentStep = 1;
const bookingState = {
  petName: '',
  petType: 'Cão Mini/Pequeno',
  petBreed: '',
  petBehavior: 'Dócil e brincalhão',
  date: '',
  period: 'Manhã (08h às 12h)',
  services: ['Banho Hidratante com Ozonioterapia'],
  estimatedTotal: 'R$ 85',
  tutorName: '',
  tutorPhone: '',
  notes: ''
};

function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openBtns = document.querySelectorAll('.btn-open-booking');
  const closeBtn = document.getElementById('btn-close-modal');

  if (!modal) return;

  // Open modal triggers
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetService = btn.getAttribute('data-service');
      if (presetService) {
        bookingState.services = [presetService];
      }
      openModal();
    });
  });

  // Close modal trigger
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Step transitions
  const stepNext1 = document.getElementById('modal-step-next-1');
  const stepBack2 = document.getElementById('modal-step-back-2');
  const stepNext2 = document.getElementById('modal-step-next-2');
  const stepBack3 = document.getElementById('modal-step-back-3');
  const formSubmit = document.getElementById('booking-form');

  if (stepNext1) {
    stepNext1.addEventListener('click', () => {
      const petNameInput = document.getElementById('modal-pet-name');
      if (!petNameInput.value.trim()) {
        showToast('Campo Obrigatório', 'Por favor, informe o nome do seu pet.', 'alert-circle');
        petNameInput.focus();
        return;
      }
      bookingState.petName = petNameInput.value.trim();
      bookingState.petBreed = document.getElementById('modal-pet-breed')?.value || 'Não informada';
      bookingState.petType = document.getElementById('modal-pet-type-select')?.value || 'Cão';
      bookingState.petBehavior = document.querySelector('input[name="modal-pet-temperament"]:checked')?.value || 'Calmo';

      goToStep(2);
    });
  }

  if (stepBack2) {
    stepBack2.addEventListener('click', () => goToStep(1));
  }

  if (stepNext2) {
    stepNext2.addEventListener('click', () => {
      const dateInput = document.getElementById('modal-booking-date');
      if (!dateInput.value) {
        showToast('Data Desejada', 'Por favor, escolha uma data preferencial.', 'calendar');
        dateInput.focus();
        return;
      }
      bookingState.date = dateInput.value;
      bookingState.period = document.getElementById('modal-booking-period')?.value || 'Manhã';

      // Update review items in step 3
      updateStep3Summary();
      goToStep(3);
    });
  }

  if (stepBack3) {
    stepBack3.addEventListener('click', () => goToStep(2));
  }

  if (formSubmit) {
    formSubmit.addEventListener('submit', (e) => {
      e.preventDefault();

      const tutorNameInput = document.getElementById('modal-tutor-name');
      const tutorPhoneInput = document.getElementById('modal-tutor-phone');
      const tutorNotesInput = document.getElementById('modal-tutor-notes');

      if (!tutorNameInput.value.trim() || !tutorPhoneInput.value.trim()) {
        showToast('Atenção', 'Informe seu nome e WhatsApp para contato.', 'alert-circle');
        return;
      }

      bookingState.tutorName = tutorNameInput.value.trim();
      bookingState.tutorPhone = tutorPhoneInput.value.trim();
      bookingState.notes = tutorNotesInput.value.trim() || 'Nenhuma restrição específica';

      // Dispatch to WhatsApp
      finishAndRedirectWhatsApp();
    });
  }

  // Today as min date
  const dateInput = document.getElementById('modal-booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }
}

function openModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    goToStep(1);
  }
}

function closeModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function goToStep(stepNumber) {
  modalCurrentStep = stepNumber;
  const steps = [1, 2, 3];

  steps.forEach(s => {
    const panel = document.getElementById(`modal-panel-step-${s}`);
    const indicator = document.getElementById(`step-indicator-${s}`);

    if (panel) {
      if (s === stepNumber) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }

    if (indicator) {
      if (s === stepNumber) {
        indicator.classList.add('bg-emerald-800', 'text-white');
        indicator.classList.remove('bg-stone-200', 'text-stone-600');
      } else if (s < stepNumber) {
        indicator.classList.add('bg-emerald-600', 'text-white');
        indicator.classList.remove('bg-stone-200', 'text-stone-600');
      } else {
        indicator.classList.remove('bg-emerald-800', 'bg-emerald-600', 'text-white');
        indicator.classList.add('bg-stone-200', 'text-stone-600');
      }
    }
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateStep3Summary() {
  const summaryPet = document.getElementById('modal-summary-pet');
  const summaryServices = document.getElementById('modal-summary-services');
  const summaryDate = document.getElementById('modal-summary-date');

  if (summaryPet) {
    summaryPet.textContent = `${bookingState.petName} (${bookingState.petType} - ${bookingState.petBehavior})`;
  }
  if (summaryServices) {
    summaryServices.textContent = bookingState.services.join(', ');
  }
  if (summaryDate) {
    // Format date YYYY-MM-DD to DD/MM/YYYY
    const parts = bookingState.date.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : bookingState.date;
    summaryDate.textContent = `${formattedDate} • ${bookingState.period}`;
  }
}

function openBookingModalWithData(calcData) {
  bookingState.petType = calcData.petLabel;
  bookingState.services = calcData.services;
  bookingState.estimatedTotal = `R$ ${calcData.price}`;

  const petTypeSelect = document.getElementById('modal-pet-type-select');
  if (petTypeSelect) {
    petTypeSelect.value = calcData.petKey.startsWith('dog') ? 'Cão' : 'Gato';
  }

  openModal();
  showToast('Orçamento Carregado', 'Seus serviços e estimativa foram importados para o agendamento!', 'check-circle');
}

function finishAndRedirectWhatsApp() {
  const code = 'AURAPET-' + Math.floor(1000 + Math.random() * 9000);
  
  // Format WhatsApp message
  const parts = bookingState.date.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : bookingState.date;

  const msg = 
`🐾 *NOVO AGENDAMENTO VIP - AURAPET SPA* 🐾
*Protocolo:* #${code}

👤 *Tutor(a):* ${bookingState.tutorName}
📱 *WhatsApp:* ${bookingState.tutorPhone}
🐶 *Pet:* ${bookingState.petName} (${bookingState.petType}, Raça: ${bookingState.petBreed})
✨ *Temperamento:* ${bookingState.petBehavior}

📅 *Data Preferencial:* ${formattedDate} (${bookingState.period})
🛁 *Serviços Selecionados:*
- ${bookingState.services.join('\n- ')}

📝 *Observações:* ${bookingState.notes}
💰 *Estimativa do Spa:* ${bookingState.estimatedTotal}

Gostaria de confirmar a disponibilidade e o horário!`;

  const encodedMsg = encodeURIComponent(msg);
  const whatsappUrl = `https://wa.me/556196488260?text=${encodedMsg}`;

  // Show Success Step
  const content = document.getElementById('modal-success-screen');
  const wizard = document.getElementById('modal-wizard-container');
  const codeEl = document.getElementById('modal-success-code');
  const btnWa = document.getElementById('btn-wa-confirm');

  if (codeEl) codeEl.textContent = `#${code}`;
  if (btnWa) {
    btnWa.setAttribute('href', whatsappUrl);
    btnWa.setAttribute('target', '_blank');
  }

  if (wizard && content) {
    wizard.classList.add('hidden');
    content.classList.remove('hidden');
  }

  showToast('Reserva Iniciada!', 'Clique no botão para abrir o WhatsApp e confirmar.', 'sparkles');
}

/* ==========================================================================
   8. NEWSLETTER & COUPON COPY
   ========================================================================== */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');

  if (form && emailInput) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!emailInput.value.includes('@')) {
        showToast('E-mail Inválido', 'Insira um e-mail válido para receber o cupom.', 'alert-circle');
        return;
      }

      showToast('Cupom Ativado! 🎉', 'Código BEMVINDO15 copiado! 15% OFF no primeiro banho.', 'gift');
      emailInput.value = '';
      navigator.clipboard?.writeText('BEMVINDO15').catch(() => {});
    });
  }
}

/* ==========================================================================
   9. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(title, message, iconName = 'bell') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notice glass-card pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border border-emerald-800/15 shadow-2xl bg-white/95 text-stone-900';

  toast.innerHTML = `
    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
      <i data-lucide="${iconName}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1">
      <h4 class="font-bold text-sm text-emerald-950">${title}</h4>
      <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">${message}</p>
    </div>
    <button class="text-stone-400 hover:text-stone-700 toast-close-btn">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Animation show
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 350);
  };

  toast.querySelector('.toast-close-btn')?.addEventListener('click', closeToast);

  // Auto remove after 5s
  setTimeout(closeToast, 5000);
}
