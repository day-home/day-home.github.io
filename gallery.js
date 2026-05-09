// 갤러리 이미지 설정 - 이곳에서만 이미지를 관리하세요
const GALLERY_IMAGES = [
  { src: 'main.png', alt: '메인 이미지' },
  { src: 'dream2.png', alt: '드림 2 이미지' },
  { src: 'dream3.png', alt: '드림 3 이미지' },
  { src: 'crocodile.png', alt: '크로커다일 증사' },
  { src: 'nua.png', alt: '누아 단독' }
  // 새 이미지 추가 예시: { src: '새이미지.png', alt: '설명' }
];

// 현재 슬라이드 모드 추적
let currentMode = 'grid';

// 동적으로 갤러리 이미지 생성
function renderGalleryImages() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  GALLERY_IMAGES.forEach(image => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    img.loading = 'lazy';
    gallery.appendChild(img);
  });

  // 총 이미지 수 업데이트
  document.getElementById('totalSlides').textContent = GALLERY_IMAGES.length;

  attachImageListeners();
}

// 모드 변경 함수
function setMode(mode) {
  const gallery = document.getElementById('gallery');
  const slideInfo = document.getElementById('slideInfo');

  currentMode = mode;
  gallery.className = 'gallery ' + mode;

  // 활성 버튼 업데이트
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // 슬라이드 정보 표시 여부
  slideInfo.style.display = mode === 'slide' ? 'block' : 'none';

  if (mode === 'slide') {
    setTimeout(() => {
      gallery.scrollLeft = 0;
      updateSlideInfo();
    }, 0);
  }

  // 로컬스토리지에 저장
  try {
    localStorage.setItem('galleryMode', mode);
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

// 슬라이드 정보 업데이트
function updateSlideInfo() {
  const gallery = document.getElementById('gallery');
  const images = gallery.querySelectorAll('img');
  
  if (images.length === 0) return;

  const slideWidth = images[0].offsetWidth + 20; // gap 포함
  const currentIndex = Math.round(gallery.scrollLeft / slideWidth) + 1;
  document.getElementById('currentSlide').textContent = Math.min(currentIndex, GALLERY_IMAGES.length);
}

// 이미지 로드 에러 처리
function handleImageError(img) {
  img.classList.add('error');
  img.classList.remove('loading');
  console.warn('이미지 로드 실패:', img.src);
}

// 이미지에 로드 이벤트 리스너 추가
function attachImageListeners() {
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('error', function() {
      handleImageError(this);
    });

    img.addEventListener('load', function() {
      this.classList.remove('loading');
      this.classList.remove('error');
    });

    // 초기 로딩 상태
    if (!img.complete) {
      img.classList.add('loading');
    } else if (img.naturalHeight === 0) {
      // 이미 로드되었지만 실패한 경우
      handleImageError(img);
    }
  });
}

// 포커스 트랩 함수
function createFocusTrap(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// 슬라이드 모드에서 화살표 키 네비게이션
function handleSlideKeyNavigation(e) {
  if (currentMode !== 'slide') return;

  const gallery = document.getElementById('gallery');
  const images = gallery.querySelectorAll('img');
  
  if (images.length === 0) return;

  const slideWidth = images[0].offsetWidth + 20; // gap 포함

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    gallery.scrollLeft -= slideWidth;
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    gallery.scrollLeft += slideWidth;
  }

  updateSlideInfo();
}

// DOM 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 동적 이미지 렌더링
  renderGalleryImages();

  // 저장된 모드 복원
  let savedMode = 'grid';
  try {
    savedMode = localStorage.getItem('galleryMode') || 'grid';
  } catch (e) {
    console.warn('localStorage 읽기 실패:', e);
  }

  setMode(savedMode);

  // 버튼 클릭 이벤트
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setMode(e.target.dataset.mode);
    });
  });

  // 슬라이드 모드 스크롤 감지
  const gallery = document.getElementById('gallery');
  gallery.addEventListener('scroll', updateSlideInfo);

  // 슬라이드 모드 화살표 키 네비게이션
  document.addEventListener('keydown', handleSlideKeyNavigation);

  // 이미지 클릭 확대 기능 (이벤트 위임)
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');

  gallery.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && !e.target.classList.contains('error')) {
      modal.classList.add('active');
      modalImage.src = e.target.src;
      modalImage.alt = e.target.alt;
      document.body.style.overflow = 'hidden';

      // 모달 포커스 트랩
      createFocusTrap(modal);
      modalClose.focus();
    }
  });

  // 모달 닫기
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    gallery.querySelector('img').focus(); // 갤러리의 첫 번째 이미지로 포커스 복원
  };

  modalClose.addEventListener('click', closeModal);

  // 배경 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Escape 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 모달 클로즈 버튼 엔터/스페이스 키 지원
  modalClose.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal();
    }
  });
});
