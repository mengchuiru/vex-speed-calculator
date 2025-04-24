// js/script.js
// JavaScript代码

let isEnglish = localStorage.getItem('language') === 'en';

function toggleLanguage() {
    isEnglish = !isEnglish;
    localStorage.setItem('language', isEnglish ? 'en' : 'zh');
    updateLanguage();
}

function updateLanguage() {
    const btn = document.querySelector('.language-btn');
    btn.textContent = isEnglish ? '中文' : 'English';

    document.querySelectorAll('.translatable').forEach(element => {
        const text = isEnglish ? element.dataset.en : element.dataset.zh;
        if (element.tagName === 'OPTION') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });
}

function calculate() {
    // 获取输入值
    const inputs = {
        motor: parseFloat(document.getElementById('motor').value),
        wheel: parseFloat(document.getElementById('wheel').value),
        gear_motor: parseFloat(document.getElementById('gear_motor').value),
        gear_wheel: parseFloat(document.getElementById('gear_wheel').value)
    };
    // 计算并显示结果
    const result = (inputs.motor * inputs.wheel * inputs.gear_motor /
        inputs.gear_wheel * 0.004788).toFixed(2);
    document.getElementById('result').textContent = result;
    // 更新图片
    updateImage('motorImage', `./images/Motor/${inputs.motor}.png`, 50);
    updateImage('wheelImage', `./images/Omni Wheel/${inputs.wheel}.png`, inputs.wheel * 30);
    updateImage('GmImage', `./images/Gear/${inputs.gear_motor}.png`, inputs.gear_motor / 12 * 30 * 0.5);
    updateImage('GwImage', `./images/Gear/${inputs.gear_wheel}.png`, inputs.gear_wheel / 12 * 30 * 0.5);

}

// 图片函数
function updateImage(containerId, path, scaled) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const img = new Image();
    img.src = path;
    img.className = 'dynamic-image';
    img.alt = 'Component Image';
    img.onerror = () => {
        img.src = './images/placeholder.svg';
        console.error('Image load failed:', path);
    };
    img.height = scaled;

    container.appendChild(img);
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    if (isEnglish) updateLanguage();
    calculate();
});