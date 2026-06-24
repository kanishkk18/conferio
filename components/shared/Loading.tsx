import CircularText from "../ui/CircularTextLoader";
import React from 'react';
// import TimelineDemo from '@/components/ui/timeCard';
// import { Cover } from "@/components/ui/cover";



const Loading = () => {
  return (
    <div className="flex items-center justify-center">
      <div role="status">
        <Spinner />
        <span className="sr-only">Loading&hellip;</span>
      </div>
    </div>
  );
};

const Spinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <CircularText
        text="CONFERIO*CALLS*"
        onHover="speedUp"
        spinDuration={5}
        className="custom-class"
      />
    </div>
    //     <div className="relative w-[100%] [perspective:5px] inline-block vertical-align-middle">

    //     <div className="scene absolute [transform-style:preserve-3d] animate-[move_99s_linear_infinite]" >

    // <div className="wrap">
    // <div className="wall wall-right"></div>
    // <div className="wall wall-left"></div>   
    // <div className="wall wall-top"></div>
    // <div className="wall wall-bottom"></div> 
    // <div className="wall wall-back"></div>    
    // </div>
    // <div className="wrap">
    // <div className="wall wall-right"></div>
    // <div className="wall wall-left"></div>   
    // <div className="wall wall-top"></div>
    // <div className="wall wall-bottom"></div>   
    // <div className="wall wall-back"></div>    
    // </div>
    // </div>
    // <div className='w-full flex flex-col justify-center  items-center text-center'>
    // <span className="text-4xl md:text-4xl  lg:text-5xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-50 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
    // We Are Getting back to you<br /> at 
    // {/* <Cover className='mt-2'>the speed of Light</Cover> */}
    // </span>
    // </div>
    // </div>
  );
};

// const Spinner: React.FC = () => {
//   return (
//       <div className="">
//       <div className="relative w-[100%] h-screen [perspective:5px] inline-block vertical-align-middle">

//           <div className="scene absolute [transform-style:preserve-3d] animate-[move_99s_linear_infinite]" >

// <div className="wrap">
//     <div className="wall wall-right"></div>
//     <div className="wall wall-left"></div>   
//     <div className="wall wall-top"></div>
//     <div className="wall wall-bottom"></div> 
//     <div className="wall wall-back"></div>    
// </div>
// <div className="wrap">
//     <div className="wall wall-right"></div>
//     <div className="wall wall-left"></div>   
//     <div className="wall wall-top"></div>
//     <div className="wall wall-bottom"></div>   
//     <div className="wall wall-back"></div>    
// </div>
// </div>
// <div className='w-full flex flex-col justify-center h-full items-center text-center'>
//   {/* <Badge className=" z-50   p-2    text-md bg-neutral-800 dark:bg-white text-white dark:text-black">AAS Technologies</Badge> */}
//     <span className="text-4xl md:text-4xl  lg:text-5xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-50 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
//     We Are Getting back to you<br /> at 
//     {/* <Cover className='mt-2'>the speed of Light</Cover> */}
//     </span>
//   </div>
// <div className="bg-black z-50 mt-[40%] opacity-95 w-full h-full">

//          {/* <TimelineDemo/> */}
//          </div>

//          {/* <div>
//           <div className="relative w-screen h-screen [perspective:5px] inline-block vertical-align-middle">
// <div className="absolute w-[1000px] h-[1000px]  
//             [transform-style:preserve-3d] animate-[move_12s_linear_infinite]">
//   <div className="wall wall-right absolute w-full h-full 
//               bg-[url(https://i.pinimg.com/736x/76/3f/93/763f9356ddd06e2e7bae7e97fb2d6cdd.jpg)] 
//               bg-cover opacity-0 animate-[fade_12s_linear_infinite]
//               [transform:rotateY(90deg)_translateZ(500px)]" />
//   <div className="wall wall-left absolute w-full h-full 
//               bg-[url(https://i.pinimg.com/736x/76/3f/93/763f9356ddd06e2e7bae7e97fb2d6cdd.jpg)] 
//               bg-cover opacity-0 animate-[fade_12s_linear_infinite]
//               [transform:rotateY(-90deg)_translateZ(500px)]" />
//   <div className="wall wall-top absolute w-full h-full 
//               bg-[url(https://i.pinimg.com/736x/76/3f/93/763f9356ddd06e2e7bae7e97fb2d6cdd.jpg)] 
//               bg-cover opacity-0 animate-[fade_12s_linear_infinite]
//               [transform:rotateX(90deg)_translateZ(500px)]" />
//   <div className="wall wall-bottom absolute w-full h-full 
//               bg-[url(https://i.pinimg.com/736x/76/3f/93/763f9356ddd06e2e7bae7e97fb2d6cdd.jpg)] 
//               bg-cover opacity-0 animate-[fade_12s_linear_infinite]
//               [transform:rotateX(-90deg)_translateZ(500px)]" />
//   <div className="wall wall-back absolute w-full h-full 
//               bg-[url(https://i.pinimg.com/736x/76/3f/93/763f9356ddd06e2e7bae7e97fb2d6cdd.jpg)] 
//               bg-cover opacity-0 animate-[fade_12s_linear_infinite]
//               [transform:rotateX(180deg)_translateZ(500px)]" />
// </div>

// <div className="absolute w-[1000px] h-[1000px] left-[-500px] top-[-500px] 
//             [transform-style:preserve-3d] animate-[move_12s_linear_infinite] 
//             [animation-delay:6s]">

// </div>
// </div>
// <div className="bg-black z-500 opacity-95 w-full h-full">
//          <TimelineDemo/>
//          </div>
//       </div> */}
//       </div>

//       </div>
//   );
// };

export default Loading;
