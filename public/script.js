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
        if (events[dateString] && events[dateString].length > 0) {
            const eventDotsContainer = document.createElement('div');
            eventDotsContainer.classList.add('event-dots-container');

            events[dateString].forEach(event => {
                const eventDot = document.createElement('div');
                eventDot.classList.add('event-dot');
                eventDot.classList.add(`event-dot-${event.category || 'default'}`);
                eventDot.setAttribute('title', event.title);
                eventDotsContainer.appendChild(eventDot);
            });

            dayElement.appendChild(eventDotsContainer);
        }

        if (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => selectDate(dateString));
        dayElement.addEventListener('dblclick', () => showDayEvents(dateString));
        dayElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectDate(dateString);
                showDayEvents(dateString);
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
        document.getElementById('event-time-start').value = event.time;
        document.getElementById('event-time-end').value = event.time;
        document.getElementById('event-description').value = event.description;
        document.getElementById('delete-event').style.display = 'inline-block';
    } else {
        document.getElementById('event-title').value = '';
        document.getElementById('event-time-start').value = '';
        document.getElementById('event-time-end').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('delete-event').style.display = 'none';
    }
    updateSelectedDay();
}

function showDayEvents(dateString) {
    const modal = document.getElementById('day-events-modal');
    const modalDate = document.getElementById('modal-date');
    const modalEventsList = document.getElementById('modal-events-list');

    modalDate.textContent = formatDateForDisplay(dateString);
    modalEventsList.innerHTML = '';

    if (events[dateString] && events[dateString].length > 0) {
        events[dateString].forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('day-event');
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>Start: ${event.timeStart || 'Not specified'}</p>
                <p>End: ${event.timeEnd || 'Not specified'}</p>
                <p>Category: ${event.category}</p>
                <p>${event.description}</p>
                <button class="edit-event" data-index="${index}">Edit</button>
            `;
            modalEventsList.appendChild(eventElement);
        });
    } else {
        modalEventsList.innerHTML = '<p>No events scheduled for this day.</p>';
    }

    modal.style.display = 'block';

    document.querySelectorAll('.edit-event').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            editEvent(dateString, parseInt(index));
            modal.style.display = 'none';
        });
    });
}

function editEvent(dateString, index) {
    selectedDate = dateString;
    const event = events[dateString][index];
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-time-start').value = event.timeStart || '';
    document.getElementById('event-time-end').value = event.timeEnd || '';
    document.getElementById('event-category').value = event.category || 'default';
    document.getElementById('event-description').value = event.description;
    document.getElementById('delete-event').style.display = 'inline-block';
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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

function formatDateForInput(dateString) {
    return dateString;
}

function formatDateForDisplay(dateString) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
    const timeStart = document.getElementById('event-time-start').value.trim();
    const timeEnd = document.getElementById('event-time-end').value.trim();
    const category = document.getElementById('event-category').value;
    const description = document.getElementById('event-description').value.trim();

    if (!title) {
        showError('Please enter an event title.');
        return;
    }

    if (!selectedDate) {
        showError('Please select a date by double-clicking a day in the calendar.');
        return;
    }

    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }
    events[selectedDate].push({ title, timeStart, timeEnd, category, description });
    saveEvents();
    renderCalendar();
    clearForm();
});

document.getElementById('delete-event').addEventListener('click', () => {
    if (selectedDate && events[selectedDate]) {
        events[selectedDate] = events[selectedDate].filter(event => event.title !== document.getElementById('event-title').value);
        if (events[selectedDate].length === 0) {
            delete events[selectedDate];
        }
        saveEvents();
        renderCalendar();
        clearForm();
    }
});

function clearForm() {
    document.getElementById('event-title').value = '';
    document.getElementById('event-time-start').value = '';
    document.getElementById('event-time-end').value = '';
    document.getElementById('event-category').value = 'default';
    document.getElementById('event-description').value = '';
    document.getElementById('delete-event').style.display = 'none';
}

function loadEvents() {
    fetch('/api/events')
        .then(response => response.json())
        .then(data => {
            events = data;
            renderCalendar();
        })
        .catch(error => console.error('Error loading events:', error));
}

function saveEvents(date, title, timeStart, timeEnd, category, description) {
    const event = { title, timeStart, timeEnd, category, description };

    if (!events[date]) {
        events[date] = [];
    }

    events[date].push(event);

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
    document.getElementById('event-date').value = formatDateForInput(selectedDate);
    loadEvents();
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('day-events-modal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('day-events-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

renderCalendar();