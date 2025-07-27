import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';
let totalImagesLoaded = 0;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  currentQuery = e.target.elements.searchQuery.value.trim();
  currentPage = 1;
  totalImagesLoaded = 0;
  clearGallery();
  hideLoadMoreButton();

  if (!currentQuery) return;

  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({ message: 'No images found.' });
      hideLoader();
      return;
    }

    createGallery(data.hits);
    totalImagesLoaded += data.hits.length;

    if (totalImagesLoaded < totalHits) showLoadMoreButton();
    else
      iziToast.info({ message: "You've reached the end of search results." });
  } catch (error) {
    iziToast.error({ message: 'Error fetching data.' });
  } finally {
    hideLoader();
  }
});

loadMoreButton.addEventListener('click', async () => {
  currentPage++;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);
    totalImagesLoaded += data.hits.length;

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });

    if (totalImagesLoaded >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({ message: "You've reached the end of search results." });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({ message: 'Failed to load more images.' });
  } finally {
    hideLoader();
  }
});
