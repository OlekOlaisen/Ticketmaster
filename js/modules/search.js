export default function Search() {
  const searchForm = document.querySelector('#search-form');
  const citySearchInput = document.querySelector('#city-search-input');
  const resultsContainer = document.querySelector('#results-container');
  const apiSecret = '3AHIueOLGj4rurjN2j5YRIF5Pqvmi51H';

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const updateFavoritesInLocalStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
    handleSearchSubmit(event);
  };

  const handleInputChange = (event) => {
    handleSearchSubmit(event);
  };

  searchForm.addEventListener('submit', handleFormSubmit);
  citySearchInput.addEventListener('input', handleInputChange);
  document.querySelector('#category-select').addEventListener('change', handleInputChange);
  
  // Date range inputs
  const startDateInput = document.querySelector('#start-date-input');
  const endDateInput = document.querySelector('#end-date-input');
  startDateInput.addEventListener('change', handleInputChange);
  endDateInput.addEventListener('change', handleInputChange);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const searchQuery = citySearchInput.value.trim().split(/\s+/).join('%20');
    const categorySelect = document.querySelector('#category-select');
    const category = categorySelect.value;

    const startDate = startDateInput.value ? new Date(startDateInput.value).toISOString().split('T')[0] : '';
    const endDate = endDateInput.value ? new Date(endDateInput.value).toISOString().split('T')[0] : '';
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${searchQuery}&locale=*&classificationName=${category}&apikey=${apiSecret}&size=100&sort=date,asc`;

    if (startDate && endDate) {
      url += `&startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T23:59:59Z`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        resultsContainer.innerHTML = '';

        if (data._embedded && data._embedded.events) {
          let events = data._embedded.events;

          // Event filtering for the date range is done through the API call in this case

          sessionStorage.setItem('events', JSON.stringify(events));

          events.forEach((event) => {
            const resultItem = createResultItem(event);
            resultsContainer.appendChild(resultItem);
          });
        } else {
          console.error('No events found');
        }
      })
      .catch((error) => console.error(error));
  };

  
  const createResultItem = (event) => {
    
    const name = event.name;
    const dateStr = event.dates.start.localDate;
    const dateArr = dateStr.split('-');
    const date = `${dateArr[2]}.${getMonthName(parseInt(dateArr[1]))} ${dateArr[0]}`;
    const timeStart = event.dates.start.localTime?.slice(0, 5);
    const timeDisplay = timeStart ? ` kl. ${timeStart}` : '';
    const venue = event._embedded?.venues?.[0]?.name || '';
    const city = event._embedded.venues[0].city.name;
    const imageUrl = event.images.find((image) => image.width > 500)?.url;
    const ticketUrl = event.url;
    const availableTickets = event.dates.status.code === 'onsale' ? 'Available tickets!' : 'Tickets unavailable';
    const ticketStatusClass = event.dates.status.code === 'onsale' ? 'green-text' : 'red-text';
    const category = event.classifications?.[0]?.segment.name || '';
    const isEventFavorited = favorites.some(favEvent => favEvent.id === event.id);
    
    
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.innerHTML = `
    <a class="result-details__id" href="event.html?id=${event.id}">
    <div class="result-image">
    <img class="result-image-image" src="${imageUrl}" alt="${name}">
    
    </div>
    
    <h2 class="result-details__name">${name}</h2>
    <div class="result-details">
    <p class="result-details__category"><b class="event-details--bold"> ${category}</p>
    <p class="result-details__date"><b class="event-details--bold"></b> ${date} ${timeDisplay}</p>
    <p class="result-details__city"> ${city}</p>
    <p class="result-details__venue"> ${venue}</p>
    <p class="result-details__tickets"><b class="event-details--bold ${ticketStatusClass}">${availableTickets}</b></p>
    <a class="result-details__button" href="${ticketUrl}" target="_blank">Buy Tickets</a>
    
    <button class="result-details__favorite">
    <i class="bi ${isEventFavorited ? 'bi-heart-fill' : 'bi-heart'} heartIcon ${isEventFavorited ? 'clicked' : ''}"></i>
    </button>
    
    
    
    
    </div>
    </a>
    `;
    
    
    
    // Handle hover behavior for the heart icon
    const heartIcon = resultItem.querySelector('.heartIcon');
    heartIcon.addEventListener('mouseover', () => {
      if (!heartIcon.classList.contains('bi-heart-fill')) {
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
      }
    });
    heartIcon.addEventListener('mouseout', () => {
      if (!heartIcon.classList.contains('clicked')) {
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
      }
    });
    
    // Handle click behavior to toggle the heart icon
    heartIcon.addEventListener('click', () => {
      if (heartIcon.classList.contains('bi-heart') || !heartIcon.classList.contains('clicked')) {
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
        heartIcon.classList.add('clicked');
        
        // Add the event to favorites
        favorites.push(event);
        updateFavoritesInLocalStorage();
      } else {
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
        heartIcon.classList.remove('clicked');
        
        // Remove the event from favorites
        favorites = favorites.filter(favEvent => favEvent.id !== event.id);
        updateFavoritesInLocalStorage();
      }
    });
    
    return resultItem;
  };
  
  
  
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };
  
  
  
  
  const savedEvents = sessionStorage.getItem('events');
  let events = [];
  
  if (savedEvents) {
    events = JSON.parse(savedEvents);
    
    
    events.forEach((event) => {
      const resultItem = createResultItem(event);
      resultsContainer.appendChild(resultItem);
    });
  }
  
  const clearDateButton = document.querySelector('#clear-date-button');

  
    const handleClearDateClick = (event) => {
    startDateInput.value = '';
    endDateInput.value = '';
    handleSearchSubmit(event);
  };
  
  clearDateButton.addEventListener('click', handleClearDateClick);
}