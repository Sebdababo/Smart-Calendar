let currentDate = new Date();
let events = {};
let selectedDate = null;

function renderCalendar() {
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const weekdaysContainer = document.getElementById('weekdays');
    
    monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    calendarGrid.innerHTML = '';
    weekdaysContainer.innerHTML = '';

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weekday');
        dayElement.textContent = day;
        weekdaysContainer.appendChild(dayElement);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        dayElement.setAttribute('role', 'gridcell');
        dayElement.setAttribute('tabindex', '0');

        const dateString = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        if (events[dateString]) {
            const eventDot = document.createElement('div');
            eventDot.classList.add('event-dot');
            eventDot.setAttribute('title', 'Event scheduled');
            dayElement.appendChild(eventDot);
        }

        if (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => selectDate(dateString));
        dayElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectDate(dateString);
            }
        });
        calendarGrid.appendChild(dayElement);
    }

    updateSelectedDay();
}

function selectDate(dateString) {
    selectedDate = dateString;
    document.getElementById('event-date').value = dateString;
    const event = events[dateString];
    if (event) {
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-description').value = event.description;
        document.getElementById('delete-event').style.display = 'inline-block';
    } else {
        document.getElementById('event-title').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('delete-event').style.display = 'none';
    }
    updateSelectedDay();
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function updateSelectedDay() {
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => {
        day.classList.remove('selected');
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day.textContent));
        if (formatDate(dayDate) === selectedDate) {
            day.classList.add('selected');
        }
    });
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
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
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value.trim();

    if (!title) {
        showError('Please enter an event title.');
        return;
    }

    if (!date) {
        showError('Please select a date.');
        return;
    }

    events[date] = { title, time, description };
    saveEvents();
    renderCalendar();
    selectDate(date);
});

document.getElementById('delete-event').addEventListener('click', () => {
    if (selectedDate && events[selectedDate]) {
        delete events[selectedDate];
        saveEvents();
        renderCalendar();
        selectDate(selectedDate);
    }
});

document.getElementById('event-date').addEventListener('input', (e) => {
    selectedDate = e.target.value;
    updateSelectedDay();
});

function loadEvents() {
    fetch('/api/events')
        .then(response => response.json())
        .then(data => {
            events = data;
            renderCalendar();
        })
        .catch(error => console.error('Error loading events:', error));
}

function saveEvents() {
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
    })
    .catch(error => console.error('Error saving events:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    selectedDate = formatDate(today);
    document.getElementById('event-date').value = selectedDate;
    loadEvents();
});

renderCalendar();