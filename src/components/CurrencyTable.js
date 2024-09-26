import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CurrencyTable.css';

const CurrencyTable = () => {
  const [currencies, setCurrencies] = useState([]);
  const [baseAmount, setBaseAmount] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [highestRate, setHighestRate] = useState({});
  const [visibleCurrencies, setVisibleCurrencies] = useState(10);
  const [date, setDate] = useState('');

  const API_KEY = process.env.REACT_APP_CURRENCY_API_KEY;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://api.currencyfreaks.com/latest', {
        params: {
          apikey: API_KEY,
        },
      });

      const rates = response.data.rates;
      const currencyData = Object.keys(rates).map((key) => ({
        currency: key,
        rate: parseFloat(rates[key]),
      }));

      const highest = currencyData.reduce((max, currency) => {
        return currency.rate > max.rate ? currency : max;
      }, { rate: 0 });

      setCurrencies(currencyData);
      setHighestRate(highest);
      setDate(response.data.date); 
    } catch (error) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { 
      setBaseAmount(value);
    }
  };

  const loadMore = () => {
    setVisibleCurrencies((prev) => prev + 10);
  };
  const toggleShowMore = () => setShowMore((prev) => !prev);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h3>Currency Converter</h3>
        <p>As of: {date}</p>
        <marquee behavior="scroll" direction="left" className="mb-4">
          Highest Sell Rate: {highestRate.currency} - {(highestRate.rate * baseAmount * 1.02).toFixed(4)}
        </marquee>
        
        <input
          type="text"
          value={baseAmount}
          onChange={handleAmountChange}
          className="form-control d-inline w-auto"
          placeholder="Enter amount"
        />
        <select
          value="USD"
          disabled
          className="form-select d-inline w-auto ms-2"
        >
          <option value="USD">USD</option>
        </select>
      </div>

      {loading && <div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table table-striped table-responsive currency-table">
        <thead>
          <tr>
            <th>Mata Uang</th>
            <th>We Buy</th>
            <th>Exchange Rate</th>
            <th>We Sell</th>
          </tr>
        </thead>
        <tbody>
        {currencies.slice(0, visibleCurrencies).map(({ currency, rate }, index) => (
            <tr key={currency} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
              <td>{currency}</td>
              <td>{(rate * baseAmount * 0.98).toFixed(4)}</td>
              <td>{(rate * baseAmount).toFixed(4)}</td>
              <td>{(rate * baseAmount * 1.02).toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>

       <button onClick={loadMore} className="btn btn-primary mb-4">
        Load More
      </button>

      {visibleCurrencies >= currencies.length && <p className="text-muted">All data has been displayed.</p>}
    </div>
  );
};

export default CurrencyTable;
