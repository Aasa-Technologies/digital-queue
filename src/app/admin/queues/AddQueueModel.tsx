"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getUserData } from "@/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";

const queueSchema = z.object({
  name: z.string().min(1, "Queue name is required"),
  status: z.enum(["active", "inactive"]),
});

type QueueFormValues = z.infer<typeof queueSchema>;

interface AddNewQueueModelProps {
  lotId: string;
  fetchQueue: () => void;
}

export default function AddNewQueueModel({
  lotId,
  fetchQueue,
}: AddNewQueueModelProps) {
  const [open, setOpen] = useState(false);
  const user = getUserData();

  const form = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema),
    defaultValues: {
      name: "",
      status: "active",
    },
  });

  const onSubmit = async (data: QueueFormValues) => {
    if (!lotId) {
      toast.error("Please select a lot first");
      return;
    }

    try {
      const queueData = {
        ...data,
        lotId: lotId,
        adminId: user.id,
        createdAt: moment().format(),
        updatedAt: moment().format(),
      };

      await addDoc(collection(db, "queues"), queueData);

      fetchQueue();
      toast.success("Queue added successfully");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding queue:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Queue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Queue</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter queue name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select queue status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Queue</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
