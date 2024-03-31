"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import AddNewQueueModel from "./AddQueueModel";
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
import UpdateQueueNameModel from "./EditQueueModel";
import { getUserData } from "@/utils";
export interface Lot {
  _id: string;
  name: string;
  isDisabled: boolean;
}

export interface queueInterface {
  _id: string;
  user: string;
  lot: string;
  owner?: string;
  owner_details?: {
    name: string;
    email: string;
    phone: string;
  };
  name: string;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Queue = () => {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = getUserData();

  const [queues, setQueues] = useState([]);
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

  return (
    <div>
      <Card className="p-2">
        <h1>Queue</h1>
        <div className="flex justify-between m-3">
          <div className="min-w-72">
            <Select onValueChange={(e) => setSelectedLot(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select Lot" />
              </SelectTrigger>
              <SelectContent>
                {lots &&
                  lots.length > 0 &&
                  lots?.map((lot: Lot) => (
                    <SelectItem key={lot._id} value={lot._id}>
                      {lot.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AddNewQueueModel lotId={selectedLot} fetchQueue={fetchQueues} />
        </div>
      </Card>
      <Card className="my-5 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Queue Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Disabled</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queues.map((queue: queueInterface) => (
              <TableRow key={queue._id}>
                <TableCell>{queue.name}</TableCell>
                <TableCell>
                  {queue?.owner_details?.name || "No Owner Available"}
                </TableCell>
                <TableCell>{queue.isDisabled ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <UpdateQueueNameModel
                    lotId={selectedLot}
                    queueId={queue._id}
                    queueName={queue.name}
                    fetchQueue={fetchQueues}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Queue;
