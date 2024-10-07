"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { db } from "@/utils/firebase"; // Import your Firestore database instance
import { collection, getDocs, query, where } from "firebase/firestore";
import { getUserData } from "@/utils";
import AddNewSessionModel from "./AddNewSessionModel";

interface SessionData {
  id: string;
  adminId: string;
  avgWaitingTime: string;
  createdAt: string;
  name: string;
  startTime: string;
  status: string;
  updatedAt: string;
}

const Session = () => {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = getUserData();
      setUser(userInfo);
    };

    const fetchSessionData = async () => {
      try {
        if (!user.id) {
          return;
        }
        const sessionsRef = collection(db, "sessions");
        const sessionQuery = query(
          sessionsRef,
          where("adminId", "==", user.id)
        );
        const querySnapshot = await getDocs(sessionQuery);
        const sessions: SessionData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SessionData[]; // Ensure type safety here

        console.log(">>>>", sessions);
        setSessionData(sessions);
      } catch (error: any) {
        console.error("Error fetching sessions: ", error);
        toast.error("Failed to fetch sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchSessionData();
  }, [user.id]);

  return (
    <div>
      <div className="flex justify-between">
        <h1>New Session</h1>
        <AddNewSessionModel user={user} />
      </div>
      <Card className="p-2 my-5">
        {loading && <p>Loading...</p>}
        {!loading && sessionData.length === 0 && <p>No sessions found.</p>}
        {!loading && sessionData.length > 0 && (
          <Accordion type="single" collapsible>
            {sessionData.map((session) => (
              <AccordionItem key={session.id} value={session.id}>
                <AccordionTrigger className="pl-3">
                  {session.name}
                </AccordionTrigger>
                <AccordionContent className="">
                  <div className="flex justify-between">
                    <p className="flex flex-col text-center">
                      <strong>Start Time:</strong>
                      {new Date(session.startTime).toLocaleString()}
                    </p>
                    <p className="flex flex-col text-center">
                      <strong>Average Waiting Time:</strong>
                      {session.avgWaitingTime} minutes
                    </p>
                    <p className="flex flex-col text-center">
                      <strong>Created At:</strong>
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <p className="flex flex-col text-center">
                      <strong>Status</strong>
                      {session.status}
                    </p>
                  </div>
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
