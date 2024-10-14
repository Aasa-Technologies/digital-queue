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
        where("status", "in", ["waiting", "processing"])
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
  const rebalanceQueues = async () => {
    try {
      await runTransaction(db, async (transaction) => {
        // Step 1: Get all active lots for the admin
        const lotsRef = collection(db, "lots");
        const lotQuery = query(
          lotsRef,
          where("adminId", "==", user.id),
          where("status", "==", "active"),
          orderBy("createdAt", "asc")
        );
        const lotSnapshot = await getDocs(lotQuery);
        const lots = lotSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Step 2: Gather all queues and calculate the load
        const lotQueuesMap: any = {};
        let totalMembers = 0;

        for (const lot of lots) {
          const queuesRef = collection(db, "queues");
          const queueQuery = query(
            queuesRef,
            where("lotId", "==", lot.id),
            where("status", "==", "active"),
            where("ownerId", "!=", "")
          );
          const queueSnapshot = await getDocs(queueQuery);
          const lotQueues = [];

          for (const queueDoc of queueSnapshot.docs) {
            const queueData: any = { ...queueDoc.data(), id: queueDoc.id };
            const queueMembersRef = collection(db, "queue_members");
            const queueMembersQuery = query(
              queueMembersRef,
              where("queueId", "==", queueDoc.id),
              where("status", "in", ["waiting", "processing"])
            );
            const queueMembersSnapshot = await getDocs(queueMembersQuery);
            const queueLength = queueMembersSnapshot.size;

            queueData.currentSize = queueLength;
            totalMembers += queueLength;
            lotQueues.push(queueData);
          }

          lotQueuesMap[lot.id] = lotQueues;
        }

        // Step 3: Calculate the average members per queue based on the session
        const averageMembers = todaySession.avgWaitingTime || 10;

        // Step 4: Rebalance members for each lot
        for (const lotId in lotQueuesMap) {
          const lotQueues = lotQueuesMap[lotId];
          const overloadedQueues = [];
          const underloadedQueues = [];

          // Separate overloaded and underloaded queues within the lot
          for (const queue of lotQueues) {
            if (queue.currentSize > averageMembers) {
              overloadedQueues.push(queue);
            } else if (queue.currentSize < averageMembers) {
              underloadedQueues.push(queue);
            }
          }

          // Step 5: Rebalance members within the lot
          for (const overloadedQueue of overloadedQueues) {
            const excessMembersCount =
              overloadedQueue.currentSize - averageMembers;

            // Fetch the members that need to be reassigned
            const queueMembersRef = collection(db, "queue_members");
            const membersQuery = query(
              queueMembersRef,
              where("queueId", "==", overloadedQueue.id),
              where("status", "in", ["waiting", "processing"]),
              orderBy("createdAt", "desc"),
              limit(excessMembersCount)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const membersToMove: any = membersSnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));

            // Move members to underloaded queues within the same lot
            for (const member of membersToMove) {
              if (underloadedQueues.length === 0) break;

              // Always move to the first underloaded queue
              let underloadedQueue = underloadedQueues[0];

              // Determine new position in the underloaded queue
              const newPosition = underloadedQueue.currentSize + 1;

              // Fetch the last member in the underloaded queue to calculate new times
              const lastMemberQuery = query(
                collection(db, "queue_members"),
                where("queueId", "==", underloadedQueue.id),
                where("status", "in", ["waiting", "processing"]),
                orderBy("position", "desc"),
                limit(1)
              );
              const lastMemberSnapshot = await getDocs(lastMemberQuery);
              let startTime, endTime, waitingTime;

              const averageWaitTime = todaySession.avgWaitingTime || 10;

              if (!lastMemberSnapshot.empty) {
                const lastMember = lastMemberSnapshot.docs[0].data();
                const lastEndTime = lastMember.endTime.toDate();

                // Start after the last member ends
                startTime = moment(lastEndTime);
                endTime = moment(startTime)
                  .add(averageWaitTime, "minutes")
                  .toDate();
                waitingTime = moment(endTime).diff(
                  moment(startTime),
                  "minutes"
                );
              } else {
                // If no members in queue, start now
                startTime = serverTimestamp();
                endTime = moment().add(averageWaitTime, "minutes").toDate();
                waitingTime = averageWaitTime;
              }

              // Reassign the member to the underloaded queue
              const newQueueMemberRef = doc(db, "queue_members", member.id);

              transaction.update(newQueueMemberRef, {
                queueId: underloadedQueue.id,
                lotId: underloadedQueue.lotId,
                position: newPosition,
                startTime: startTime,
                endTime: endTime,
                waitingTime: waitingTime,
                updatedAt: serverTimestamp(),
              });

              // Update the underloaded queue stats
              transaction.update(doc(db, "queues", underloadedQueue.id), {
                currentSize: increment(1),
              });
              underloadedQueue.currentSize += 1;

              // Update the overloaded queue stats
              transaction.update(doc(db, "queues", overloadedQueue.id), {
                currentSize: increment(-1),
              });
              overloadedQueue.currentSize -= 1;

              // If the underloaded queue becomes balanced, remove it from the list
              if (underloadedQueue.currentSize >= averageMembers) {
                underloadedQueues.shift();
              }
            }
          }
        }

        // Step 6: Success message
        toast.success("Queues have been successfully rebalanced!");
      });
    } catch (error) {
      console.error("Error rebalancing queues:", error);
      toast.error("An error occurred while rebalancing queues.");
    }
  };

  return (
    <div>
      <Card className="p-3 py-5">
        <div className="">
          <div className="flex justify-between">
            <h1 className="font-semibold text-xl mb-3">
              Lots, Queues, and Members
            </h1>
          </div>
        </div>
        <Button onClick={() => rebalanceQueues()} className="mb-4">
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
