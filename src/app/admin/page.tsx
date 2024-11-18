"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  documentId,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { getUserData } from "@/utils";

interface QueueMember {
  id: string;
  userId: string;
  lotId: string;
  queueId: string;
  joinTime: Date;
  status: string;
  name?: string;
  email?: string;
  phone?: string;
  lotName?: string;
  queueName?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface Lot {
  id: string;
  name: string;
  adminId: string;
}

interface Queue {
  id: string;
  name: string;
  adminId: string;
  lotId: string;
}

const AdminHome = () => {
  const [user, setUser] = useState<any>(null);
  const [adminId, setAdminId] = useState("");
  const [lotsCount, setLotsCount] = useState(0);
  const [queuesCount, setQueuesCount] = useState(0);
  const [membersJoinCount, setMembersJoinCount] = useState(0);
  const [timeRange, setTimeRange] = useState("today");
  const [membersChartData, setMembersChartData] = useState<any>([]);
  const [recentQueueMembers, setRecentQueueMembers] = useState<QueueMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const qrRef = useRef<HTMLDivElement>(null); // Reference for QR code


  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    if (userData?.id) {
      fetchLots(userData.id);
      fetchQueues(userData.id);
    }
  }, []);

  const fetchLots = async (adminId: string) => {
    try {
      const lotsRef = collection(db, 'lots');
      const q = query(lotsRef, where('adminId', '==', adminId));
      const snapshot = await getDocs(q);
      const lotsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lot));
      setLots(lotsData);
      setLotsCount(lotsData.length);
    } catch (error) {
      console.error('Error fetching lots:', error);
      toast.error('Failed to fetch lots');
    }
  };

  const fetchQueues = async (adminId: string) => {
    try {
      const queuesRef = collection(db, 'queues');
      const q = query(queuesRef, where('adminId', '==', adminId));
      const snapshot = await getDocs(q);
      const queuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Queue));
      setQueues(queuesData);
      setQueuesCount(queuesData.length);
    } catch (error) {
      console.error('Error fetching queues:', error);
      toast.error('Failed to fetch queues');
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngFile;
          downloadLink.download = "QRCode.png";
          downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const now = new Date();
      let startDate;

      switch (timeRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "previousMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case "thisYear":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      const membersQuery = query(
        collection(db, "queue_members"),
        where("adminId", "==", user.id),
        where("createdAt", ">=", startDate)
      );
      const membersSnapshot = await getDocs(membersQuery);
      setMembersJoinCount(membersSnapshot.size);

      // Generate chart data for members
      const generateChartData = (snapshot: any) => {
        const data: { [key: string]: number } = {};
        snapshot.forEach((doc: any) => {
          const date = doc.data().createdAt.toDate().toLocaleDateString();
          data[date] = (data[date] || 0) + 1;
        });
        return Object.entries(data).map(([date, count]) => ({ date, count }));
      };

      setMembersChartData(generateChartData(membersSnapshot));

      fetchRecentMembers();
    };
    
    if (user?.id) {
      fetchData();
    }
  }, [user, timeRange]);

  const fetchRecentMembers = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const queueMembersRef = collection(db, 'queue_members');
      let q = query(queueMembersRef, where('adminId', '==', user.id), orderBy('createdAt', 'desc'), limit(10));

      const snapshot = await getDocs(q);
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinTime: doc.data().createdAt.toDate(),
      } as QueueMember));

      if (membersData.length === 0) {
        setRecentQueueMembers([]);
        setIsLoading(false);
        return;
      }

      // Fetch user data for each queue member
      const userIds = membersData.map(member => member.userId);
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where(documentId(), 'in', userIds));
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as User;
        return acc;
      }, {} as Record<string, User>);

      // Merge user data with queue member data
      const mergedData = membersData.map(member => {
        const matchingLot = lots.find(lot => lot.id === member.lotId);
        const matchingQueue = queues.find(queue => queue.id === member.queueId);

        return {
          ...member,
          name: userData[member.userId]?.name || 'Unknown',
          email: userData[member.userId]?.email || 'Unknown',
          phone: userData[member.userId]?.phoneNumber || 'Unknown',
          lotId: member.lotId,
          queueId: member.queueId,
          lotName: matchingLot?.name || 'Unknown',
          queueName: matchingQueue?.name || 'Unknown',
        };
      });

      console.log(">>> ~ mergedData ~ mergedData:", mergedData);

      setRecentQueueMembers(mergedData);
    } catch (error) {
      console.error('Error fetching queue members:', error);
      toast.error('Failed to fetch queue members');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
  <div ref={qrRef}>
  <button
    onClick={downloadQRCode}
    className="text-black px-2 py-2 rounded mb-3 mr-4 border border-zinc-800"
  >
    Download QR Code
  </button>
  <div className="flex justify-center">
    <QRCodeSVG value={user?.id || ""} size={100}/>
    </div>
  </div>
</div>
      <div className="mb-6">
        <Select onValueChange={(value) => {
          setTimeRange(value);
          fetchRecentMembers();
        }} defaultValue={timeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="previousMonth">Previous Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Lots Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{lotsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Queues Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{queuesCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Members Join Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{membersJoinCount}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-md">Queue Members Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={membersChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Recent Queue Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Name</TableHead>
                  <TableHead className="text-sm">Queue</TableHead>
                  <TableHead className="text-sm">Lot</TableHead>
                  <TableHead className="text-sm">Join Time</TableHead>
                  <TableHead className="text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQueueMembers.map((member: QueueMember) => (
                  <TableRow key={member.id}>
                    <TableCell className="text-sm">{member.name}</TableCell>
                    <TableCell className="text-sm">{member.queueName}</TableCell>
                    <TableCell className="text-sm">{member.lotName}</TableCell>
                    <TableCell className="text-sm">
                      {member.joinTime.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs">{member.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
