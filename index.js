const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster
    return `
    <img src="${imgSrc}" />
    ${movie.Title} (${movie.Year})
   `
  },
//test
  inputValue(movie) {
    return movie.Title
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: 'df76929f',
        s: searchTerm,
      },
    })
    if (response.data.Error) {
      return []
    }
    return response.data.Search
  },
}

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left')
  },
})
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right')
  },
})
let leftMovie
let rightMovie

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: 'df76929f',
      i: movie.imdbID,
    },
  })
  console.log(response)
  summaryElement.innerHTML = movieTemplate(response.data)
  if (side === 'left') {
    leftMovie = response.data
  } else {
    rightMovie = response.data
  }
  if (leftMovie && rightMovie) {
    runComparison()
  }
}

const runComparison = () => {
  const leftSideStats = document.querySelectorAll('#left-summary .notification')
  const rightSideStats = document.querySelectorAll(
    '#right-summary .notification'
  )

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index]
    const leftSideValue = parseFloat(leftStat.dataset.value)
    const rightSideValue = parseFloat(rightStat.dataset.value)
    console.log(`left:${leftSideValue}, right:${rightSideValue}`)
    if (isNaN(rightSideValue) || isNaN(leftSideValue)) {
      leftStat.classList.remove('is-primary')
      leftStat.classList.add('is-light')
      rightStat.classList.remove('is-primary')
      rightStat.classList.add('is-light')
    } else if (rightSideValue > leftSideValue) {
      rightStat.classList.remove('is-danger')
      rightStat.classList.add('is-primary')
      leftStat.classList.remove('is-primary')
      leftStat.classList.add('is-danger')
    } else if (leftSideValue > rightSideValue) {
      leftStat.classList.remove('is-danger')
      leftStat.classList.add('is-primary')
      rightStat.classList.remove('is-primary')
      rightStat.classList.add('is-danger')
    } else if (leftSideValue === rightSideValue) {
      leftStat.classList.remove('is-primary', 'is-danger')
      leftStat.classList.add('is-light')
      rightStat.classList.remove('is-primary', 'is-danger')
      rightStat.classList.add('is-light')
    }
  })
}

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, '')
  )
  const metascore = parseInt(movieDetail.Metascore) || 0
  const imdbRating = parseFloat(movieDetail.imdbRating) || 0
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, '')) || 0
  const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word)
    if (isNaN(value)) {
      return prev
    } else {
      return prev + value
    }
  }, 0)
  return `
  <article class="media">
    <figure class="media-left">
      <p class="image">
      <img src="${movieDetail.Poster}" />
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h1>${movieDetail.Title}</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </div>
  </article>
  <article data-value=${awards} class="awards notification is-light">
    <p class="title">${movieDetail.Awards}</p>
    <p class="subtitle">Awards</p>
  </article>
  <article data-value=${dollars} class="notification is-light">
    <p class="title">${movieDetail.BoxOffice}</p>
    <p class="subtitle">US Box Office</p>
  </article>
  <article data-value=${metascore} class="notification is-light">
    <p class="title">${movieDetail.Metascore}</p>
    <p class="subtitle">Metascore</p>
  </article>
  <article data-value=${imdbRating} class="notification is-light">
    <p class="title">${movieDetail.imdbRating}</p>
    <p class="subtitle">IMDB Rating</p>
  </article>
  <article data-value=${imdbVotes} class="notification is-light">
    <p class="title">${movieDetail.imdbVotes}</p>
    <p class="subtitle">IMDB Votes</p>
  </article>
    `
}
