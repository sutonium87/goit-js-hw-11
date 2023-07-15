import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');

let currentPage = 1;
let currentSearchQuery = '';

// Handle form submission
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (searchQuery === '') return;

  clearGallery();
  currentSearchQuery = searchQuery;
  currentPage = 1;
  searchImages(currentSearchQuery, currentPage);
});

// Handle "Load more" button click
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  searchImages(currentSearchQuery, currentPage);
});

// Search images using Pixabay API
async function searchImages(query, page) {
  const key = '38254516-2765675488b69046bf2822686';
  const perPage = 40;

  const url = `https://pixabay.com/api/?key=${key}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0) {
      showNotification(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.style.display = 'none';
      return;
    }

    const totalHits = data.totalHits;
    showNotification(`Hooray! We found ${totalHits} images.`);

    data.hits.forEach(image => {
      const card = createImageCard(image);
      gallery.appendChild(card);
    });

    lightbox.refresh();

    if (gallery.childElementCount < totalHits) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      showNotification(
        "We're sorry, but you've reached the end of search results."
      );
    }

    smoothScrollToGallery();
  } catch (error) {
    console.log(error);
    showNotification(
      'An error occurred while fetching images. Please try again later.'
    );
  }
}

// Create an image card
function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const imageLink = document.createElement('a');
  imageLink.href = image.largeImageURL;
  imageLink.setAttribute('data-lightbox', 'gallery');

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'info';

  const likesP = createInfoItem('Likes', image.likes);
  const viewsP = createInfoItem('Views', image.views);
  const commentsP = createInfoItem('Comments', image.comments);
  const downloadsP = createInfoItem('Downloads', image.downloads);

  infoDiv.appendChild(likesP);
  infoDiv.appendChild(viewsP);
  infoDiv.appendChild(commentsP);
  infoDiv.appendChild(downloadsP);

  imageLink.appendChild(img);
  card.appendChild(imageLink);
  card.appendChild(infoDiv);

  return card;
}

// Create an info item
function createInfoItem(label, value) {
  const p = document.createElement('p');
  p.className = 'info-item';
  p.innerHTML = `<b>${label}:</b> ${value}`;

  return p;
}

// Clear the gallery
function clearGallery() {
  gallery.innerHTML = '';
}

// Show a notification using Notiflix
function showNotification(message) {
  Notiflix.Notify.info(message, {
    timeout: 3000,
    position: 'right-top',
  });
}

// Smooth scroll to the gallery
function smoothScrollToGallery() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
