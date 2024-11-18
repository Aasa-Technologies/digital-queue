"use client";
import React, { useEffect, useState } from "react";
import AddNewQueueOwner from "./AddNewQueueOwner";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getUserData } from "@/utils";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Loader2 } from "lucide-react";

export interface QueueOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lotId: string;
  queueId: string;
  queueName: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueOwners = () => {
  const [queueOwners, setQueueOwners] = useState<QueueOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<QueueOwner>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function fetchQueueOwners() {
    const user = getUserData();
    if (!user.id) return;

    setLoading(true);
    try {
      const queueOwnersCollection = collection(db, "queue_owners");
      const queueOwnersQuery = query(queueOwnersCollection, where("adminId", "==", user.id));
      const queueOwnersSnapshot = await getDocs(queueOwnersQuery);
      const queueOwnersData = queueOwnersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as QueueOwner));
      setQueueOwners(queueOwnersData);
    } catch (error: any) {
      console.error("Error fetching queue owners:", error);
      toast.error("Failed to fetch queue owners");
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (owner: QueueOwner) => {
    setEditingOwnerId(owner.id);
    setFormData({ ...owner });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be a 10-digit number.";
    }
    if (!formData.queueName || formData.queueName.trim().length === 0) {
      newErrors.queueName = "Queue name cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !editingOwnerId) return;

    try {
      const ownerDocRef = doc(db, "queue_owners", editingOwnerId);
      await updateDoc(ownerDocRef, { ...formData, updatedAt: new Date() });
      toast.success("Queue owner updated successfully!");
      fetchQueueOwners(); // Refresh data
      setEditingOwnerId(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating queue owner:", error);
      toast.error("Failed to update queue owner");
    }
  };

  const handleCancel = () => {
    setEditingOwnerId(null);
    setFormData({});
    setErrors({});
  };

  useEffect(() => {
    fetchQueueOwners();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className="p-3 py-7 flex justify-between">
        <h1 className="font-semibold text-xl">Queue Owners</h1>
        <AddNewQueueOwner onOwnerAdded={fetchQueueOwners} />
      </Card>
      <Card className="my-5 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueOwners.map((owner) => (
              <TableRow key={owner.id}>
                {editingOwnerId === owner.id ? (
                  <>
                    <TableCell>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className={`w-full border px-2 py-1 ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </TableCell>
                    <TableCell>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className={`w-full border px-2 py-1 ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className={`w-full border px-2 py-1 ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        name="queueName"
                        value={formData.queueName || ""}
                        onChange={handleInputChange}
                        className={`w-full border px-2 py-1 ${errors.queueName ? "border-red-500" : ""}`}
                      />
                      {errors.queueName && <p className="text-red-500 text-sm">{errors.queueName}</p>}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={handleSave}
                        className="text-green-500 hover:underline mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{owner.name}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.phone}</TableCell>
                    <TableCell>{owner.queueName}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleEditClick(owner)}
                        className="text-black hover:underline"
                      >
                        Edit
                      </button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default QueueOwners;
