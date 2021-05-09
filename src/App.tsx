import './App.css';
import {useState, useEffect} from 'react';
import moment from 'moment';

const ZIP_CODE_LENGTH = 5;

function Widget({zipCode}: any) {
  const [isLoading, setLoader] = useState(false)
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>([]);
  const [activeForecast, setActiveForecast] = useState('');
  const [weatherIconURL, setWeatherIconURL] = useState('');
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    async function getWeatherData(zipCode: String) {
      try {
        setLoader(true);
        setWeatherData([]);
        const data: any =  await fetch(`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},us&exclude=hourly,minutely,alerts,current&units=imperial&appid=b08abc60f5222977c05dc54b137b2d17`);
        const forecastDict: any = {};
        const forecast = await data.json()
        forecast.list.map((f: any) => {
          forecastDict[moment.unix(f.dt).format('ddd')] = {...f};
        });
        setCity(forecast.city.name);
        setWeatherData(forecastDict);
        const defaultForecast = Object.keys(forecastDict)[0];
        setActiveForecast(defaultForecast);
        setWeatherIconURL(`http://openweathermap.org/img/wn/${forecastDict[defaultForecast].weather[0].icon}@2x.png`);
        setError(null);
        setLoader(false);
      } catch (error) {
        setWeatherData([])
        setLoader(false);
        setError('The zipcode provided is not being recognized. ');
      }
    }
    if(zipCode.length !== ZIP_CODE_LENGTH) {
      setWeatherData([]);
    } else {
      getWeatherData(zipCode)
    }
  }, [zipCode])

  useEffect(() => {
    if(weatherData && weatherData[activeForecast]) {
      const icon: any = weatherData[activeForecast].weather[0].icon
      setWeatherIconURL(`http://openweathermap.org/img/wn/${icon}@2x.png`)
    }
  }, [activeForecast])

  return (
    <div className='widgetContainer'>
        {
          error ? <span>{error}</span> : null
        }
        {
          isLoading ? 'Getting your data....' : null
        }
        { Object.values(weatherData).length > 0 ?
          <div className='weatherContainer'>
          <div className='location'>
            <span className="cityLabel">{city}</span>
            <span className="iconContainer">
              <img src={weatherIconURL} style={{width: 50, height: 50}}/>
            </span>
          </div>
          <div className='datesContainer'>
            {
              Object.values(weatherData).map(({dt, main} : any) => {
                return (
                  <div onClick={() => setActiveForecast(moment.unix(dt).format('ddd'))} key={dt} className={`forecast-item ${moment.unix(dt).format('ddd') === activeForecast ? 'active' : null}`}>
                    <span className='dayOfWeek'>{moment.unix(dt).format('ddd').toUpperCase()}</span>
                    <span className='tempForDay'>{parseInt(main.temp)}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
        : 
        isLoading ? null : <span>Enter a valid zipcode to obtain meteorological data.</span>
        }
    </div>
  );
}

function App() {
  const [zipCode, setZipcode] = useState('');
  function handleZipChange(ev: React.ChangeEvent<HTMLInputElement>) {
    ev.preventDefault();
    setZipcode(ev.target.value);
  }

  return (
    <div className='container'>
      <div className="wrapper">
        <div className='inputContainer'>
          <span id="zipLabel">ZIP</span>
          <input id="zipInput" type='text' maxLength={ZIP_CODE_LENGTH} value={zipCode} onChange={(ev) => handleZipChange(ev)}/>
        </div>
        <Widget zipCode={zipCode}/>
      </div>
    </div>
  );
}

export default App;
