import ApiRequest from './createRequest.js';

/**
 * Класс Hall инкапсулирует логику страницы hall.html
 * отрисовывает посадочные места в зале
 * с учётом ранее забронированных
 * */
class Hall {
    constructor() {
        this.urlSearsh = new URL(location.href).searchParams;
        this.setBuyingInfo();

        this.hallPlan = document.querySelector('.conf-step__wrapper');
        this.hallPlan.addEventListener('click', this.chooseSeats.bind(this));
        this.fillSeats();

        this.bookBtn = document.querySelector('.accepting-button');
        this.bookBtn.disabled = true;
        this.bookBtn.addEventListener('click', this.bookSeats.bind(this));

        this.zoom = false;
        document.querySelector('.buying').addEventListener('dblclick', this.doubleTap.bind(this));
    }

    /**
     * Извлекает из Session Storage
     * информацию о сеансе и заполняет
     * соответствующий раздел страницы
     * */
    setBuyingInfo() {
        const container = document.querySelector('.buying__info-description');
        const { movieName, seanceTime, hallName } = JSON.parse(sessionStorage.getItem( 'info' ));
        container.querySelector('.buying__info-title').textContent = movieName;
        container.querySelector('.buying__info-start').textContent = 'Начало сеанса: ' + seanceTime;
        container.querySelector('.buying__info-hall').textContent = hallName;
    }

    /**
     * Заполняет посадочные места в зале и легенду.
     * Использует ApiRequest.getSeats, чтобы получить
     * информацию о забронированных местах, остальную
     * информацию восстанавливает из Session Storage
     * */
    fillSeats() {
        const currentHall = JSON.parse(sessionStorage.getItem( 'halls' ))
            .find(item => item.hall_id === this.urlSearsh.get('hallId'));
        this.hallPlan.innerHTML = currentHall['hall_config'];
        this.hallPlan.parentElement.querySelector('.price-standart')
            .textContent = currentHall['hall_price_standart'];
        this.hallPlan.parentElement.querySelector('.price-vip')
            .textContent = currentHall['hall_price_vip'];

        const hallId = this.urlSearsh.get('hallId');
        const seanceId = this.urlSearsh.get('seanceId');
        const timestamp = this.urlSearsh.get('timestamp');
        ApiRequest.getSeats( { timestamp, hallId, seanceId }, ( response ) => {
            // console.log(response);
            this.hallPlan.innerHTML = response || currentHall['hall_config'];
        });
    }

    /**
     * Отслеживает нажатие на посадочные места
     * назначает класс conf-step__chair_selected
     * активирует кнопку "Забронировать"
     * */
    chooseSeats( event ) {
        const clickable = event.target.classList.contains('conf-step__chair') &&
            !event.target.classList.contains('conf-step__chair_taken') &&
            !event.target.classList.contains('conf-step__chair_disabled');
        if ( clickable ) {
            event.target.classList.toggle('conf-step__chair_selected');
        }
        this.bookBtn.disabled = !this.hallPlan.querySelector('.conf-step__chair_selected');
    }

    /**
     * Отслеживает нажатие на кпопку "Забронировать"
     * посчитывает стоимость билетов
     * фиксирует выбранные места
     * сохраняет эти данные в Session Storage
     * */
    bookSeats() {
        location.href=`payment.html?${ this.urlSearsh.toString() }`;
        sessionStorage.setItem('hallConfiguration', this.hallPlan.innerHTML);

        const standard = [...this.hallPlan.querySelectorAll('.conf-step__chair_selected.conf-step__chair_standart')];
        const vip = [...this.hallPlan.querySelectorAll('.conf-step__chair_selected.conf-step__chair_vip')];
        const sum = standard.length *
            this.hallPlan.parentElement.querySelector('.price-standart').textContent +
            vip.length *
            this.hallPlan.parentElement.querySelector('.price-vip').textContent;
        sessionStorage.setItem('totalPrice', sum.toString());

        const rows = [...this.hallPlan.querySelectorAll('.conf-step__row')];
        const selected = [];
        for (let i in rows) {
            const currentRow = [...rows[i].querySelectorAll('.conf-step__chair:not(.conf-step__chair_disabled)')];
            for (let j in currentRow) {
                if (standard.includes(currentRow[j]) || vip.includes(currentRow[j])) {
                    selected.push( (+i + 1) + '/' + (+j + 1));
                }
            }
        }
        sessionStorage.setItem('chosenSeats', selected.join(', '));
    }

    /**
     * Отслеживает двойной клик/касание
     * по содержимому страницы
     * увеличивает масштаб в два раза
     * */
    doubleTap( event ) {
        event.preventDefault();
        const { width, height } = event.currentTarget.getBoundingClientRect();
        if (!this.zoom) {
            // console.log(event.target);
            event.currentTarget.style.zoom = '2';
            // event.currentTarget.style.transform = `scale(2) translate(${width / 4}px, ${height / 4}px)`;
            setTimeout(window.scrollTo, 300, event.clientX, event.clientY);
        } else {
            event.currentTarget.style.zoom = '1';
            // event.currentTarget.style.transform = '';
            setTimeout(window.scrollTo, 300, event.clientX, event.clientY);
        }
        this.zoom = !this.zoom;
    }
}

const hall = new Hall();
