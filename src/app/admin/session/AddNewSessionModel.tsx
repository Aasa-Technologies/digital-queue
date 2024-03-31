"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { getUserData } from "@/utils";

const AddNewSessionModel = () => {
  const userId = getUserData();

  const [formData, setFormData] = useState({
    name: "",
    user: userId,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/admin/session", formData);
      if (res) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New Session</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Session</DialogTitle>
          </DialogHeader>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {/* <Label htmlFor="user">User</Label>
          <Input
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
          /> */}
          <div>
            <Button onClick={handleSubmit}>Add Session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewSessionModel;
