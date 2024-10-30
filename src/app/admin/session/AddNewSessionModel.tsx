"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Validation schema
const sessionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .refine((value) => value.trim().length > 0, {
      message: "Name cannot be empty or just spaces",
    }),
  avgWaitingTime: z.coerce
    .number()
    .min(1, { message: "Average waiting time must be at least 1 minute" }),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

const AddNewSessionModel = ({ user }: any) => {
  const [hasSessionToday, setHasSessionToday] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      avgWaitingTime: 1,
    },
  });

  const checkSessionToday = async () => {
    if (!user?.id) return;
    const sessionsRef = collection(db, "sessions");
    const today = moment().startOf("day");
    const tomorrow = moment(today).add(1, "days");
    const sessionTodayQuery = query(
      sessionsRef,
      where("adminId", "==", user?.id),
      where("createdAt", ">=", today.toDate()),
      where("createdAt", "<", tomorrow.toDate())
    );

    const querySnapshot = await getDocs(sessionTodayQuery);
    setHasSessionToday(!querySnapshot.empty);
  };

  useEffect(() => {
    checkSessionToday();
  }, [user]);

  const onSubmit = async (data: SessionFormValues) => {
    if (hasSessionToday) {
      toast.error(
        "You have already created a session today. Only one session per day is allowed."
      );
      return;
    }

    try {
      const sessionData = {
        ...data,
        adminId: user?.id,
        startTime: moment().format(),
        status: "active",
        createdAt: moment().format(),
        updatedAt: moment().format(),
      };

      await addDoc(collection(db, "sessions"), sessionData);
      toast.success("Session added successfully!");

      form.reset();
      checkSessionToday();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding session: ", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)}>Add New Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
          {hasSessionToday && (
            <p className="text-red-500">
              You have already created a session today. Only one session per day is allowed.
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Session Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the name of the session.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avgWaitingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Waiting Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter average waiting time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit" disabled={hasSessionToday}>
                Add Session
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewSessionModel;
