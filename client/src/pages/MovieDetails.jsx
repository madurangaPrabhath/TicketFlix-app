import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import MovieCard from '../components/MovieCard';

const MovieDetails = () => {

  const navigate = useNavigate();
  const {id} = useParams();
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id);
    setShow({
      movie: show,
      dateTime: dummyDateTimeData
    });
  }

  useEffect(() => {
    getShow();
  }, [id]);
  
  return show ? (
    <div>
      <div>
        <img src={show.movie.poster_path} alt="" />
        <div>
          <BlurCircle />
          <p>English</p>
          <h1>{show.movie.title}</h1>
          <div>
            <StarIcon />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p>{show.movie.overview}</p>

          <p>{show.movie.runtime} . {show.movie.genres.map(genre => genre.name).join(", ")} . {show.movie.release_date.split("-")[0]} </p>

          <div>
            <button>
              <PlayCircleIcon />
              Watch Trailer
            </button>
            <a href="#dataSelect">Book Tickets</a>
            <button>
              <HeartIcon />
            </button>
          </div>
        </div>
      </div>

      <p>Your Favourite Cast</p>
      <div>
        <div>
          {show.movie.casts.slice(0,12).map((cast,index)=>(
            <div key={index}>
              <img src={cast.profile_path} alt={cast.name} />
              <p>{cast.name}</p>
            </div>
          ))}
        </div>

        <p>You May Also Like</p>
        <div>
          {dummyShowsData.slice(0,6).map((movie,index)=>(
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
        <div>
          <button onClick={()=>navigate('/movies')}>
            show more
          </button>
        </div>
      </div>
    </div>
  ) : <div>Loading...</div>
}

export default MovieDetails