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
import AddNewLot from "./AddNewLot";
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
import { getUserData } from "@/utils";

type Lot = {
  id: string;
  name: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
};

type SortConfig = {
  key: keyof Lot;
  direction: "asc" | "desc";
};

const lotFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export default function Lots() {
  const [user, setUser] = useState<any>({});

  const [lots, setLots] = useState<Lot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "updatedAt",
    direction: "desc",
  });

  const form = useForm<z.infer<typeof lotFormSchema>>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = getUserData();
      setUser(userInfo);
    };

    fetchLots();
    fetchUserData();
  }, [user?.id]);

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const adminId = user?.id; // Replace this with the actual user ID logic
      if (!adminId) return;
      const lotsRef = collection(db, "lots");
      const querySnapshot = await getDocs(
        query(lotsRef, where("adminId", "==", adminId))
      );
      const lotData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || "active",
          } as Lot)
      );
      setLots(lotData);
    } catch (error) {
      console.error("Error fetching lots:", error);
      toast.error("Failed to fetch lots");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedLots = [...lots].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredLots = sortedLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || lot.status === statusFilter)
  );

  const handleSort = (key: keyof Lot) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    form.reset({
      name: lot.name,
    });
  };

  const onSubmit = async (data: z.infer<typeof lotFormSchema>) => {
    if (!editingLot) return;

    try {
      const lotsRef = collection(db, "lots");

      // Check if the name exists for a different lot
      const nameQuery = query(
        lotsRef,
        where("name", "==", data.name),
        where("id", "!=", editingLot.id)
      );
      const nameSnapshot = await getDocs(nameQuery);

      if (!nameSnapshot.empty) {
        toast.error("Lot with this name already exists");
        return;
      }

      // Update lot data if no conflicts
      const lotRef = doc(db, "lots", editingLot.id);
      await updateDoc(lotRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Lot updated successfully");
      setEditingLot(null);
      fetchLots();
    } catch (error) {
      console.error("Error updating lot:", error);
      toast.error("Failed to update lot");
    }
  };

  const handleToggleStatus = async (lot: Lot) => {
    try {
      const lotRef = doc(db, "lots", lot.id);
      const newStatus = lot.status === "active" ? "disabled" : "active";
      await updateDoc(lotRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(
        `Lot ${newStatus === "active" ? "activated" : "disabled"} successfully`
      );
      fetchLots();
    } catch (error) {
      console.error("Error toggling lot status:", error);
      toast.error("Failed to update lot status");
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-extrabold text-2xl">Lots</h1>
        <AddNewLot onLotAdded={fetchLots} />
      </div>
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by name"
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
      ) : filteredLots.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No lots found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter to find what you're looking for."
              : "Get started by adding a new lot."}
          </p>
          <div className="mt-6">
            <AddNewLot onLotAdded={fetchLots} />
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
                onClick={() => handleSort("status")}
                className="cursor-pointer"
              >
                Status{" "}
                {sortConfig.key === "status" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell>{lot.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={lot.status === "active"}
                    onCheckedChange={() => handleToggleStatus(lot)}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleEditLot(lot)} variant="outline">
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog
        open={Boolean(editingLot)}
        onOpenChange={() => setEditingLot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lot</DialogTitle>
            <DialogDescription>
              Make changes to your lot here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingLot(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
