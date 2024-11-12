"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { db } from "@/utils/firebase";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { getUserData } from "@/utils";
import AddNewSessionModel from "./AddNewSessionModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [todaySession, setTodaySession] = useState<SessionData | null>(null);

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
        const sessionQuery = query(sessionsRef, where("adminId", "==", user.id));
        const querySnapshot = await getDocs(sessionQuery);
        const sessions: SessionData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SessionData[];

        const today = new Date().toDateString();
        const todaySessionData = sessions.find(
          (session) => new Date(session.startTime).toDateString() === today
        );
        setTodaySession(todaySessionData || null);
        setSessionData(
          sessions.filter((session) => session.id !== todaySessionData?.id)
        );
      } catch (error: any) {
        console.error("Error fetching sessions: ", error);
        toast.error("Failed to fetch sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchSessionData();
  }, [user?.id]);

  // Function to deactivate a session
  const deactivateSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, { status: "deactivated" });
      toast.success("Session deactivated successfully");
      // Refresh session data after deactivation
      setSessionData((prevData) =>
        prevData.map((session) =>
          session.id === sessionId ? { ...session, status: "deactivated" } : session
        )
      );
    } catch (error) {
      console.error("Error deactivating session:", error);
      toast.error("Failed to deactivate session.");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <AddNewSessionModel user={user} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Card className="p-4 mb-5">
            <h2 className="text-xl font-semibold mb-3">Today's Session</h2>
            {todaySession ? (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <strong>Name:</strong> {todaySession.name}
                </div>
                <div>
                  <strong>Start Time:</strong>{" "}
                  {new Date(todaySession.startTime).toLocaleString()}
                </div>
                <div>
                  <strong>Average Waiting Time:</strong>{" "}
                  {todaySession.avgWaitingTime} minutes
                </div>
                <div>
                  <strong>Status:</strong> {todaySession.status}
                </div>
              </div>
            ) : (
              <p>No session scheduled for today.</p>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-3">All Sessions</h2>
            {sessionData.length === 0 ? (
              <p>No other sessions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Average Waiting Time</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead> {/* New column for actions */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionData.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.name}</TableCell>
                      <TableCell>{session.avgWaitingTime} minutes</TableCell>
                      <TableCell>
                        {new Date(session.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {session.status !== "deactivated" ? (
                          <button
                            onClick={() => deactivateSession(session.id)}
                            className="text-red-500"
                          >
                            Deactivate
                          </button>
                        ) : (
                          "Deactivated"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Session;
