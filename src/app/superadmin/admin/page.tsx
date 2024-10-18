"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import AddNewAdmin from "./AddNewAdminModal";
import { ChevronDown, Loader2, Pencil, ArrowUpDown } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

type Admin = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  sessionCost: number;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
};

type SortConfig = {
  key: keyof Admin;
  direction: "asc" | "desc";
};

const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number" }),
  sessionCost: z
    .number()
    .positive({ message: "Session cost must be positive" }),
});

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "updatedAt",
    direction: "desc",
  });

  const form = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      sessionCost: 0,
    },
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const adminsRef = collection(db, "admins");
      const querySnapshot = await getDocs(query(adminsRef));
      const adminData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || "active",
          } as Admin)
      );
      setAdmins(adminData);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedAdmins = [...admins].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredAdmins = sortedAdmins.filter(
    (admin) =>
      (admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || admin.status === statusFilter)
  );

  const handleSort = (key: keyof Admin) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    form.reset({
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      sessionCost: admin.sessionCost,
    });
  };

  const onSubmit = async (data: z.infer<typeof adminFormSchema>) => {
    if (!editingAdmin) return;

    try {
      const adminsRef = collection(db, "admins");

      // Check if the email exists for a different admin
      const emailQuery = query(
        adminsRef,
        where("email", "==", data.email),
        where("id", "!=", editingAdmin.id)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        toast.error("Admin with this email already exists");
        return;
      }

      // Check if the phone number exists for a different admin
      const phoneQuery = query(
        adminsRef,
        where("phoneNumber", "==", data.phoneNumber),
        where("id", "!=", editingAdmin.id)
      );
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!phoneSnapshot.empty) {
        toast.error("Admin with this phone number already exists");
        return;
      }

      // Update admin data if no conflicts
      const adminRef = doc(db, "admins", editingAdmin.id);
      await updateDoc(adminRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Admin updated successfully");
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Failed to update admin");
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const adminRef = doc(db, "admins", admin.id);
      const newStatus = admin.status === "active" ? "disabled" : "active";
      await updateDoc(adminRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(
        `Admin ₹ {
          newStatus === "active" ? "activated" : "disabled"
        } successfully`
      );
      fetchAdmins();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-extrabold text-2xl">Admins</h1>
        <AddNewAdmin onAdminAdded={fetchAdmins} />
      </div>
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => setStatusFilter("all")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "active"}
              onCheckedChange={() => setStatusFilter("active")}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "disabled"}
              onCheckedChange={() => setStatusFilter("disabled")}
            >
              Disabled
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No admins found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter to find what you're looking for."
              : "Get started by adding a new admin."}
          </p>
          <div className="mt-6">
            <AddNewAdmin onAdminAdded={fetchAdmins} />
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer"
              >
                Name{" "}
                {sortConfig.key === "name" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSort("email")}
                className="cursor-pointer"
              >
                Email{" "}
                {sortConfig.key === "email" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead
                onClick={() => handleSort("sessionCost")}
                className="cursor-pointer"
              >
                Session Cost{" "}
                {sortConfig.key === "sessionCost" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              {/* <TableHead
                onClick={() => handleSort("lotLimit")}
                className="cursor-pointer"
              >
                Lot Limit{" "}
                {sortConfig.key === "lotLimit" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSort("queueLimit")}
                className="cursor-pointer"
              >
                Queue Limit{" "}
                {sortConfig.key === "queueLimit" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead> */}
              <TableHead
                onClick={() => handleSort("status")}
                className="cursor-pointer"
              >
                Status{" "}
                {sortConfig.key === "status" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSort("updatedAt")}
                className="cursor-pointer"
              >
                Last Updated{" "}
                {sortConfig.key === "updatedAt" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.phoneNumber}</TableCell>
                <TableCell>₹{admin.sessionCost.toFixed(2)}</TableCell>
                {/* <TableCell>{admin.lotLimit}</TableCell>
                <TableCell>{admin.queueLimit}</TableCell> */}
                <TableCell>
                  <Switch
                    checked={admin.status === "active"}
                    onCheckedChange={() => handleToggleStatus(admin)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(admin.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAdmin(admin)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-screen-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Make changes to the admin details here. Click save when you're
              done.
            </DialogDescription>
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
