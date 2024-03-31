"use client";
import React, { useEffect, useState } from "react";
import CreateTokenModel from "./CreateTokenModel";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast } from "sonner";
import { getUserData } from "@/utils";

const QueueToken = () => {
  const userId = getUserData();

  const [loading, setLoading] = useState(true);
  const [queueMemberToken, setQueueMemberToken] = useState([]);

  async function getQueueToken() {
    try {
      const response = await axios.get(
        `/api/admin/queue-token?userID=${userId}`
      );
      setQueueMemberToken(response.data.data);
    } catch (error: any) {
      console.error("Error fetching queue token:", error);
      toast.error(error.response.data.error);
    }
  }
  useEffect(() => {
    getQueueToken();
  }, []);

  return (
    <div>
      <Card className="my-5 p-3 py-5 flex justify-between">
        <h1 className="text-xl font-semibold">QueueToken</h1>
        <CreateTokenModel />
      </Card>
      <Card className="my-5 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Queue Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueMemberToken.map((token: any) => (
              <TableRow key={token._id}>
                <TableCell>{token.queue_members.name}</TableCell>
                <TableCell>{token.tokenNo}</TableCell>
                <TableCell>{token.queues.name}</TableCell>
                <TableCell>{token.lots_info.name}</TableCell>
                <TableCell>{token.queue_owners.name}</TableCell>
                <TableCell>{token.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QueueToken;
