"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lot, queueInterface } from "../queues/page";
import { getUserData } from "@/utils";

const AddNewQueueOwner = () => {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [selectedQueue, setSelectedQueue] = useState("");
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState([]);
  const userId = getUserData();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    lot: "",
    queue: "",
    user: "",
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

  const fetchLots = async () => {
    try {
      const response = await axios.get(`/api/admin/lots?user=${userId}`);
      setLots(response.data.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLots();
  }, []);

  const fetchQueues = async () => {
    try {
      const res = await axios.get(
        `/api/admin/queues?lotId=${selectedLot}&userId=${userId}`
      );
      setQueues(res.data.data);
    } catch (error: any) {
      console.error("Error fetching queues:", error);
      toast.error(error.response.data.error);
    }
  };

  useEffect(() => {
    if (selectedLot) fetchQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLot]);

  const handleSubmit = async () => {
    try {
      formData.lot = selectedLot;
      formData.queue = selectedQueue;
      formData.user = userId;
      console.log("🚀 ~ handleSubmit ~ formData:", formData);
      const res = await axios.post("/api/admin/queue-owner", formData);
      if (res) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
  };
  return (
    <div>
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Queue Owner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Queue Owner</DialogTitle>
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
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Label htmlFor="lot">Select Lot</Label>
            <Select onValueChange={(e) => setSelectedLot(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select Lot" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot: Lot) => (
                  <SelectItem
                    key={lot._id}
                    value={lot._id}
                    disabled={lot.isDisabled}
                  >
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="lot">Select Queue</Label>
            <Select onValueChange={(e) => setSelectedQueue(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select Queue" />
              </SelectTrigger>
              <SelectContent>
                {queues.map((queue: queueInterface) => (
                  <SelectItem
                    key={queue._id}
                    value={queue._id}
                    disabled={queue.isDisabled}
                  >
                    {queue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Button onClick={handleSubmit}>Add Queue Owner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddNewQueueOwner;
