
import React from "react";
import TopNav from "./top-nav";



const layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <div>
      <div>
        <TopNav />
      </div>
      {children}
    </div>
  );
};

export default layout;
