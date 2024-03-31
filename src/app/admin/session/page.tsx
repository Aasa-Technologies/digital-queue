"use client";
import React, { useEffect, useState } from "react";
import AddNewSessionModel from "./AddNewSessionModel";
import axios from "axios";
import { toast } from "sonner";
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
import { getUserData } from "@/utils";
const Session = () => {
  const userId = getUserData();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);

  async function getSessionData() {
    try {
      const response = await axios.get(
        `/api/admin/session?user=${userId}`
      );
      setSessionData(response.data.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching queue token:", error);
      setLoading(false);
      toast.error(error.response.data.error);
    }
  }
  useEffect(() => {
    getSessionData();
  }, []);
  return (
    <div>
      <div className="flex justify-between">
        <h1>New Session</h1>
        <AddNewSessionModel />
      </div>
      <Card className="p-2 my-5">
        {loading && <p>Loading...</p>}
        {!loading && sessionData.length === 0 && <p>No data found</p>}
        {!loading && sessionData.length > 0 && (
          <Accordion type="single" collapsible>
            {sessionData.map((session: any) => (
              <AccordionItem key={session._id} value={session._id}>
                <AccordionTrigger className="pl-3">
                  {session.name}
                </AccordionTrigger>
                <AccordionContent className="">
               { !loading && session?.tokens?.length === 0 && <p className="pl-3">No data found</p>}
                  {session?.tokens && session?.tokens?.length > 0 &&(
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Token No</TableHead>
                          <TableHead>Queue</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Member</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {session?.tokens.map((token: any) => (
                          <TableRow key={token._id}>
                            <TableCell className="font-medium">
                              {token.tokenNo}
                            </TableCell>
                            <TableCell>{token.queueData.name}</TableCell>
                            <TableCell>{token.ownerData.name}</TableCell>
                            <TableCell>{token.memberData.name}</TableCell>
                            <TableCell>{token.status}</TableCell>
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

export default Session;
