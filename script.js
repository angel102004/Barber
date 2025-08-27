// ========== SISTEMA DE RESERVAS INTELIGENTE ==========
    
    // Base de datos simulada de citas (en una aplicación real esto estaría en un servidor)
    let bookedSlots = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
    
    // Configuración del sistema
    const WORKING_HOURS = {
      start: 10, // 10:00 AM
      end: 17,   // 5:00 PM
      slotDuration: 30 // 30 minutos por slot
    };
    
    const MAX_CLIENTS_PER_SLOT = 2; // Máximo 2 clientes por horario
    
    // Generar slots de tiempo
    function generateTimeSlots() {
      const slots = [];
      for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
        for (let minute = 0; minute < 60; minute += WORKING_HOURS.slotDuration) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      return slots;
    }
    
    // Verificar si un slot está disponible
    function isSlotAvailable(date, time) {
      const dateKey = `${date}_${time}`;
      const currentBookings = bookedSlots[dateKey] || 0;
      return currentBookings < MAX_CLIENTS_PER_SLOT;
    }
    
    // Reservar un slot
    function bookSlot(date, time) {
      const dateKey = `${date}_${time}`;
      bookedSlots[dateKey] = (bookedSlots[dateKey] || 0) + 1;
      localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
    }
    
    // Renderizar slots de tiempo
    function renderTimeSlots(selectedDate) {
      const timeSlotsContainer = document.getElementById('time-slots');
      const slots = generateTimeSlots();
      
      timeSlotsContainer.innerHTML = '';
      
      if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p style="color: #ccc;">Selecciona una fecha primero</p>';
        return;
      }
      
      // Verificar si es fin de semana
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo = 0, Sábado = 6
        timeSlotsContainer.innerHTML = '<p style="color: #f44336; font-weight: bold;">❌ No trabajamos los fines de semana</p>';
        return;
      }
      
      // Verificar si es una fecha pasada
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(selectedDate);
      
      if (selectedDateObj < today) {
        timeSlotsContainer.innerHTML = '<p style="color: #f44336; font-weight: bold;">❌ No se pueden reservar citas en fechas pasadas</p>';
        return;
      }
      
      slots.forEach(time => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        slotElement.textContent = time;
        slotElement.dataset.time = time;
        
        // Verificar disponibilidad
        if (isSlotAvailable(selectedDate, time)) {
          const currentBookings = bookedSlots[`${selectedDate}_${time}`] || 0;
          const slotsLeft = MAX_CLIENTS_PER_SLOT - currentBookings;
          
          if (slotsLeft === 1) {
            slotElement.innerHTML += '<br><small>Último lugar</small>';
            slotElement.style.borderColor = '#ffa500';
          }
          
          slotElement.addEventListener('click', () => selectTimeSlot(slotElement, time));
        } else {
          slotElement.classList.add('unavailable');
          slotElement.innerHTML += '<br><small>Ocupado</small>';
        }
        
        timeSlotsContainer.appendChild(slotElement);
      });
    }
    
    // Seleccionar slot de tiempo
    function selectTimeSlot(element, time) {
      // Remover selección anterior
      document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      
      // Seleccionar nuevo slot
      element.classList.add('selected');
      document.getElementById('selected-time').value = time;
      
      // Feedback visual
      element.classList.add('pulse');
      setTimeout(() => element.classList.remove('pulse'), 800);
    }
    
    // ========== INICIALIZACIÓN Y EVENTOS ==========
    
    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    // ========== FORMULARIO Y WHATSAPP ==========
    
    const form = document.getElementById("booking-form");
    const msg = document.getElementById("msg");
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const fechaInput = document.getElementById('fecha');

    // Configurar fecha mínima (hoy)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    fechaInput.min = tomorrow.toISOString().split('T')[0];

    // Event listener para cambio de fecha
    fechaInput.addEventListener('change', (e) => {
      renderTimeSlots(e.target.value);
      document.getElementById('selected-time').value = '';
    });

    // Form submission
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('name');
      const telefono = formData.get('telefono');
      const servicio = formData.get('servicio');
      const fecha = formData.get('fecha');
      const time = formData.get('selected-time');
      const mensaje = formData.get('mensaje');
      
      // Validaciones
      if (!name || !telefono || !servicio || !fecha || !time) {
        showMessage('❌ Por favor completa todos los campos obligatorios', 'error');
        return;
      }
      
      // Verificar disponibilidad una vez más
      if (!isSlotAvailable(fecha, time)) {
        showMessage('❌ Lo sentimos, ese horario ya no está disponible. Selecciona otro.', 'error');
        renderTimeSlots(fecha); // Refrescar slots
        return;
      }
      
      // Mostrar estado de carga
      btnText.innerHTML = '<div class="loading"></div> Procesando...';
      submitBtn.disabled = true;
      
      // Simular procesamiento
      setTimeout(() => {
        // Reservar el slot
        bookSlot(fecha, time);
        
        // Obtener información del servicio
        const serviceOption = document.querySelector(`option[value="${servicio}"]`);
        const serviceText = serviceOption.textContent;
        const price = serviceOption.dataset.price;
        
        // Formatear fecha
        const dateObj = new Date(fecha);
        const fechaFormateada = dateObj.toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Crear mensaje para WhatsApp
        const whatsappMessage = `🔥 *NUEVA CITA - BARBERSHOP ELITE* 🔥

👤 *Cliente:* ${name}
📞 *Teléfono:* ${telefono}
💇‍♂️ *Servicio:* ${serviceText}
📅 *Fecha:* ${fechaFormateada}
⏰ *Hora:* ${time}
💰 *Precio:* ${price} MXN
${mensaje ? `📝 *Comentarios:* ${mensaje}` : ''}

¡Reserva confirmada! 🎯`;
        
        // Número de WhatsApp de la barbería
        const whatsappNumber = '5217351498421'; // Tu número actualizado
        
        // Crear enlace de WhatsApp
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Mostrar mensaje de éxito
        showMessage(`🎉 ¡Cita reservada exitosamente! 
        
📅 ${fechaFormateada} a las ${time}
💰 Total: ${price} MXN

Te redirigiremos a WhatsApp para confirmar...`, 'success');
        
        // Redirigir a WhatsApp después de 2 segundos
        setTimeout(() => {
          window.open(whatsappURL, '_blank');
        }, 2000);
        
        // Limpiar formulario
        form.reset();
        renderTimeSlots('');
        
        // Crear efecto de celebración
        createCelebration();
        
        // Reset button
        btnText.innerHTML = '<i class="fab fa-whatsapp"></i> ENVIAR A WHATSAPP';
        submitBtn.disabled = false;
        
      }, 1500);
    });
    
    // Función para mostrar mensajes
    function showMessage(text, type) {
      msg.innerHTML = text;
      msg.className = `message ${type}`;
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // ========== EFECTOS VISUALES ==========
    
    // Crear animación de chispas
    function createSparks() {
      const sparksContainer = document.getElementById('sparks');
      
      setInterval(() => {
        if (sparksContainer.children.length < 20) {
          const spark = document.createElement('div');
          spark.className = 'spark';
          spark.style.left = Math.random() * 100 + '%';
          spark.style.animationDelay = Math.random() * 2 + 's';
          spark.style.animationDuration = (Math.random() * 2 + 2) + 's';
          
          sparksContainer.appendChild(spark);
          
          setTimeout(() => {
            if (spark.parentNode) {
              spark.remove();
            }
          }, 5000);
        }
      }, 500);
    }
    
    // Crear celebración
    function createCelebration() {
      const symbols = ['🔥', '⚡', '💪', '🎯', '👑', '✂️', '🏆'];
      
      for (let i = 0; i < 30; i++) {
        const element = document.createElement('div');
        element.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
        element.style.position = 'fixed';
        element.style.left = Math.random() * 100 + 'vw';
        element.style.top = '-50px';
        element.style.fontSize = Math.random() * 20 + 20 + 'px';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '9999';
        
        document.body.appendChild(element);
        
        const animation = element.animate([
          { 
            transform: 'translateY(-50px) rotate(0deg)', 
            opacity: 1 
          },
          { 
            transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, 
            opacity: 0 
          }
        ], {
          duration: Math.random() * 3000 + 2000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => element.remove();
      }
    }
    
    // Inicializar efectos
    createSparks();
    
    // Inicializar calendario con renderizado inicial vacío
    renderTimeSlots('');
    
    console.log('🔥 BARBERSHOP ELITE - Sistema de reservas activado! ⚡');
