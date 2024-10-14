"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserData } from "@/utils";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import moment from "moment";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  lotId: z.string().min(1, {
    message: "Please select a lot.",
  }),
  queueId: z.string().min(1, {
    message: "Please select a queue.",
  }),
});

const AddNewQueueOwner = ({ onOwnerAdded }: { onOwnerAdded: () => void }) => {
  const [lots, setLots] = useState<any[]>([]);
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUserData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      lotId: "",
      queueId: "",
    },
  });

  const fetchLots = async () => {
    try {
      const lotsCollection = collection(db, "lots");
      const lotsQuery = query(lotsCollection, where("adminId", "==", user.id));
      const lotsSnapshot = await getDocs(lotsQuery);
      const lotsData = lotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLots(lotsData);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching lots:", error);
      toast.error("Failed to fetch lots");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchQueues = async (lotId: string) => {
    if (!lotId) return;
    try {
      const queuesCollection = collection(db, "queues");
      const queuesQuery = query(
        queuesCollection,
        where("lotId", "==", lotId),
        where("adminId", "==", user.id)
      );
      const queuesSnapshot = await getDocs(queuesQuery);
      const queuesData = queuesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isDisabled: doc.data().ownerId !== undefined
      }));
      setQueues(queuesData);
    } catch (error: any) {
      console.error("Error fetching queues:", error);
      toast.error("Failed to fetch queues");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const selectedQueueData:any = queues.find(queue => queue.id === values.queueId);
      if (!selectedQueueData) {
        toast.error("Selected queue not found");
        return;
      }

      if (selectedQueueData.ownerId) {
        toast.error("This queue already has an owner");
        return;
      }

      // Check if user with same email exists
      const emailQuery = query(collection(db, "queue_owners"), where("email", "==", values.email));
      const emailQuerySnapshot = await getDocs(emailQuery);
      if (!emailQuerySnapshot.empty) {
        toast.error("A queue owner with this email already exists");
        return;
      }

      // Check if user with same phone exists
      const phoneQuery = query(collection(db, "queue_owners"), where("phone", "==", values.phone));
      const phoneQuerySnapshot = await getDocs(phoneQuery);
      if (!phoneQuerySnapshot.empty) {
        toast.error("A queue owner with this phone number already exists");
        return;
      }

      const queueOwnerData = {
        ...values,
        queueName: selectedQueueData.name,
        adminId: user.id,
        createdAt: moment().format(),
        updatedAt: moment().format(),
      };

      // Add queue owner to the queue_owners collection
      const queueOwnerRef = await addDoc(collection(db, "queue_owners"), queueOwnerData);

      // Update the queue document with the owner's ID
      const queueRef = doc(db, "queues", values.queueId);
      await updateDoc(queueRef, {
        ownerId: queueOwnerRef.id,
        updatedAt: moment().format(),
      });

      toast.success("Queue owner added successfully");
      onOwnerAdded();
      form.reset();
      fetchQueues(values.lotId);
    } catch (error: any) {
      console.error("Error adding queue owner:", error);
      toast.error("Failed to add queue owner");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Queue Owner</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Queue Owner</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="lotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Lot</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    fetchQueues(value);
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Lot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lots.map((lot: any) => (
                        <SelectItem
                          key={lot.id}
                          value={lot.id}
                          disabled={lot.isDisabled}
                        >
                          {lot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="queueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Queue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Queue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {queues.map((queue: any) => (
                        <SelectItem
                          key={queue.id}
                          value={queue.id}
                          disabled={queue.isDisabled}
                        >
                          {queue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Queue Owner</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewQueueOwner;
