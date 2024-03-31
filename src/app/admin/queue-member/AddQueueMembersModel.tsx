"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { getUserData } from "@/utils";

const AddNewQueueMemberModel = ({getQueueMembers}:any) => {
  const userId = getUserData();


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    user: userId,
  });
  const [open, setOpen] = useState(false);

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
      const res = await axios.post("/api/admin/queue-member", formData);
      if (res) {
        toast.success(res.data.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          user: userId,
        });
        getQueueMembers()
        setOpen(false);
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
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogTrigger className={buttonVariants()}>
          Add New Queue Member
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Queue Member</DialogTitle>
          </DialogHeader>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Add Queue Member</Button>
            <DialogClose className={buttonVariants()}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewQueueMemberModel;
