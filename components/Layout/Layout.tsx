import { FC, PropsWithChildren} from 'react';
// import { ShowSidebarIcon } from '../Icons/Icons';
// import Header from './Header/Header';
// import Logo from './Header/Logo';
// import Sidebar from './Sidebar/Sidebar';
// import { ThemeContext } from 'store/ThemeContext';
// import { Card } from '../components/ui/card';


// const ShowSidebarButton: FC<{ onShowSidebar: MouseEventHandler }> = ({ onShowSidebar }) => {
//     return (
//         <button
//             id="show-sidebar-btn"
//             onClick={onShowSidebar}
//             className={`fixed bottom-8 z-10 hidden h-12 w-14 items-center justify-center rounded-r-full bg-primary transition-colors hover:bg-primary-light sm:flex`}
//         >
//             <ShowSidebarIcon />
//         </button>
//     );
// };

const Layout: FC<PropsWithChildren> = ({ children }) => {
   
    return (
        
        <div
            className=" !overflow-y-hidden !overflow-x-hidden scrollbar-thin2 relative grid w-screen grid-cols-[max-content_1fr] grid-rows-[max-content_1fr]" 
            data-theme="dark"
            data-brand="blue"
            data-accent="blue"
            data-neutral="gray"
            data-border="playful"
            data-solid="color"
            data-solid-style="flat"
            data-surface="filled"
            data-transition="all" >
                 <svg
          viewBox="0 0 1024 1024"
          className="absolute left-0 -top-80 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
            fillOpacity="0.7"
          ></circle>
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#6bc7d8" />
              <stop offset={1} stopColor="#1d4ed8" />
            </radialGradient>
          </defs>
        </svg>
            

            
            <section
                className="relative flex col-start-1 col-end-3  border-none"
            >
                <div id="mobile-menu-root" />
                {children}
            </section>
            
           
            <div id="modal-root" className="absolute" />
            <div id="popover-root" className="absolute" />
            <svg
          viewBox="0 0 1024 1024"
          className="absolute -right-48 -bottom-36 -z-50 h-[38rem] w-[38rem]  [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
            fillOpacity="0.7"
          ></circle>
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#41336d" />
              <stop offset={1} stopColor="#41336d" />
            </radialGradient>
          </defs>
        </svg>
        </div>
    );
};

export default Layout;
