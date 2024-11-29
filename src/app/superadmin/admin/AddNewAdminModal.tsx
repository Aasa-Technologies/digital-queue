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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Eye, EyeOff } from "lucide-react";

const adminFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9}$/, {
    message: "Phone number must be 10 digits without spaces",
  }),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .regex(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/, {
      message:
        "Name can only contain alphanumeric characters and single spaces between words",
    }),
  sessionCost: z
    .number()
    .nonnegative({ message: "Session cost must be zero or positive" }),
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      name: "",
      sessionCost: undefined, // Ensure no prefilled value
      password: "",
    },
  });

  async function onSubmit(data: AdminFormValues) {
    setLoading(true); // Start loading
    try {
      // Check if an admin with the same email already exists
      const adminsRef = collection(db, "admins");
      const q = query(adminsRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Admin with this email already exists");
        setLoading(false);
        return;
      }

      // Check if an admin with the same phone number already exists
      const q2 = query(adminsRef, where("phoneNumber", "==", data.phoneNumber));
      const querySnapshot2 = await getDocs(q2);

      if (!querySnapshot2.empty) {
        toast.error("Admin with this phone number already exists");
        setLoading(false);
        return;
      }

      // If no duplicate, add the new admin
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
    } finally {
      setLoading(false); // Stop loading when done
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
                          maxLength={10}
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
                          placeholder="Enter session cost"
                          value={field.value !== undefined ? field.value : ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value);
                            field.onChange(value);
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
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Enter password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
