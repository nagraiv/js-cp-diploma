/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {

};

class ApiRequest {
    static ULR = 'https://jscp-diplom.netoserver.ru/';
    static options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    static getSchedule() {
        const init = Object.assign( { body: 'event=update' }, this.options );
        console.log(init);
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => console.log(result));
    }

}

ApiRequest.getSchedule();
