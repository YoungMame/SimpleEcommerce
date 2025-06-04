// Hooks
import { useEffect, useState, createContext, useContext } from "react";

// Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Pages
import Catalog from "./pages/Catalog/Catalog";
import Agenda from "./pages/Agenda/Agenda";
import Legal from "./pages/Legal/Legal";
import Login from "./pages/Login/Login";
import Forgotten from "./pages/Forgotten/Forgotten";
import Signin from "./pages/Signin/Signin";
import Account from "./pages/Account/Account";
import Home from "./pages/Home/Home";
import Admin from "./pages/Admin/Admin";
import ValidCart from "./pages/ValidCart/ValidCart";
import CartValidated from "./pages/CartValidated/CartValidated";

//Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Translation
import global_fr from "./translation/fr/global.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

//Functions
import {logWithToken} from "./token.js";

i18n
  .use(initReactI18next) 
  .init({
    resources: {
      fr: {
        translation: global_fr
      }
    },
    lng: navigator.language || "fr", 
    fallbackLng: "fr",

    interpolation: {
      escapeValue: false
    }
  });

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    logged: false,
    admin: false,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function checkJWT() {
      setIsLoading(true);
      const result = await logWithToken();

      if (result) {
        setUserData({
          ...result,
          logged: true,
          admin: localStorage.getItem("mlb_admin") === "true"
        });
      } else {
        setUserData(userData => ({
          logged: false,
          admin: false
        }));
        localStorage.removeItem("mlb_jwt");
      }
      setIsLoading(false);
    }
    checkJWT();
  }, []);
  return (
    <UserContext.Provider value = {{ userData, setUserData, isLoading, setIsLoading, selectedProduct, setSelectedProduct}}>
      {children}
    </UserContext.Provider>
  )
}

function App() {
  return (
    <div className="App">
      <UserProvider>
        <AppContent />
        <ToastContainer />
      </UserProvider>
    </div>
  );
}

function AppContent() {
  let actualPage;
  let { isLoading, selectedProduct, setSelectedProduct } = useContext(UserContext);
  const pathName = window.location.pathname;


  if (pathName.startsWith("/admin")) {
    actualPage = <Admin />;
  } 
  else if (pathName.startsWith("/account/")) {
    actualPage = <Account />;
  } else {
    switch (window.location.pathname) {
      case "/catalog":
        actualPage = <Catalog />;
        break;
      case "/agenda":
        actualPage = <Agenda />;
        break;
      case "/legal":
        actualPage = <Legal />;
        break;
      case "/login":
        actualPage = <Login />;
        break;
      case "/forgotten":
        actualPage = <Forgotten />;
        break;
      case "/signin":
        actualPage = <Signin />;
        break;
      case "/account":
        actualPage = <Account />;
        break;
      case "/cart-validation":
        actualPage = <ValidCart />;
        break;
      case "/cart-validated":
        actualPage = <CartValidated />;
        break;
      default:
        actualPage = <Home />;
        break;
    }
  }
  return (
    <>
      {isLoading ? null : (
        <Navbar>
          <CustomLink href="/catalog" label="Catalogue" />
          <CustomLink href="/agenda" label="Agenda" />
          <CustomLink href="/legal" label="Mentions légales" />
        </Navbar>
      )}
      {actualPage}
      <Footer />
    </>
  );
}

function CustomLink(props) {
  return (<>
    <a className={(window.location.pathname === props.href) ? "active" : ""} href={props.href}>{props.label}</a>
  </>
  )
}

export default App;
