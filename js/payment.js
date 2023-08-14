import ApiRequest from './createRequest.js';

/**
 * Класс Payment инкапсулирует логику страницы payment.html
 * отрисовывает посадочные места в зале
 * с учётом ранее забронированных
 * */
class Payment {
    constructor() {
        this.urlSearsh = new URL(location.href).searchParams;
        this.bookBtn = document.querySelector('.accepting-button');
        this.bookBtn.onclick = () => location.href=`ticket.html?${ this.urlSearsh.toString() }`;
        this.setBuyingInfo();
    }

    /**
     * Извлекает из Session Storage информацию
     * о сеансе и выбранных местах, заполняет
     * соответствующий раздел страницы
     * */
    setBuyingInfo() {
        const container = document.querySelector('.ticket__info-wrapper');
        const { movieName, seanceTime, hallName } = JSON.parse(sessionStorage.getItem( 'info' ));
        container.querySelector('.ticket__title').textContent = movieName;
        container.querySelector('.ticket__hall').textContent = hallName;
        container.querySelector('.ticket__start').textContent = seanceTime
            + ', ' + new Date(this.urlSearsh.get('timestamp')*1000).toLocaleDateString();

        container.querySelector('.ticket__chairs')
            .textContent = sessionStorage.getItem( 'chosenSeats' );

        container.querySelector('.ticket__cost')
            .textContent = sessionStorage.getItem( 'totalPrice' );
    }
}

const payPage = new Payment();
