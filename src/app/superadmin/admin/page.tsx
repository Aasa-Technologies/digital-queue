import { Button } from "@/components/ui/button";
import React from "react";
import AddNewAdmin from "./AddNewAdminModal";

const Admins = () => {
  return (
    <div className="p-5">
      <div className="flex justify-between">
        <h1 className="font-extrabold text-2xl">Admins</h1>
        <AddNewAdmin />
      </div>
    </div>
  );
};

export default Admins;
