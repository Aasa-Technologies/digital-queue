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

const UpdateQueueNameModel = ({
  queueId,
  queueName,
  lotId,
  fetchQueue,
}: {
  queueId: string;
  queueName: string;
  lotId: string;
  fetchQueue: any;
}) => {
  const userId = getUserData();

  const [formData, setFormData] = useState({
    name: queueName,
    lotId: lotId,
    queueId: queueId,
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
      const res = await axios.patch(`/api/admin/queues/`, formData);
      if (res) {
        fetchQueue();
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "An unknown error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogTrigger className={buttonVariants()}>
          Update Queue Name
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Queue Name</DialogTitle>
          </DialogHeader>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit}>Update Name</Button>
            <DialogClose className={buttonVariants()}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateQueueNameModel;
