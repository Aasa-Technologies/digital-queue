"use client";

import React, { useEffect, useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Adjust these imports based on your actual path
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/utils/firebase"; // Adjust the path as necessary
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import moment from "moment";

// Validation schema
const lotSchema = z.object({
  name: z.string().min(1, { message: "Lot name is required" }),
});

type LotFormValues = z.infer<typeof lotSchema>;

const AddNewLots = ({ user, onLotAdded }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: LotFormValues) => {
    try {
      await addDoc(collection(db, "lots"), {
        name: data.name,
        adminId: user?.id,
        status: "active",
        createdAt: moment().format(),
        updatedAt: moment().format(),
      });
      toast.success("Lot added successfully!");

      // Reset the form fields after submission
      onLotAdded();
      form.reset();
      setDialogOpen(false); // Close the dialog
    } catch (error: any) {
      console.error("Error adding lot: ", error);
      toast.error("An error occurred while adding the lot. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setDialogOpen(true)}>Add New Lot</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lots</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter lot name"
                      {...field} // Spread the field properties here
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <Button onClick={form.handleSubmit(handleSubmit)}>Add Lot</Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewLots;
