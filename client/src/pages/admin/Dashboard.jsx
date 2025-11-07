import React, { use } from 'react'
import { dummyDashboardData } from '../../assets/assets';
import { Currency } from 'lucide-react';

const Dashboard = () => {
  
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalShows: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      title: 'Total Bookings', value: dashboardData.totalBookings, icon: ChartLineIcon
    },
    {
      title: 'Total Revenue', value: `$${dashboardData.totalRevenue}`, icon: DollarSignIcon
    },
    {
      title: 'Total Shows', value: dashboardData.totalShows, icon: FilmIcon
    },
    {
      title: 'Total Users', value: dashboardData.totalUsers, icon: UserIcon
    }
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData)
    setLoading(false);
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div>
        <BlurCircle />
        <div>
          {dashboardData.activeShows.map((show) => (
            <div key={show.id} show={show} >
              <img src={show.poster} alt={show.title} />
              <p>{show.movie.title}</p>
              <div>
                <p>{Currency} {show.movie.price}</p>
                <p>
                  <StarIcon />
                  {show.movie.rating}
                </p>
              </div>
              <p>{dateFormat(show.showDateTime)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  ) : <Loading />
}

export default Dashboard