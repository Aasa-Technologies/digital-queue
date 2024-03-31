"use client";
import React, { useEffect, useState } from "react";
import AddNewLots from "./AddNewLot";
import { toast } from "sonner";
import axios from "axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Lot } from "../queues/page";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/utils";
interface Token {
  _id: string;
  user: string;
  lot: string;
  queue: {
    _id: string;
    name: string;
  };
  session: string;
  owner: {
    _id: string;
    name: string;
  };
  tokenNo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Lots = () => {
  const [lots, setLots] = useState([]);
  const userId = getUserData();
  const [loading, setLoading] = useState(true);

  const fetchLots = async () => {
    try {
      const response = await axios.get(
        `/api/admin/lots/with-queue-tokens?user=${userId}`
      );
      setLots(response.data.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };
  const assignNextLot = async (_id: string) => {
    try {
      const response = await axios.post(`/api/admin/lots/assign-next`, {
        id: _id,
        user: userId,
      });
      console.log("🚀 ~ assignNextLot ~ response:", response);
      toast.success("Next Lot Assign Successfully");
      fetchLots();
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <h1>Lots</h1>
        <AddNewLots />
      </div>
      <Card className="p-2 my-5">
        {loading && <p>Loading...</p>}
        {!loading && lots.length === 0 && <p>No data found</p>}
        {!loading && lots.length > 0 && (
          <Accordion type="single" collapsible>
            {lots.map((lot: any) => (
              <AccordionItem key={lot._id} value={lot._id}>
                <AccordionTrigger className="pl-3">{lot.name}</AccordionTrigger>
                <AccordionContent className="">
                  {lot?.token && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Token No</TableHead>
                          <TableHead>Queue</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Member</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lot?.token.map((token: any) => (
                          <TableRow key={token._id}>
                            <TableCell className="font-medium">
                              {token.tokenNo}
                            </TableCell>
                            <TableCell>{token.queues.name}</TableCell>
                            <TableCell>{token.queue_owners.name}</TableCell>
                            <TableCell>{token.queue_members.name}</TableCell>
                            <TableCell>{token.status}</TableCell>
                            <TableCell>
                              <Button onClick={() => assignNextLot(token._id)}>
                                Assign Next Lot
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Card>
    </div>
  );
};

export default Lots;
