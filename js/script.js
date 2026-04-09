document.addEventListener('DOMContentLoaded', function () {
  // --- Image Popup Logic ---
  const grids = document.querySelectorAll('.pop-image-grid, #pop-image');

  grids.forEach((grid) => {
    grid.addEventListener('click', (event) => {
      const clickedImg = event.target.closest('img');
      if (!clickedImg) return;

      event.preventDefault();

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-popup-wrapper';

      const popupImg = document.createElement('img');
      popupImg.src = clickedImg.src;
      popupImg.className = 'popup-content';

      wrapper.appendChild(popupImg);
      document.body.appendChild(wrapper);

      setTimeout(() => wrapper.classList.add('active'), 50);

      wrapper.onclick = () => {
        wrapper.classList.remove('active');
        setTimeout(() => wrapper.remove(), 800);
      };
    });
  });

  // --- Slider Logic ---
  const track = document.getElementById('slider-track');
  const dotsContainer = document.getElementById('dots-container');
  let slides = Array.from(document.querySelectorAll('.slide'));

  // 1. Setup Pagination Dots 
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index + 1));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(document.querySelectorAll('.dot'));

  // 2. Clone slides for Infinity loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.id = 'first-clone';
  lastClone.id = 'last-clone';

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = document.querySelectorAll('.slide');
  let currentIndex = 1;
  let isTransitioning = false;

  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  function updateSlider(animate = true) {
    track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    if (currentIndex === 0) {
      dots[dots.length - 1].classList.add('active');
    } else if (currentIndex === allSlides.length - 1) {
      dots[0].classList.add('active');
    } else {
      dots[currentIndex - 1].classList.add('active');
    }
  }

  window.moveSlide = function(direction) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex += direction;
    updateSlider(true);
  };

  window.goToSlide = function(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;
    updateSlider(true);
  };

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (allSlides[currentIndex].id === 'first-clone') {
      currentIndex = 1;
      updateSlider(false);
    }
    if (allSlides[currentIndex].id === 'last-clone') {
      currentIndex = allSlides.length - 2;
      updateSlider(false);
    }
  });
});


window.addEventListener('load', () => {
  const loader = document.getElementById('loader-wrapper');
  const text = document.getElementById('loading-text');
  let percent = 0;

  // Simulate progress counting up
  const interval = setInterval(() => {
    percent += 1;
    text.innerText = percent + "%";
    
    if (percent >= 100) {
      clearInterval(interval);
      // Fade out and remove loader
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }, 20); // Adjust speed here
});
