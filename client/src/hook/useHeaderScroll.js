import { useState, useLayoutEffect} from 'react';

const useHeaderScroll = () => {
    const [showHeader, setShowHeader] = useState(true);

    useLayoutEffect(() => {
        let scrollInicialY = window.scrollY;
        const threshold = 50;

        const handleScroll = () => {
            const scrollAtualY = window.scrollY

            if (scrollAtualY <= threshold) {
                setShowHeader(true);
            } else if (scrollAtualY > scrollInicialY) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }

            scrollInicialY = scrollAtualY;
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll)
        };

    }, []);

    return showHeader;

};

export default useHeaderScroll;