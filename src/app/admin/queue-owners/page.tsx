"use client";
import React, { useEffect, useState } from "react";
import AddNewQueueOwner from "./AddNewQueueOwner";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getUserData } from "@/utils";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Loader2 } from "lucide-react";

export interface QueueOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lotId: string;
  queueId: string;
  queueName: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueOwners = () => {
  const [queueOwners, setQueueOwners] = useState<QueueOwner[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchQueueOwners() {
    const user = getUserData();
    if (!user.id) return;

    setLoading(true);
    try {
      const queueOwnersCollection = collection(db, "queue_owners");
      const queueOwnersQuery = query(queueOwnersCollection, where("adminId", "==", user.id));
      const queueOwnersSnapshot = await getDocs(queueOwnersQuery);
      const queueOwnersData = queueOwnersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QueueOwner));
      setQueueOwners(queueOwnersData);
    } catch (error: any) {
      console.error("Error fetching queue owners:", error);
      toast.error("Failed to fetch queue owners");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueueOwners();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className="p-3 py-7 flex justify-between">
        <h1 className="font-semibold text-xl">Queue Owners</h1>
        <AddNewQueueOwner onOwnerAdded={fetchQueueOwners} />
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
              <TableRow key={owner.id}>
                <TableCell>{owner.name}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.phone}</TableCell>
                <TableCell>{owner.queueName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QueueOwners;
