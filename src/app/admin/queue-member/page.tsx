"use client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lot } from "../queues/page";
import AddNewQueueMemberModel from "./AddQueueMembersModel";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserData } from "@/utils";
export interface QueueMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
const QueueMember = () => {
  const [loading, setLoading] = useState(true);
  const [queueMembers, setQueueMembers] = useState<QueueMember[]>([]);
  const userId = getUserData();

  async function getQueueMembers() {
    try {
      const response = await axios.get(
        `/api/admin/queue-member?userID=${userId}`
      );
      setQueueMembers(response.data.data);
    } catch (error: any) {
      console.error("Error fetching queue members:", error);
      toast.error(error.response.data.error);
    }
  }
  useEffect(() => {
    getQueueMembers();
  }, []);

  return (
    <div>
      <Card className="p-3 py-5">
        <div className="">
          <div className="flex justify-between">
            <h1 className="font-semibold text-xl mb-3">Queue Members</h1>
            <AddNewQueueMemberModel getQueueMembers={getQueueMembers} />
          </div>
        </div>
      </Card>
      <Card className="my-5 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueMembers.map((member: QueueMember) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QueueMember;
