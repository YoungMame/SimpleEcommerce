import React, { useState } from "react";
import "./carousel.scss";

const Carousel = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = React.Children.count(children);

  const nextSlide = () => {
    setCurrentSlide(prevData => (prevData + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prevData => (prevData - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="carousel">
      <button onClick={prevSlide} className="carousel-control prev">
        {"<"}
      </button>
      <div className="carousel-slides">
        {React.Children.map(children, (child, index) => (
          <div
            className="carousel-slide"
            style={{ 
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {child}
          </div>
        ))}
      </div>
      <button onClick={nextSlide} className="carousel-control next">
        {">"}
      </button>
    </div>
  );
};

export default Carousel;
