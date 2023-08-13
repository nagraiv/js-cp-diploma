import ApiRequest from './createRequest.js';

// console.log(location.href);
// const url = new URL(location.href);
// console.log(url.searchParams);
// const movieId = url.searchParams.get('movieId');
// const hallId = url.searchParams.get('hallId');
// const seanceId = url.searchParams.get('seanceId');
// let timestamp = url.searchParams.get('timestamp');
// console.log(movieId, hallId, seanceId, timestamp);
// timestamp -= 60*60*7;
// console.log(timestamp);
//
// // console.log(new Date('2023-08-11T00:00+07:00'));
// // console.log(new Date(2023,8,11));
// const now = new Date();
// const stamp = now.setHours(0,0,0,0);
// console.log(now);
// console.log(new Date(stamp));
//
// // timestamp += stamp;
// // timestamp /= 1000;
// ApiRequest.getSeats( { timestamp, hallId, seanceId }, ( response ) => {
//     console.log(response);
// });
//
//
// let today = new Date();
// today.setHours(0, 0, 0);
// for (let i = 0; i < 6; i++) {
//     let day = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));
//     let timestamp = Math.trunc(day / 1000);
//     console.log(timestamp);
//     // let timeStampSeanceDay = Number(movieSeance.dataset.seanceStart) * 60;
//     // let timeStampSeance = timeStampDay + timeStampSeanceDay;
//     // let timeStampNow = Math.trunc(+new Date() / 1000);
// }
//
// let body = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;
// console.log(body);
//
// ApiRequest.getRequest( body, ( response ) => {
//     console.log(response);
// });

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
        console.log(hallId, seanceId, timestamp);
        ApiRequest.getSeats( { timestamp, hallId, seanceId }, ( response ) => {
            console.log(response);
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
        sessionStorage.setItem('chosenSeats', selected.toString());
    }
}

const hall = new Hall();
