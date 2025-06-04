import "./navbar.scss"
import { useCallback, useEffect, useState, useContext } from "react"
import { UserContext } from "../../App.jsx";

export default function Navbar(props) {

  let { userData } = useContext(UserContext);
  let [isOpen, setIsOpen] = useState(false);
  let [isLarge, setIsLarge] = useState(window.innerWidth >= 1200)
  const handleResize = useCallback(() => {
    setIsOpen(false);
    setIsLarge(window.innerWidth >= 1200);
  }, [])
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize)
  }, [])
  console.log("Is opne"+isOpen);
  return (
    <>
      <nav className="nav">
          {isLarge ? null : <svg
            xmlns="http://www.w3.org/2000/svg"
            height="4vh"
            viewBox="0 -960 960 960"
            width="4vh"
            fill= "#000000"
            style={{ transform: isOpen ? `rotate(270deg)` : `rotate(0deg)` }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>}
          <a href="/" className={`nav__brand ${isLarge ? `large` : ``}`}><img src="/favicon.ico" alt="" /><p>M'LaBrocante</p></a>
          {isLarge ? props.children : null}
        {userData.logged ? 
        <a href="/account/cart" className="nav__auth">
          <p className="nav__auth__text">{isLarge ? `Mon compte` : ``}</p>
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF"><path d="M226-262q59-42.33 121.33-65.5 62.34-23.17 132.67-23.17 70.33 0 133 23.17T734.67-262q41-49.67 59.83-103.67T813.33-480q0-141-96.16-237.17Q621-813.33 480-813.33t-237.17 96.16Q146.67-621 146.67-480q0 60.33 19.16 114.33Q185-311.67 226-262Zm253.88-184.67q-58.21 0-98.05-39.95Q342-526.58 342-584.79t39.96-98.04q39.95-39.84 98.16-39.84 58.21 0 98.05 39.96Q618-642.75 618-584.54t-39.96 98.04q-39.95 39.83-98.16 39.83ZM480.31-80q-82.64 0-155.64-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.51T80-480.18q0-82.82 31.5-155.49 31.5-72.66 85.83-127Q251.67-817 324.51-848.5T480.18-880q82.82 0 155.49 31.5 72.66 31.5 127 85.83Q817-708.33 848.5-635.65 880-562.96 880-480.31q0 82.64-31.5 155.64-31.5 73-85.83 127.34Q708.33-143 635.65-111.5 562.96-80 480.31-80Zm-.31-66.67q54.33 0 105-15.83t97.67-52.17q-47-33.66-98-51.5Q533.67-284 480-284t-104.67 17.83q-51 17.84-98 51.5 47 36.34 97.67 52.17 50.67 15.83 105 15.83Zm0-366.66q31.33 0 51.33-20t20-51.34q0-31.33-20-51.33T480-656q-31.33 0-51.33 20t-20 51.33q0 31.34 20 51.34 20 20 51.33 20Zm0-71.34Zm0 369.34Z"/></svg>
        </a> 
        : 
        <a href="/login" className="nav__auth">
          <p className="nav__auth__text">{isLarge ? `Se connecter` : ``}</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="26px"
            viewBox="0 -960 960 960"
            width="26px"
            fill="#ffffff"
          >
            <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z" />
          </svg>
        </a>}
      </nav>
      <div className={`nav__burger ${isOpen ? `open` : ``}`}>{props.children}</div>
    </>
  );
}
