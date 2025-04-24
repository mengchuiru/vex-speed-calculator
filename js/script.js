// js/script.js
'use strict';

/****************** 常量配置 ******************/
const CONFIG = {
  CALCULATION: {
    FACTOR: 0.004788,
    GEAR_RATIO: 24,
    SAFETY_MARGIN: 1
  },
  IMAGE: {
    MOTOR: { BASE_PATH: './images/Motor/', DEFAULT_SIZE: 50 },
    WHEEL: { BASE_PATH: './images/Omni Wheel/', SIZE_MULTIPLIER: 30 },
    GEAR: { BASE_PATH: './images/Gear/', BASE_RATIO: 12, SCALE_FACTOR: 0.5 }
  },
  DEBOUNCE_TIME: 300
};

/****************** 状态管理 ******************/
const AppState = {
  isEnglish: localStorage.getItem('language') === 'en',
  imageCache: new Map(),
  debounceTimer: null
};

/****************** DOM 元素缓存 ******************/
const DOM = {
  result: document.getElementById('result'),
  error: document.getElementById('error'),
  languageBtn: document.querySelector('.language-btn'),
  selects: {
    motor: document.getElementById('motor'),
    wheel: document.getElementById('wheel'),
    gearMotor: document.getElementById('gear_motor'),
    gearWheel: document.getElementById('gear_wheel')
  }
};

/****************** 核心功能模块 ******************/
const Calculator = {
  initialize() {
    this.setupEventListeners();
    this.loadLanguage();
    this.calculate();
  },

  setupEventListeners() {
    // 使用事件委托处理所有select变更
    document.addEventListener('change', (e) => {
      if (e.target.matches('select')) this.handleCalculation();
    });

    DOM.languageBtn.addEventListener('click', () => this.toggleLanguage());
  },

  handleCalculation() {
    clearTimeout(AppState.debounceTimer);
    AppState.debounceTimer = setTimeout(() => this.calculate(), CONFIG.DEBOUNCE_TIME);
  },

  toggleLanguage() {
    AppState.isEnglish = !AppState.isEnglish;
    localStorage.setItem('language', AppState.isEnglish ? 'en' : 'zh');
    this.updateLanguage();
  },

  loadLanguage() {
    if (localStorage.getItem('language') === 'en') this.toggleLanguage();
  },

  updateLanguage() {
    // 更新界面文本
    DOM.languageBtn.textContent = AppState.isEnglish ? '中文' : 'English';
    document.querySelectorAll('.translatable').forEach(el => {
      el.textContent = el.dataset[AppState.isEnglish ? 'en' : 'zh'];
    });

    // 强制重绘解决布局问题
    requestAnimationFrame(() => this.calculate());
  },

  calculate() {
    const inputs = this.getInputValues();
    const result = this.calculateSpeed(inputs);
    const validation = this.validateDesign(inputs);

    this.updateResult(result);
    this.showWarnings(validation);
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
    return (motor * wheel * gearMotor / gearWheel * CONFIG.CALCULATION.FACTOR).toFixed(2);
  },

  validateDesign({ wheel, gearMotor, gearWheel }) {
    const minWheel = Math.max(gearMotor, gearWheel) / CONFIG.CALCULATION.GEAR_RATIO;
    const maxWheel = (gearMotor + gearWheel) * CONFIG.CALCULATION.SAFETY_MARGIN / CONFIG.CALCULATION.GEAR_RATIO;

    return {
      isInvalid: wheel < minWheel || wheel > maxWheel,
      message: AppState.isEnglish 
        ? `Warning: Wheel diameter should be between ${minWheel.toFixed(2)}" and ${maxWheel.toFixed(2)}"`
        : `警告：车轮直径应在 ${minWheel.toFixed(2)} 至 ${maxWheel.toFixed(2)} 英寸之间`
    };
  },

  updateResult(value) {
    DOM.result.textContent = value;
  },

  showWarnings({ isInvalid, message }) {
    DOM.error.classList.toggle('visible', isInvalid);
    DOM.error.textContent = message;
  },

  updateComponentImages({ motor, wheel, gearMotor, gearWheel }) {
    this.updateImage('motorImage', 'motor', motor);
    this.updateImage('wheelImage', 'wheel', wheel);
    this.updateImage('GmImage', 'gear', gearMotor);
    this.updateImage('GwImage', 'gear', gearWheel);
  },

  updateImage(containerId, type, value) {
    const container = document.getElementById(containerId);
    const config = CONFIG.IMAGE[type.toUpperCase()];
    const path = `${config.BASE_PATH}${value}.png`;

    // 清除旧内容
    container.innerHTML = '<div class="image-loader"></div>';

    // 使用缓存或加载新图片
    if (AppState.imageCache.has(path)) {
      container.replaceChildren(AppState.imageCache.get(path).cloneNode(true));
      return;
    }

    const img = new Image();
    img.src = path;
    img.className = 'dynamic-image';
    img.alt = `${type} visualization`;
    img.height = this.calculateImageSize(type, value, config);

    img.onload = () => {
      AppState.imageCache.set(path, img.cloneNode(true));
      container.replaceChildren(img);
    };

    img.onerror = () => {
      container.innerHTML = '<div class="image-error">⚠️</div>';
      console.error('Image load failed:', path);
    };
  },

  calculateImageSize(type, value, config) {
    switch(type) {
      case 'motor':
        return config.DEFAULT_SIZE;
      case 'wheel':
        return value * config.SIZE_MULTIPLIER;
      case 'gear':
        return (value / config.BASE_RATIO) * CONFIG.IMAGE.WHEEL.SIZE_MULTIPLIER * config.SCALE_FACTOR;
      default:
        return 100;
    }
  }
};

/****************** 初始化应用 ******************/
document.addEventListener('DOMContentLoaded', () => {
  Calculator.initialize();
});