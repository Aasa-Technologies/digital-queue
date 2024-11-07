"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { db } from "@/utils/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import moment from "moment";

const adminFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9}$/, {
    message: "Phone number must be 10 digits without spaces",
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sessionCost: z
    .number()
    .positive({ message: "Session cost must be positive" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }
    ),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AddNewAdmin({
  onAdminAdded,
}: {
  onAdminAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      name: "",
      sessionCost: 0,
      password: "", // Initialize password field
    },
  });

  async function onSubmit(data: AdminFormValues) {
    try {
      // Check if an admin with the same email already exists
      const adminsRef = collection(db, "admins");
      const q = query(adminsRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Admin with this email already exists");
        return;
      }

      // Check if an admin with the same phone number already exists
      const q2 = query(adminsRef, where("phoneNumber", "==", data.phoneNumber));
      const querySnapshot2 = await getDocs(q2);

      if (!querySnapshot2.empty) {
        toast.error("Admin with this phone number already exists");
        return;
      }

      // If no duplicate, add the new admin with moment for timestamps
      await addDoc(adminsRef, {
        ...data,
        status: "active",
        createdAt: moment().format(),
        updatedAt: moment().format(),
      });

      toast.success("Admin added successfully");

      form.reset();
      onAdminAdded();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add admin");
      console.error("Error adding admin:", error);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add New Admin</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the details for the new admin. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone Number"
                          maxLength={10} // Limit input to 10 characters
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01" // Set minimum value to ensure positive cost
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value > 0 ? value : ""); // Ensures non-zero cost
                          }}
                        />
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
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
