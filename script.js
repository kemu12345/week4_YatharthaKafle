// CORRECT URL - json-server runs on port 3000
const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// Render movies
function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';
    if (moviesToDisplay.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found.</p>';
        return;
    }

    moviesToDisplay.forEach(movie => {
        const div = document.createElement('div');
        div.className = 'movie-item';
        div.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button onclick="editMoviePrompt(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', ${movie.year}, '${movie.genre}')">Edit</button>
            <button onclick="deleteMovie(${movie.id})">Delete</button>
        `;
        movieListDiv.appendChild(div);
    });
}

// FETCH MOVIES - json-server returns array directly
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(movies => {
            allMovies = movies;           // NOT movies.movies
            renderMovies(allMovies);
        })
        .catch(err => console.error('Fetch error:', err));
}

fetchMovies();

// SEARCH
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term)
    );
    renderMovies(filtered);
});

// ADD MOVIE - WORKS NOW
form.addEventListener('submit', e => {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value.trim(),
        genre: document.getElementById('genre').value.trim() || 'Unknown',
        year: parseInt(document.getElementById('year').value)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
    })
    .then(res => {
        if (!res.ok) throw new Error('Add failed');
        form.reset();
        fetchMovies(); // Refresh list
    })
    .catch(err => console.error(err));
});

// EDIT
function editMoviePrompt(id, currentTitle, currentYear, currentGenre) {
    const title = prompt('New Title:', currentTitle);
    const year = prompt('New Year:', currentYear);
    const genre = prompt('New Genre:', currentGenre);

    if (title && year && genre) {
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, year: +year, genre })
        })
        .then(() => fetchMovies())
        .catch(err => console.error(err));
    }
}

// DELETE
function deleteMovie(id) {
    if (confirm('Delete this movie?')) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            .then(() => fetchMovies())
            .catch(err => console.error(err));
    }
}