const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRWKhHCPBrbsBbGrtGa-oElgN2lAx7gaXC_o75Ek2Az9nOxjqYftqLazP-NVWg3XwN0iRxlc5LBSybv/pub?output=tsv`;

async function loadFlowers() {
    try {
        const response = await fetch(url);
        const data = await response.text();
        
        console.log(data);

        const catalog = document.getElementById('catalog'); 
        catalog.innerHTML = ''; // Очищаем экран перед загрузкой

        // Разрезаем текст на отдельные строчки
        const rows = data.split('\n');

        rows.forEach(row => {
            const cleanRow = row.replace(/"/g, '').trim();
            if (!cleanRow) return;

            const columns = cleanRow.split('\t');
            
            if (columns.length >= 2) {
                const title = columns[0].trim();  // Колонка А: Название
                const price = columns[1].trim();  // Колонка B: Цена
                const count = columns[2].trim();  // Колонка C: Количество
                const imagesStr = columns[3] ? columns[3].trim() : '';
                
                // Разбиваем строку по пробелам на массив отдельных картинок и чистим от скрытых символов
                const images = imagesStr ? imagesStr.split(/\s+/).map(img => img.trim()).filter(img => img !== '') : [];
                
                // Берем первую картинку для главного отображения, либо заглушку
                const firstImage = images.length > 0 ? images[0] : 'default.jpg'; 
                
                // Стрелочки показываем только если картинок в ячейке больше одной
                const showArrows = images.length > 1;

                const cardHTML = `
                    <div class="flower-card">
                        <div class="image-wrapper" style="position: relative;">
                            ${showArrows ? `<button class="slider-btn prev-btn" onclick="changeImage(this, -1, event)">&#10094;</button>` : ''}
                            
                            <img src="flower/${firstImage}" 
                                 data-images="${images.join(',')}" 
                                 data-index="0" 
                                 alt="${title}" 
                                 onclick="openImage(this.src)" 
                                 style="cursor: zoom-in;">
                                 
                            ${showArrows ? `<button class="slider-btn next-btn" onclick="changeImage(this, 1, event)">&#10095;</button>` : ''}
                        </div>
                        <div class="flower-info">
                            <h3 class="flower-title">${title}</h3>
                            <p class="flower-count">🌸 В наличии: ${count}</p>
                            <p class="flower-price">${price} ₽</p>
                        </div>
                    </div>
                `;
                catalog.innerHTML += cardHTML;
            }
        });

    } catch (error) {
        console.error('Ошибка сборки карточек:', error);
    }
}

// Универсальная функция переключения картинок с вашей защитой путей
window.changeImage = function(button, direction, event) {
    // Останавливаем всплытие клика, чтобы не срабатывал клик по карточке/картинке
    if (event) event.stopPropagation(); 
    
    const wrapper = button.parentElement;
    const img = wrapper.querySelector('img');
    
    const images = img.getAttribute('data-images')
                      .split(',')
                      .map(name => name.trim())
                      .filter(name => name.length > 0);
                      
    let currentIndex = parseInt(img.getAttribute('data-index') || 0, 10);
    
    currentIndex += direction;
    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;
    
    const nextImage = images[currentIndex];
    img.setAttribute('data-index', currentIndex);
    
    const currentSrc = img.src;
    const lastSlashIndex = currentSrc.lastIndexOf('/');
    const basePath = currentSrc.substring(0, lastSlashIndex + 1);
    
    img.src = basePath + nextImage;
};


loadFlowers();

// Динамически создаем и добавляем модальное окно в body
const overlayHTML = `
    <div id="imageOverlay" class="image-overlay">
        <img id="fullImage" class="full-image" src="" alt="Полный экран">
    </div>
`;
document.body.insertAdjacentHTML('beforeend', overlayHTML);

const overlay = document.getElementById('imageOverlay');
const fullImage = document.getElementById('fullImage');

// Функция открытия картинки
window.openImage = function(src) {
    fullImage.src = src;
    overlay.classList.add('active'); // Просто добавляем класс
    document.body.style.overflow = 'hidden'; // Отключаем прокрутку сайта
}

// Функция закрытия
overlay.addEventListener('click', () => {
    overlay.classList.remove('active'); // Просто убираем класс
    document.body.style.overflow = ''; // Возвращаем прокрутку сайта
});
