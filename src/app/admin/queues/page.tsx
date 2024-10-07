"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import AddNewQueueModel from "./AddQueueModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import UpdateQueueNameModel from "./EditQueueModel";
import { getUserData } from "@/utils";
import { collection, query, where, getDocs, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import moment from "moment";
import { Loader2 } from "lucide-react";


import { doc, updateDoc } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";

export default function Queue() {
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = getUserData();
      setUser(userInfo);
    };

    fetchUserData();
  }, []);

  const fetchLots = async () => {
    console.log(">>> ~ fetchLots ~ user:", user);
    if (!user.id) return;
    setLoading(true);
    try {
      const lotsCollection = collection(db, "lots");
      const lotsQuery = query(lotsCollection, where("adminId", "==", user.id));
      const lotsSnapshot = await getDocs(lotsQuery);
      const lotsData = lotsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() })
      );
      setLots(lotsData);
      if (lotsData.length > 0) {
        setSelectedLot(lotsData[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching lots:", error);
      toast.error("Failed to fetch lots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) fetchLots();
  }, [user.id]);

  const fetchQueues = async () => {
    if (!selectedLot) return;
    setLoading(true);
    try {
      const queuesCollection = collection(db, "queues");
      const queuesQuery = query(
        queuesCollection,
        where("lotId", "==", selectedLot),
        where("adminId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      
      const queuesSnapshot = await getDocs(queuesQuery);
      const queuesData = queuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Fetch owners
      const ownersPromises = queuesData.map(async (queue:any) => {
        if (queue.ownerId) {
          const ownerDoc = await getDoc(doc(db, "queue_owners", queue.ownerId));
          return {
            ...queue,
            owner_details: ownerDoc.exists() ? ownerDoc.data() : null,
          };
        }
        return queue;
      });
  
      const queuesWithOwners = await Promise.all(ownersPromises);
      console.log(">>> ~ fetchQueues ~ queuesWithOwners:", queuesWithOwners)
      setQueues(queuesWithOwners);
    } catch (error) {
      console.error("Error fetching queues:", error);
      toast.error("Failed to fetch queues");
    } finally {
      setLoading(false);
    }
  };
  

  const handleStatusChange = async (queueId: string, checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      const queueRef = doc(db, "queues", queueId);
      await updateDoc(queueRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Queue status updated to ${newStatus}`);
      // Refresh the queues list
      fetchQueues();
    } catch (error) {
      console.error("Error updating queue status:", error);
      toast.error("Failed to update queue status");
    }
  };

  useEffect(() => {
    if (selectedLot) fetchQueues();
  }, [selectedLot]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold mb-4">Queues</h1>
        <div className="flex justify-between items-center">
          <Select value={selectedLot} onValueChange={setSelectedLot}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Lot" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot:any) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddNewQueueModel lotId={selectedLot} fetchQueue={fetchQueues} />
        </div>
      </Card>
      <Card className="p-4">
        {queues.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No queues available for this lot.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((queue:any) => (
                <TableRow key={queue.id}>
                  <TableCell>{queue.name}</TableCell>
                  <TableCell>
                    {queue?.owner_details?.name || "No Owner Available"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={queue.status === "active"}
                      onCheckedChange={(checked: any) =>
                        handleStatusChange(queue.id, checked)
                      }
                      className="ml-2"
                    />
                  </TableCell>
                  <TableCell>
                    {moment(queue.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {moment(queue.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <UpdateQueueNameModel
                      lotId={selectedLot}
                      queueId={queue.id}
                      queueName={queue.name}
                      fetchQueue={fetchQueues}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
