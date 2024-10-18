'use client'
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { getUserData } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface QueueMember {
  id: string;
  position: number;
  queueId: string;
  queueName: string;
  lotId: string;
  lotName: string;
  joinTime: Date;
  waitingTime: number;
  status: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
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

const Reports = () => {
  const [user, setUser] = useState<any>(null);
  const [queueMembers, setQueueMembers] = useState<QueueMember[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error('Error fetching queues:', error);
      toast.error('Failed to fetch queues');
    }
  };

  const fetchQueueMembers = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const queueMembersRef = collection(db, 'queue_members');
      let q = query(queueMembersRef, where('adminId', '==', user.id));

      if (selectedLot) {
        q = query(q, where('lotId', '==', selectedLot));
      }
      if (selectedQueue) {
        q = query(q, where('queueId', '==', selectedQueue));
      }
      if (startDate) {
        q = query(q, where('joinTime', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('joinTime', '<=', endDate));
      }

      const snapshot = await getDocs(q);
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinTime: doc.data().joinTime.toDate(),
      } as QueueMember));

      if (membersData.length === 0) {
        setQueueMembers([]);
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
      const mergedData = membersData.map(member => ({
        ...member,
        name: userData[member.userId]?.name || 'Unknown',
        email: userData[member.userId]?.email || 'Unknown',
        phone: userData[member.userId]?.phoneNumber || 'Unknown',
        lotName: lots.find(lot => lot.id === member.lotId)?.name || 'Unknown',
        queueName: queues.find(queue => queue.id === member.queueId)?.name || 'Unknown',
      }));

      setQueueMembers(mergedData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching queue members:', error);
      toast.error('Failed to fetch queue members');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = queueMembers.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setSelectedLot('');
    setSelectedQueue('');
    setStartDate(undefined);
    setEndDate(undefined);
    setQueueMembers([]);
    setCurrentPage(1);
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Queue Member Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Select onValueChange={setSelectedLot} value={selectedLot}>
          <SelectTrigger>
            <SelectValue placeholder="Select Lot" />
          </SelectTrigger>
          <SelectContent>
            {lots.map(lot => (
              <SelectItem key={lot.id} value={lot.id}>{lot.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedQueue} value={selectedQueue}>
          <SelectTrigger>
            <SelectValue placeholder="Select Queue" />
          </SelectTrigger>
          <SelectContent>
            {queues.filter(queue => !selectedLot || queue.lotId === selectedLot).map(queue => (
              <SelectItem key={queue.id} value={queue.id}>{queue.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {startDate ? format(startDate, 'PPP') : 'Pick start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {endDate ? format(endDate, 'PPP') : 'Pick end date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex gap-3  justify-end mb-4">
        <Button onClick={fetchQueueMembers}>Generate Report</Button>
        <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : queueMembers.length === 0 ? (
        <p>No data found</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Join Time</TableHead>
                <TableHead>Waiting Time (min)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.lotName}</TableCell>
                  <TableCell>{member.queueName}</TableCell>
                  <TableCell>{member.joinTime.toLocaleString()}</TableCell>
                  <TableCell>{member.waitingTime}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(member.status)} text-white capitalize`}>
                      {member.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: Math.ceil(queueMembers.length / itemsPerPage) }, (_, i) => (
              <Button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default Reports;
