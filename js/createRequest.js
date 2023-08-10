/**
 * Класс инкапсулирует логику запросов на сервер.
 * */
export default class ApiRequest {
    static ULR = 'https://jscp-diplom.netoserver.ru/';
    static options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    static getSchedule( callback = f => f ) {
        const init = Object.assign( { body: 'event=update' }, this.options );
        // console.log(init);
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => console.warn(error));
    }

}

