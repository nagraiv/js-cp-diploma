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
        const init = this.bodyMaker('event=update');
            // Object.assign( { body: 'event=update' }, this.options );
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => console.warn(error));
    }

    static getSeats( data={}, callback = f => f ) {
        // console.log(data);
        // let body = 'event=get_hallConfig';
        // try {
        //     for (let key in data) {
        //         body += `&${ key }=${ data[key] }`;
        //     }
        // } catch (e) {
        //     console.warn('Недопустимый формат данных! ', e);
        // }
        // console.log(body);
        const init = this.bodyMaker('event=get_hallConfig', data);
            // Object.assign( { body }, this.options );
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => console.warn(error));
    }

    static getTickets( data={}, callback = f => f ) {
        const init = this.bodyMaker('event=sale_add', data);
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => {
                console.warn(error);
                alert('Произошёл сбой! Повторите попытку бронирования.');
            });
    }

    static bodyMaker( event='', data={} ) {
        console.log(event, data);
        let body = event;
        try {
            for (let key in data) {
                body += `&${ key }=${ data[key] }`;
            }
        } catch (e) {
            console.warn('Недопустимый формат данных! ', e);
        }
        console.log(body);
        return Object.assign( { body }, this.options );
    }
}

