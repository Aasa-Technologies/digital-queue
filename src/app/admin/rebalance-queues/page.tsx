"use client";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserData } from "@/utils";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  runTransaction,
  doc,
  serverTimestamp,
  increment,
  orderBy,
  limit,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import moment from "moment";
interface Lot {
  id: string;
  name: string;
}

interface Queue {
  id: string;
  name: string;
  lotId: string;
}

interface QueueMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: number;
  queueId: string;
  queueName: string;
  userId: string;
}

const QueueMember = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queueMembers, setQueueMembers] = useState<QueueMember[]>([]);
  const [todaySession, setTodaySession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  // const user = getUserData();
  useEffect(() => {
    const user = getUserData();
    setUser(user);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLots = async () => {
      try {
        const lotsRef = collection(db, "lots");
        const q = query(lotsRef, where("adminId", "==", user.id));
        const snapshot = await getDocs(q);
        const lotsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Lot)
        );
        setLots(lotsData);
      } catch (error) {
        console.error("Error fetching lots:", error);
        toast.error("Failed to fetch lots");
      }
    };

    const fetchQueues = async () => {
      try {
        const queuesRef = collection(db, "queues");
        const q = query(queuesRef, where("adminId", "==", user.id));
        const snapshot = await getDocs(q);
        const queuesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Queue)
        );
        setQueues(queuesData);
      } catch (error) {
        console.error("Error fetching queues:", error);
        toast.error("Failed to fetch queues");
      }
    };

    const fetchQueueMembers = () => {
      const queueMembersRef = collection(db, "queue_members");
      const q = query(
        queueMembersRef,
        where("adminId", "==", user.id),
        where("status", "in", ["waiting", "processing","temporary_leave"])
      );

      return onSnapshot(
        q,
        async (snapshot) => {
          const members: QueueMember[] = [];
          for (const docs of snapshot.docs) {
            const memberData = docs.data() as any;
            const userDoc = await getDoc(doc(db, "users", memberData.userId));
            const userData = userDoc.data();
            members.push({
              id: docs.id,
              ...memberData,
              name: userData?.name || "",
              email: userData?.email || "",
              phone: userData?.phone || "",
            });
          }
          setQueueMembers(members.sort((a, b) => a.position - b.position));
        },
        (error) => {
          console.error("Error fetching queue members:", error);
          toast.error("Failed to fetch queue members");
        }
      );
    };

    fetchLots();
    fetchQueues();
    fetchQueueMembers();
    fetchSessionData();
  }, [user?.id]);

  const fetchSessionData = async () => {
    try {
      if (!user.id) {
        return;
      }
      const sessionsRef = collection(db, "sessions");
      const sessionQuery = query(sessionsRef, where("adminId", "==", user.id));
      const querySnapshot = await getDocs(sessionQuery);
      const sessions: any[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const today = new Date().toDateString();
      const todaySessionData = sessions.find(
        (session) => new Date(session.startTime).toDateString() === today
      );
      setTodaySession(todaySessionData || null);
    } catch (error: any) {
      console.error("Error fetching sessions: ", error);
      toast.error("Failed to fetch sessions.");
    }
  };

  const rebalanceQueues = async (lotId: string) => {
    try {
      console.log(`[DEBUG] Starting queue rebalancing for lot ${lotId} and admin ${user.id}`);
  
      // Step 1: Get all active queues in the lot
      const queuesRef = collection(db, "queues");
      const queueQuery = query(
        queuesRef,
        where("adminId", "==", user.id),
        where("lotId", "==", lotId),
        where("status", "==", "active")
      );
      const queueSnapshot = await getDocs(queueQuery);
  
      console.log(`[DEBUG] Found ${queueSnapshot.size} active queues in the lot`);
  
      if (queueSnapshot.empty) {
        console.log("[DEBUG] No active queues found in this lot. Exiting.");
        return;
      }
  
      // Step 2: Calculate the average queue length
      let totalQueueLength = 0;
      const queueLengths: { [key: string]: number } = {};
  
      for (const queueDoc of queueSnapshot.docs) {
        const queueId = queueDoc.id;
        const queueMembersRef = collection(db, "queue_members");
        const queueMembersQuery = query(
          queueMembersRef,
          where("queueId", "==", queueId),
          where("status", "in", ["waiting", "processing","temporary_leave"])
        );
        const queueMembersSnapshot = await getDocs(queueMembersQuery);
        const queueLength = queueMembersSnapshot.size;
  
        totalQueueLength += queueLength;
        queueLengths[queueId] = queueLength;
        console.log(`[DEBUG] Queue ${queueId} has ${queueLength} members`);
      }
  
      const averageQueueLength = Math.floor(totalQueueLength / queueSnapshot.size);
      console.log(`[DEBUG] Average queue length: ${averageQueueLength}`);
  
      // Step 3: Identify queues to rebalance
      const queuesToRebalance = Object.entries(queueLengths)
        .filter(([_, length]) => length > averageQueueLength + 1)
        .sort((a, b) => b[1] - a[1]);
  
      console.log(`[DEBUG] Queues to rebalance: ${queuesToRebalance.map(([id, _]) => id).join(', ')}`);
  
      if (queuesToRebalance.length === 0) {
        console.log("[DEBUG] Queues are already balanced. Exiting.");
        return;
      }
  
      // Step 4: Find the shortest queue
      const shortestQueue = Object.entries(queueLengths)
        .sort((a, b) => a[1] - b[1])[0];
  
      console.log(`[DEBUG] Shortest queue: ${shortestQueue[0]} with ${shortestQueue[1]} members`);
  
      // Step 5: Get the session data for average waiting time
      const sessionsRef = collection(db, "sessions");
      const sessionQuery = query(
        sessionsRef,
        where("adminId", "==", user.id),
        where("createdAt", ">=", moment().startOf("day").format()),
        limit(1)
      );
      const sessionSnapshot = await getDocs(sessionQuery);
  
      if (sessionSnapshot.empty) {
        console.log("[DEBUG] No active session found for today. Exiting.");
        return;
      }
  
      const sessionData = sessionSnapshot.docs[0].data();
      const avgWaitingTime = sessionData.avgWaitingTime || 10; // Default to 10 minutes if not set
  
      // Step 6: Rebalance queues
      for (const [queueId, queueLength] of queuesToRebalance) {
        const batch = writeBatch(db);
        const membersToMove = queueLength - averageQueueLength;
        console.log(`[DEBUG] Queue ${queueId}: moving ${membersToMove} members`);
  
        // Get members to move
        const queueMembersRef = collection(db, "queue_members");
        const membersToMoveQuery = query(
          queueMembersRef,
          where("queueId", "==", queueId),
          where("status", "in", ["waiting","temporary_leave","processing"]),
          orderBy("position", "desc"),
          orderBy("joinTime", "desc")
        );
        const membersToMoveSnapshot = await getDocs(membersToMoveQuery);
  
        console.log(`[DEBUG] Found ${membersToMoveSnapshot.size} members to move from queue ${queueId}`);
  
        // Get all members in the shortest queue
        const shortestQueueMembersQuery = query(
          queueMembersRef,
          where("queueId", "==", shortestQueue[0]),
          where("status", "in", ["waiting","temporary_leave","processing"]),
          orderBy("position", "asc")
        );
        const shortestQueueMembersSnapshot = await getDocs(shortestQueueMembersQuery);
        const shortestQueueMembers = shortestQueueMembersSnapshot.docs.map(doc => doc.data());
  
        let lastPersonEndTime = moment().toDate();
  
        if (shortestQueueMembers.length > 0) {
          const lastMember = shortestQueueMembers[shortestQueueMembers.length - 1];
          lastPersonEndTime = lastMember.endTime.toDate();
        }
  
        // Move members to the shortest queue
        for (let i = 0; i < membersToMove && i < membersToMoveSnapshot.size; i++) {
          const memberDoc = membersToMoveSnapshot.docs[i];
          const memberData = memberDoc.data();
  
          console.log(`[DEBUG] Moving member ${memberData.userId} from queue ${queueId} to queue ${shortestQueue[0]}`);
  
          const joinTime = serverTimestamp();
          const endTime = moment(lastPersonEndTime).add(avgWaitingTime, "minutes").toDate();
          const waitingTime = moment(endTime).diff(moment(), "minutes");
  
          // Fetch the current number of members in the shortest queue
          const currentMembersQuery = query(
            queueMembersRef,
            where("queueId", "==", shortestQueue[0]),
            where("status", "in", ["waiting", "temporary_leave", "processing"])
          );
          const currentMembersSnapshot = await getDocs(currentMembersQuery);
          const newPosition = currentMembersSnapshot.size + 1;
  
          // Update member's queue, position, and time-related fields
          batch.update(memberDoc.ref, {
            queueId: shortestQueue[0],
            position: newPosition,
            joinTime: joinTime,
            endTime: endTime,
            waitingTime: waitingTime,
            updatedAt: serverTimestamp()
          });
  
          lastPersonEndTime = endTime;
        }
  
        // Update positions of remaining members in the original queue
        const remainingMembersQuery = query(
          queueMembersRef,
          where("queueId", "==", queueId),
          where("status", "in", ["waiting","temporary_leave","processing"]),
          orderBy("position", "asc")
        );
        const remainingMembersSnapshot = await getDocs(remainingMembersQuery);
  
        console.log(`[DEBUG] Updating positions for ${remainingMembersSnapshot.size} remaining members in queue ${queueId}`);
  
        let lastEndTime = moment().toDate();
        remainingMembersSnapshot.docs.forEach((doc, index) => {
          const memberData = doc.data();
          console.log(`[DEBUG] Updating position for member ${memberData.userId} to ${index + 1}`);
          
          const endTime = moment(lastEndTime).add(avgWaitingTime, "minutes").toDate();
          const waitingTime = moment(endTime).diff(moment(), "minutes");
  
          batch.update(doc.ref, {
            position: index + 1,
            endTime: endTime,
            waitingTime: waitingTime,
            updatedAt: serverTimestamp()
          });
  
          lastEndTime = endTime;
        });

        // Commit the batch for this queue
        await batch.commit();
        console.log(`[DEBUG] Batch committed for queue ${queueId}`);
      }
  
      // Recalculate positions and times for all queues
      for (const queueDoc of queueSnapshot.docs) {
        const queueId = queueDoc.id;
        const batch = writeBatch(db);
        const queueMembersRef = collection(db, "queue_members");
        const queueMembersQuery = query(
          queueMembersRef,
          where("queueId", "==", queueId),
          where("status", "in", ["waiting","temporary_leave","processing"]),
          orderBy("position", "asc")
        );
        const queueMembersSnapshot = await getDocs(queueMembersQuery);
  
        let lastEndTime = moment().toDate();
        queueMembersSnapshot.docs.forEach((doc, index) => {
          const memberData = doc.data();
          console.log(`[DEBUG] Recalculating for member ${memberData.userId} in queue ${queueId}`);
          
          const endTime = moment(lastEndTime).add(avgWaitingTime, "minutes").toDate();
          const waitingTime = moment(endTime).diff(moment(), "minutes");
          console.log({
            position: index + 1,
            endTime: endTime,
            waitingTime: waitingTime,
            updatedAt: serverTimestamp()
          });
  
          batch.update(doc.ref, {
            position: index + 1,
            endTime: endTime,
            waitingTime: waitingTime,
            updatedAt: serverTimestamp()
          });
  
          lastEndTime = endTime;
        });

        // Commit the batch for this queue
        await batch.commit();
        console.log(`[DEBUG] Batch committed for queue ${queueId} after recalculation`);
      }
  
      console.log("[DEBUG] All queues rebalanced successfully");
    } catch (error) {
      console.error("[DEBUG] Error rebalancing queues:", error);
    }
  };

const handleRebalance = async () => {
  lots.forEach(async (lot) => {
    await rebalanceQueues(lot.id);
  });
};
  return (
    <div>
      <Card className="p-3 py-5">
        <div className="">
          <div className="flex justify-between">
            <h1 className="font-semibold text-xl mb-3">
              Rebalance Queue
            </h1>
          </div>
        </div>
        <Button onClick={handleRebalance} className="mb-4">
          Rebalance Queue
        </Button>
      </Card>
      <Card className="my-5 p-3">
        <Accordion type="single" collapsible className="w-full">
          {lots.map((lot) => (
            <AccordionItem key={lot.id} value={lot.id}>
              <AccordionTrigger>{lot.name}</AccordionTrigger>
              <AccordionContent>
                {queues
                  .filter((queue) => queue.lotId === lot.id)
                  .map((queue) => (
                    <Accordion
                      key={queue.id}
                      type="single"
                      collapsible
                      className="w-full ml-4"
                    >
                      <AccordionItem value={queue.id}>
                        <AccordionTrigger>{queue.name}</AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Position</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queueMembers
                                .filter(
                                  (member: any) => member.queueId === queue.id
                                )
                                .map((member: any) => {
                                  console.log(
                                    ">>> ~ QueueMember ~ member:",
                                    member
                                  );
                                  return (
                                    <TableRow key={member.id}>
                                      <TableCell>{member.position}</TableCell>
                                      <TableCell>{member.name}</TableCell>
                                      <TableCell>{member.email}</TableCell>

                                      <TableCell>{member.status}</TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default QueueMember;
