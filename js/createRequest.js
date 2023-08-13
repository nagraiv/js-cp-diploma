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

    static getSeats( data={}, callback = f => f ) {
        console.log(data);
        let body = 'event=get_hallConfig';
        try {
            for (let key in data) {
                body += `&${ key }=${ data[key] }`;
            }
        } catch (e) {
            console.warn('Недопустимый формат данных! ', e);
        }
        console.log(body);
        const init = Object.assign( { body }, this.options );
        fetch( this.ULR, init )
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => console.warn(error));
    }

    static getRequest(body, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", "https://jscp-diplom.netoserver.ru/", true);
        xhr.responseType = "json";
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
        xhr.onload = () => {
            callback(xhr.response);
        };
    };
}

