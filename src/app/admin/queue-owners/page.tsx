"use client";
import React, { useEffect, useState } from "react";
import AddNewQueueOwner from "./AddNewQueueOwner";
import axios from "axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getUserData } from "@/utils";
export interface QueueOwner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  lot: string;
  queue: {
    name: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
const QueueOwners = () => {
  const [queueOwners, setQueueOwners] = useState([]);
  async function getQueueOwnersByUserId(userId: string) {
    try {
      const response = await axios.get(
        `/api/admin/queue-owner?userID=${userId}`
      );
      setQueueOwners(response.data.data);
    } catch (error: any) {
      console.error("Error fetching queues:", error);
      toast.error(error.response.data.error);
    }
  }

  useEffect(() => {
    const userId = getUserData();

    getQueueOwnersByUserId(userId);
  }, []);

  return (
    <div>
      <Card className="p-3 py-7 flex  justify-between">
        <h1 className="font-semibold text-xl">QueueOwners</h1>
        <AddNewQueueOwner />
      </Card>
      <Card className="my-5 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Queue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueOwners.map((owner: QueueOwner) => (
              <TableRow key={owner._id}>
                <TableCell>{owner.name}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.phone}</TableCell>
                <TableCell>{owner.queue.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QueueOwners;
