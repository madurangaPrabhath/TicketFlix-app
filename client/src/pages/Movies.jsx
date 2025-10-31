import React from 'react'
import {dummyShowsData} from '../assets/assets'

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div>
      <h1>Now Showing</h1>
      <div>
        <BlurCircle />
        <BlurCircle />
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div>
      <h1>No Movies Available</h1>
    </div>
  )
}

export default Movies