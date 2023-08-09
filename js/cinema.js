String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getClientLocale() {
    return (navigator && navigator.language) || 'ru-RU';
}

function getWeekday( date=new Date(), locale=getClientLocale() ) {
    return date.toLocaleString( locale, { weekday: 'short' } );
}

class Cinema {
    constructor() {
        this.calendar = document.querySelector('.page-nav');
        this.calendar.addEventListener('click', this.selectDay.bind(this));
        this.fillCalendar();

        this.today = new Date;
    }

    selectDay(event) {
        event.preventDefault();
        const currentDay = event.target.closest('.page-nav__day');
        if (currentDay) {
            this.calendar.querySelector('.page-nav__day_chosen')?.classList.remove('page-nav__day_chosen');
            currentDay.classList.add('page-nav__day_chosen');
        }
        //

    }

    /**
     * Заполняет календарь в навигационной панели для посмотра расписания сеансов
     * */
    fillCalendar() {
        // this.calendar.innerHTML = '';
        // const days = [{weekday: 'Ср', monthDay: 9, isToday: false, isChosen: true},
        //     {weekday: 'Пт', monthDay: 11, isToday: true, isChosen: false},
        //     {weekday: 'Вс', monthDay: 13, isToday: false, isChosen: false}];
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
            const day = {};
            day.weekday = getWeekday( currentDay ).capitalize();
            day.monthDay = currentDay.getDate();
            day.isToday = ind === todayInd;
            day.isChosen = ind === chosenInd;
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
    getDayHTML( day=
                    { weekday: 'Вт', monthDay: '9', isToday: false, isChosen: false } ) {
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



