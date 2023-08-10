import ApiRequest from './createRequest.js';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getClientLocale() {
    return (navigator && navigator.language) || 'ru-RU';
}

function getWeekday( date=new Date(), locale=getClientLocale() ) {
    return date.toLocaleString( locale, { weekday: 'short' } );
}

function pluralizeMinutes( quantity ) {
    const rusPluralize = new Intl.PluralRules('ru-RU');
    const pluralize = (quantity, ...nounCase) => {
        const result = rusPluralize.select(quantity);
        switch (result) {
            case 'one': return nounCase[0];
            case 'few': return nounCase[1];
            case 'many': return nounCase[2];
        }
    }
    return pluralize(quantity, 'минута', 'минуты', 'минут');
}

class Cinema {
    constructor() {
        this.calendar = document.querySelector('.page-nav');
        this.calendar.addEventListener('click', this.selectDay.bind(this));
        this.fillCalendar();

        this.movieContainer = document.querySelector('main');
        this.renderSchedule();
    }

    renderSchedule() {
        ApiRequest.getSchedule( (response) => {
            console.log(response);
            let html = ''
            response.films.result.forEach(movie => html += this.getMovieHTML( movie, response ));
            // console.log(html);
            this.movieContainer.innerHTML = html;
        } );
    }

    /**
     * Формирует HTML-код секции с полной информацией
     * о фильме, включая расписание сеансов
     * movie - объект c информацией о конкретном фильме
     * response - ответ сервера с данными по всем фильмам, залам, сеансам
     * */
    getMovieHTML( movie, response ) {
        const movieId = movie.film_id;
        const halls = response.halls.result
            // выбираем открытые залы, в которых есть сеансы на конкретный фильм
            .filter(item => item.hall_open === '1' && response.seances.result
                .some(el => el.seance_hallid === item.hall_id && el.seance_filmid === movieId))
            // на всякий случай сортируем залы по названию
            .sort( (a, b) => a.hall_name > b.hall_name );

        // в расписание добавляем только те фильмы, по которым нашли сеансы
        if (!halls || halls.length === 0) {
            return;
        }
        // console.log('Залы: ', halls);
        let html = `
            <section class="movie" data-film_id="${movieId}">
        `;
        html += this.getMovieInfoHTML( movie );
        halls.forEach(hall => html += this.getHallHTML( hall, movieId, response ));
        return html + `
            </section>`;
    }

    /**
     * Формирует HTML-код div-элемента с информации о фильме.
     * info - объект c информацией о фильме
     * */
    getMovieInfoHTML( info={} ) {
        const { film_poster: poster,
                film_name: name,
                film_description: description,
                film_duration: duration,
                film_origin: origin } = info;
        return `<div class="movie__info">
            <div class="movie__poster">
                <img class="movie__poster-image" alt="постер фильма" src="${ poster }">
            </div>
            <div class="movie__description">
                <h2 class="movie__title">${ name }</h2>
                <p class="movie__synopsis">${ description }</p>
                <p class="movie__data">
                    <span class="movie__data-duration">${ duration } ${ pluralizeMinutes( duration ) }</span>
                    <span class="movie__data-origin">${ origin }</span>
                </p>
            </div>
        </div>
        `;
    }

    /**
     * Формирует HTML-код div-элемента с расписанием
     * сеансов конкретного фильма в конкретном зале.
     * hall - объект c информацией о зале
     * response - ответ сервера с данными по всем фильмам, залам, сеансам
     * */
    getHallHTML(  hall, movieId, response  ) {
        const seances = response.seances.result
            .filter(item => item.seance_filmid === movieId && item.seance_hallid === hall.hall_id)
            // сортируем сеансы по времени начала
            .sort((a, b) => a.seance_time > b.seance_time);
        // console.log('Сеансы: ', seances);
        let html = `<div class="movie-seances__hall">
        <h3 class="movie-seances__hall-title">${ hall.hall_name }</h3>
        <ul class="movie-seances__list">
        `;
        seances.forEach(seance => html += this.getSeanceHTML( seance ));
        return html + `</ul>
            </div>
        `;
    }

    /**
     * Формирует HTML-код одного сеанса
     * seance - объект c информацией о сеансе
     * */
    getSeanceHTML( seance ) {
        return `<li class="movie-seances__time-block">
            <a class="movie-seances__time" href="html/hall.html">${ seance.seance_time }</a>
            </li>
        `;
    }

    /**
     * Отслеживает нажатие на панель календаря
     * если пользователь выбрал другой (не выбранный в настоящий момент) день
     * то переносит класс page-nav__day_chosen
     * и вызывает перерисовку страницы с расписанием
     * */
    selectDay( event ) {
        event.preventDefault();
        const previousChosenDay = this.calendar.querySelector('.page-nav__day_chosen');
        const newChosenDay = event.target.closest('.page-nav__day');
        if (newChosenDay && newChosenDay!==previousChosenDay) {
            previousChosenDay?.classList.remove('page-nav__day_chosen');
            newChosenDay.classList.add('page-nav__day_chosen');

            this.renderSchedule();
        }
    }

    /**
     * Заполняет календарь в навигационной панели для посмотра расписания сеансов
     * */
    fillCalendar() {
        this.calendar.innerHTML = this.getCalendarHTML( this.getDaysArray() );
    }

    /**
     * Формирует массив дней для последующей отрисовки календаря
     * currentDay - первый день, с которого начинается календарь, по умолчанию - сегодня,
     * number - количество дней, отображаемых в панеле календаря
     * todayInd - индекс сегодняшнего дня, по умолчанию - начальный
     * chosenInd - индекс выбранного дня, по умолчанию - начальный
     * */
    getDaysArray( currentDay=new Date(), number=6, todayInd=0, chosenInd=0 ) {
        const days = [];
        for (let ind = 0; ind < number; ind += 1) {
            const day = {
                weekday: getWeekday( currentDay ).capitalize(),
                monthDay: currentDay.getDate(),
                isToday: ind === todayInd,
                isChosen: ind === chosenInd,
            };
            days.push( day );
            // прибавляем один день
            currentDay.setDate( currentDay.getDate() + 1 );
        }
        return days;
    }

    /**
     * Формирует HTML-код одного дня в календаре.
     * day - объект вида { weekday, day, isToday, isChosen }
     * */
    getDayHTML( day={} ) {
        return `<a class="page-nav__day 
                ${day.isToday ? 'page-nav__day_today' : ''} 
                ${day.isChosen ? 'page-nav__day_chosen' : ''} 
                ${day.weekday === 'Сб' || day.weekday === 'Вс' ? 'page-nav__day_weekend' : ''}
                " href="#">
                    <span class="page-nav__day-week">${day.weekday}</span>
                    <span class="page-nav__day-number">${day.monthDay}</span>
                </a>`;
    }

    /**
     * Формирует HTML-код всего календаря.
     * days - массив объектов вида { weekday, day, isToday, isChosen }
     * для каждого элемента массива вызывает функцию getDayHTML
     * */
    getCalendarHTML( days=[] ) {
        return days.reduce((acc, item) => acc += this.getDayHTML( item ), '');
    }
}

const schedule = new Cinema();



