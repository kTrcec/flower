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
                const image_flowers = columns[3];

                const cardHTML = `
                    <div class="flower-card">
                        <div class="image-wrapper img">
                            <img src=flower/${image_flowers} alt="${title}" onclick="openImage(this.src)" style="cursor: zoom-in;">
                        </div>
                        <div class="flower-info">
                            <h3 class="flower-title">${title}</h3>
                            <p class="flower-count">🌸 В наличии: ${count}.</p>
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
