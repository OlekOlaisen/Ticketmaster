export default function Event() {
	const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
const url = `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=3AHIueOLGj4rurjN2j5YRIF5Pqvmi51H`;

const eventDetailsContainer = document.getElementById('event-details-container');

fetch(url)
  .then(response => response.json())
  .then(event => {
    const name = event.name;
    const date = event.dates.start.localDate;
    const timeStart = event.dates.start.localTime;
    const venue = event._embedded.venues[0].name;
    const imageUrl = event.images.find(image => image.width > 500)?.url;
    const ticketUrl = event.url;
    const availableTickets = event.dates.status.code === 'onsale' ? 'Available tickets!' : 'Tickets not yet on sale';
    const category = event.classifications[0].segment.name;

    eventDetailsContainer.innerHTML = `
      <div class="event-image__container">
        <img class="event-image" src="${imageUrl}" alt="${name}">
      </div>
      <div class="event__container"> 
        <div class="event-details__container">
          <h2 class="event-details__name">${name}</h2>
          <p class="event-details__date">Date: ${date}</p>
          <p class="event-details__time">Time: ${timeStart}</p>
          <p class="event-details__venue">Venue: ${venue}</p>
          <p class="event-details__tickets">${availableTickets}</p>
          <p class="event-details__category">Category: ${category}</p>
          <a class="event-details__button" href="${ticketUrl}" target="_blank">Buy Tickets</a>
        </div>
        <div class="event__map"></div>
      </div>
    `;
  })
  .catch(error => console.error(error));

}

Event();

