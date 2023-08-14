import QRCreator from './QRCreator.js';

/**
 * Класс Ticket инкапсулирует логику страницы ticket.html
 * формирует QR-код брони
 * */
class Ticket {
    constructor() {
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
    }
}

const ticket = new Ticket();
