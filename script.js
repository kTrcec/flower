const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRWKhHCPBrbsBbGrtGa-oElgN2lAx7gaXC_o75Ek2Az9nOxjqYftqLazP-NVWg3XwN0iRxlc5LBSybv/pub?output=tsv`;

async function loadFlowers() {
    try {
        const response = await fetch(url);
        const data = await response.text();
        
        console.log(data);

        const catalog = document.getElementById('catalog'); 
        catalog.innerHTML = '';

        const rows = data.split('\n');

        rows.forEach(row => {
            const cleanRow = row.replace(/"/g, '').trim();
            if (!cleanRow) return;

            const columns = cleanRow.split('\t');
            
            if (columns.length >= 2) {
                const title = columns[0].trim();  // Название
                const price = columns[1].trim();  //Цена
                const count = columns[2].trim();  //Количество
                const imagesStr = columns.slice(3).join(' ').trim();
                
                const images = imagesStr ? imagesStr.split(/\s+/).map(img => img.trim()).filter(img => img !== '') : [];
                
                const firstImage = images.length > 0 ? images[0] : 'default.jpg'; 
                
                const showArrows = images.length > 1;

                let dotsHTML = '';
                if (images.length > 1) {
                    dotsHTML = `<div class="slider-dots">`;
                    images.forEach((_, index) => {
                        const dotNumber = index + 1; // Человеческий отсчет с 1
                        dotsHTML += `<span class="dot ${dotNumber === 1 ? 'active' : ''}" data-dot="${dotNumber}"></span>`;
                    });
                    dotsHTML += `</div>`;
                }

                const cardHTML = `
                    <div class="flower-card">
                        <!-- Добавляем события мыши для реализации свайпа на десктопе -->
                        <div class="image-wrapper" 
                             style="position: relative;" 
                             onmousedown="startSwipe(event, this)"
                             onmousemove="moveSwipe(event)"
                             onmouseup="endSwipe(event)"
                             onmouseleave="endSwipe(event)">
                            
                            <img src="flower/${firstImage}" 
                                 data-images="${images.join(',')}" 
                                 data-index="1" 
                                 alt="${title}" 
                                 onclick="openImage(this.src)" 
                                 style="cursor: zoom-in;"
                                 draggable="false"> <!-- Запрещаем стандартное перетаскивание браузера -->
                                 
                            ${dotsHTML}
                        </div>
                        <div class="flower-info">
                            <h3 class="flower-title">${title}</h3>
                            <p class="flower-count">🌸 В наличии: ${count}</p>
                            <p class="flower-price">${price} ₽</p>
                        </div>
                    </div>
                `;
    } catch (error) {
        console.error('Ошибка сборки карточек:', error);
    }
}

let isDragging = false;
let startX = 0;
let currentWrapper = null;

// 1. Нажатие кнопки мыши
window.startSwipe = function(event, wrapper) {
    // Если кликнули левой кнопкой мыши
    if (event.button === 0) { 
        isDragging = true;
        startX = event.clientX;
        currentWrapper = wrapper;
    }
};

// 2. Движение мыши (срабатывает, только если кнопка зажата)
window.moveSwipe = function(event) {
    if (!isDragging || !currentWrapper) return;
};

// 3. Отпускание мыши или уход курсора из зоны картинки
window.endSwipe = function(event) {
    if (!isDragging || !currentWrapper) return;
    
    isDragging = false;
    const endX = event.clientX;
    const diffX = endX - startX;
    
    // Порог чувствительности свайпа в пикселях
    const swipeThreshold = 50; 
    
    // Если сдвинули достаточно далеко
    if (Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
            // Свайп влево -> Следующая картинка (+1)
            updateSliderImage(currentWrapper, 1);
        } else {
            // Свайп вправо -> Предыдущая картинка (-1)
            updateSliderImage(currentWrapper, -1);
        }
    }
    
    currentWrapper = null;
};

// Функция обновления картинки и точек-кружочков
function updateSliderImage(wrapper, direction) {
    const img = wrapper.querySelector('img');
    const images = img.getAttribute('data-images')
                      .split(',')
                      .map(name => name.trim())
                      .filter(name => name.length > 0);
    
    if (images.length <= 1) return; // Если картинка одна, ничего не делаем

    // Считываем текущий индекс (работаем в отсчете с 1, как тебе удобно)
    let currentIndex = parseInt(img.getAttribute('data-index') || 1, 10);
    
    // Меняем индекс в зависимости от направления свайпа
    currentIndex += direction;
    
    // Зацикливаем слайдер (границы от 1 до images.length)
    if (currentIndex > images.length) currentIndex = 1;
    if (currentIndex < 1) currentIndex = images.length;
    
    // Сохраняем обновленный индекс назад в атрибут
    img.setAttribute('data-index', currentIndex);
    
    // Меняем путь к картинке (подставляем массив с индексацией от 0, поэтому вычитаем 1)
    const nextImage = images[currentIndex - 1];
    const currentSrc = img.src;
    const lastSlashIndex = currentSrc.lastIndexOf('/');
    const basePath = currentSrc.substring(0, lastSlashIndex + 1);
    img.src = basePath + nextImage;
    
    // Обновляем визуальный статус точек-кружочков
    const dots = wrapper.querySelectorAll('.slider-dots .dot');
    dots.forEach(dot => {
        const dotIndex = parseInt(dot.getAttribute('data-dot'), 10);
        if (dotIndex === currentIndex) {
            dot.classList.add('active'); // Закрашенный полный кружок
        } else {
            dot.classList.remove('active'); // Выколотый кружок
        }
    });
}


loadFlowers();

const overlayHTML = `
    <div id="imageOverlay" class="image-overlay">
        <img id="fullImage" class="full-image" src="" alt="Полный экран">
    </div>
`;
document.body.insertAdjacentHTML('beforeend', overlayHTML);

const overlay = document.getElementById('imageOverlay');
const fullImage = document.getElementById('fullImage');

window.openImage = function(src) {
    fullImage.src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});
