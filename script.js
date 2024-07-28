let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
let selectedDate = null;

function renderCalendar() {
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const weekdaysContainer = document.getElementById('weekdays');
    
    monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    calendarGrid.innerHTML = '';
    weekdaysContainer.innerHTML = '';

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weekday');
        dayElement.textContent = day;
        weekdaysContainer.appendChild(dayElement);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;

        const dateString = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        if (events[dateString]) {
            const eventDot = document.createElement('div');
            eventDot.classList.add('event-dot');
            dayElement.appendChild(eventDot);
        }

        if (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => selectDate(dateString));
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(dateString) {
    selectedDate = dateString;
    document.getElementById('event-date').value = dateString;
    const event = events[dateString];
    if (event) {
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-description').value = event.description;
        document.getElementById('delete-event').style.display = 'block';
    } else {
        document.getElementById('event-title').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('delete-event').style.display = 'none';
    }
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('save-event').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value;

    if (title && date) {
        events[date] = { title, time, description };
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        renderCalendar();
        selectDate(date);
    }
});

document.getElementById('delete-event').addEventListener('click', () => {
    if (selectedDate && events[selectedDate]) {
        delete events[selectedDate];
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        renderCalendar();
        selectDate(selectedDate);
    }
});

renderCalendar();