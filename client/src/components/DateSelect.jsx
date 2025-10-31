import { ChevronLeft, ChevronLeftIcon } from 'lucide-react'
import React, { useState } from 'react'

const DateSelect = ({dateTime, id}) => {
  const navigate = useNavigate();
  
  const [selected, setSelected]= useState(null);

  const onBookHandler = ()=> {
    if(!selected) {
      return toast('Please select a date')
    }
    navigate(`/movie/${id}/${selected}`)
    scrollTo(0,0);
  }
  
  return (
    <div>
      <div>
        <BlueCircle />
        <BlueCircle />
        <div>
          <p>Choose Date</p>
          <div>
            <ChevronLeftIcon />
            <span>
              {Object.keys(dateTime).map((date)=>(
                <button onClick={()=>setSelected()} key={date}>
                  {date}
                  <span>{new Date(date).getDate()}</span>
                  <span>{new Date(date).toLocaleDateString("en-US",{month: "short"})}</span>
                </button>
              ))}
            </span>
            <ChevronLeftIcon />
          </div>
        </div>
        <button onClick={onBookHandler}>Book Now</button>
      </div>
    </div>
  )
}

export default DateSelect