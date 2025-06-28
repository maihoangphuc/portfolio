import { useEffect, useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="!fixed !bottom-6 !right-6 !p-2 !rounded-full !bg-light-primary dark:!bg-dark-primary hover:!bg-light-primary/90 dark:hover:!bg-dark-primary/90 !text-white dark:!text-black !cursor-pointer z-50"
          aria-label="Scroll to top"
        >
          <IoIosArrowUp size={16} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
