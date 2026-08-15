import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { updateMetaForPath } from '../utils/seo';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string, scrollToTop?: boolean) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

export const RouterProvider: React.FC<{ children: React.ReactNode; initialPath?: string }> = ({ children, initialPath }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const navigate = useCallback((path: string, scrollToTop = true) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    updateMetaForPath(path);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Initial meta tag update
    updateMetaForPath(window.location.pathname);

    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      updateMetaForPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const CustomLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; scrollToTop?: boolean }> = ({
  href,
  children,
  onClick,
  scrollToTop = true,
  ...props
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // If it's an external link or hash anchor, let browser handle normally
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    if (href.startsWith('#')) {
      return;
    }

    // Intercept internal route
    e.preventDefault();
    navigate(href, scrollToTop);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
