import {useParams} from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import { useEffect } from 'react';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';

const SeatLayout = () => {
  
  const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]];
  
  const { id,date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  const navigate = useNavigate();

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show.id === parseInt(id));
    if (show) {
      setShow({
        movie:show,
        dateTime: dummyDateTimeData
      });
    }
  }

  useEffect(() => {
    getShow();
  }, [id]);

  const handleSeatClick = (seat) => {
    if(!selectedTime){
      return toast("Please select a show time first","warning");
    }
    if(!selectedSeats.includes(seat) && selectedSeats.length >=4){
      return toast("You can only select up to 4 seats","warning");
    }
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      return [...prev, seat];
    });
  }

  const renderSeats = (rows,count =9) => (
    <div key={row}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} onClick={() => handleSeatClick(`${row}${index + 1}`)}>
          <p>{`${row}${index + 1}`}</p>
        </div>
      ))}
    </div>
  );

  return show ? (
    <div>
      {/*Available Timings*/}
      <div>
        <p>Available Timing</p>
        {show.dateTime.map((item) => (
          <div key={item.time} onClick={() => setSelectedTime(item)}>
            <ClockIcon />
            <p>{item.time}</p>
          </div>
        ))}
      </div>

      <div>
        {/*Seat Layout Component*/}
        <BlurCircle />
        <BlurCircle />
        <h1>Select your seats</h1>
        <img src={assets.screenImage} alt="screen" />
        <p>SCREEN SIDE</p>

        <div>
          <div>
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
        </div>

        <div>
          {groupRows.slice(1).map((group, idx) => (
            <div key={idx}>
              <div>
                {group.map((row) => renderSeats(row))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button>
        Process to Checkout
        <ArrowRightIcon />
      </button>

    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout