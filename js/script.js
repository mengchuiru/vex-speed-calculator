// js/script.js
'use strict';

// ========== 常量配置 ==========
const CONSTANTS = {
  CALCULATION_FACTOR: 0.004788,
  GEAR_RATIO_BASE: 12,
  IMAGE_SCALE_FACTOR: 0.5,
  DEFAULT_IMAGE_SIZE: 50,
  WHEEL_SIZE_MULTIPLIER: 30
};

// ========== DOM 元素缓存 ==========
const DOM = {
  result: document.getElementById('result'),
  languageBtn: document.querySelector('.language-btn'),
  selects: {
    motor: document.getElementById('motor'),
    wheel: document.getElementById('wheel'),
    gearMotor: document.getElementById('gear_motor'),
    gearWheel: document.getElementById('gear_wheel')
  }
};

// ========== 状态管理 ==========
const state = {
  isEnglish: localStorage.getItem('language') === 'en',
  imageCache: new Map()
};

// ========== 核心功能 ==========
const Calculator = {
  initialize() {
    this.setupEventListeners();
    this.updateLanguage();
    this.calculate();
  },

  setupEventListeners() {
    // 使用事件委托统一处理下拉菜单变更
    document.addEventListener('change', (event) => {
      if (event.target.matches('select')) {
        this.calculate();
      }
    });

    DOM.languageBtn.addEventListener('click', () => this.toggleLanguage());
  },

  toggleLanguage() {
    state.isEnglish = !state.isEnglish;
    localStorage.setItem('language', state.isEnglish ? 'en' : 'zh');
    this.updateLanguage();
  },

  updateLanguage() {
    // 更新按钮文本
    DOM.languageBtn.textContent = state.isEnglish ? '中文' : 'English';

    // 批量更新可翻译元素
    document.querySelectorAll('.translatable').forEach(element => {
      const textKey = state.isEnglish ? 'en' : 'zh';
      element.textContent = element.dataset[textKey];
    });
  },

  calculate() {
    const inputs = this.getInputValues();
    const result = this.calculateSpeed(inputs);
    this.updateResult(result);
    this.updateComponentImages(inputs);
  },

  getInputValues() {
    return {
      motor: parseFloat(DOM.selects.motor.value),
      wheel: parseFloat(DOM.selects.wheel.value),
      gearMotor: parseFloat(DOM.selects.gearMotor.value),
      gearWheel: parseFloat(DOM.selects.gearWheel.value)
    };
  },

  calculateSpeed({ motor, wheel, gearMotor, gearWheel }) {
    return (motor * wheel * gearMotor / gearWheel * CONSTANTS.CALCULATION_FACTOR).toFixed(2);
  },

  updateResult(result) {
    DOM.result.textContent = result;
  },

  updateComponentImages({ motor, wheel, gearMotor, gearWheel }) {
    this.updateImage('motorImage', `./images/Motor/${motor}.png`, CONSTANTS.DEFAULT_IMAGE_SIZE);
    this.updateImage('wheelImage', `./images/Omni Wheel/${wheel}.png`, wheel * CONSTANTS.WHEEL_SIZE_MULTIPLIER);
    
    const gearSize = (gear, base = CONSTANTS.GEAR_RATIO_BASE) => 
      (gear / base) * CONSTANTS.WHEEL_SIZE_MULTIPLIER * CONSTANTS.IMAGE_SCALE_FACTOR;
    
    this.updateImage('GmImage', `./images/Gear/${gearMotor}.png`, gearSize(gearMotor));
    this.updateImage('GwImage', `./images/Gear/${gearWheel}.png`, gearSize(gearWheel));
  },

  updateImage(containerId, path, scaledHeight) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // 优先使用缓存
    if (state.imageCache.has(path)) {
      container.appendChild(state.imageCache.get(path).cloneNode(true));
      return;
    }

    // 显示加载状态
    this.showLoadingState(container);

    const img = new Image();
    img.src = path;
    img.className = 'dynamic-image';
    img.alt = 'Component Image';
    img.height = scaledHeight;

    img.onload = () => {
      state.imageCache.set(path, img.cloneNode(true));
      container.replaceChildren(img);
    };

    img.onerror = () => {
      console.error(`Image load failed: ${path}`);
      this.showFallbackImage(container);
    };
  },

  showLoadingState(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    container.appendChild(loader);
  },

  showFallbackImage(container) {
    const fallback = document.createElement('div');
    fallback.className = 'image-error';
    fallback.textContent = '⚠️ Image not available';
    container.replaceChildren(fallback);
  }
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => Calculator.initialize());