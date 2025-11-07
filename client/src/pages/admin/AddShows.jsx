import React from 'react'
import { dummyShowsData } from '../../assets/assets';
import Title from '../../components/admin/Title';

const StarIcon = () => <span style={{ color: '#f5c518' }}>★</span>;
const CheckIcon = () => <span>✓</span>;
const Loading = () => <div>Loading...</div>;

const AddShows = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = React.useState([]);
  const [selectedMovie, setSelectedMovie] = React.useState(null);
  const [dateTimeSelected, setDateTimeSelected] = React.useState("");
  const [dateTimeInput, setDateTimeInput] = React.useState("");
  const [showPrice, setShowPrice] = React.useState("");

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData)
  };

  const handleDateTimeAdd = () => {
    if (dateTimeInput) {
      setDateTimeSelected(dateTimeInput);
      setDateTimeInput("");
    } else {
      alert("Please select a date and time.");
    }
  };

  React.useEffect(() => {
    fetchNowPlayingMovies();
  }, []);
  
  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p>Now Playing Movies</p>
      <div>
        <div>
          {nowPlayingMovies.map((movie) => (
            <div key={movie.id}>
              <img src={movie.poster} alt={movie.title} width={100} />
              <div>
                <p>
                  <StarIcon /> {movie.vote_average.toFixed(1)}
                </p>
                <p>{movie.vote_count} Votes</p>
              </div>
              {((selectedMovie?.id ?? selectedMovie) === movie.id) && (
                <div>
                  <CheckIcon />
                </div>
              )}
              <p>{movie.title}</p>
              <p>{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label>Show Price</label>
        <div>
          <p>$</p>
          <input onChange={(e) => setShowPrice(e.target.value)} value={showPrice} placeholder="Enter show price" />
        </div>
      </div>

      <div>
        <label>Select Date & Time</label>
        <div>
          <input type="datetime-local" value={dateTimeInput} onChange={(e) => setDateTimeInput(e.target.value)}  />
          <button onClick={handleDateTimeAdd}>Add Time</button>
        </div>
      </div>

      {/* Selected Date & Time Display */}
      <div>
        <h4>Selected Date & Time</h4>
        {dateTimeSelected ? (
          <p>{dateTimeSelected}</p>
        ) : (
          <p>No date and time selected</p>
        )}
      </div>

      <button>Add Show</button>
    </>
  ) : <Loading />
}

export default AddShows