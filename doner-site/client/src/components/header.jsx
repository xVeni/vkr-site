import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Search from './search';

function Header() {
  const userData = useSelector((state) => state.auth.data);
  const cabinetPath = userData?.role === 'admin' ? '/admin' : '/cabinet';

  return (
    <div className="header">
      <div className="logo">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="Логотип" className="logo-circle" />
        </Link>

        <div className="logo-text">
          <h1>DONER KEBAB</h1>
          <p>КАФЕ БЫСТРОГО ПИТАНИЯ</p>
          <a href="tel:+79144871717" className="phone">
            +7(914)-487-17-17
          </a>
        </div>
      </div>

      <div className="search-cart">
        <Search />
        <Link to={cabinetPath} className="user-cabinet-link">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: '15px', color: '#fe5f1e' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default Header;
