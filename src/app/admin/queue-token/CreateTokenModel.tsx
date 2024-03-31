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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lot, queueInterface } from "../queues/page";
import { QueueMember } from "../queue-member/page";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon, CheckIcon, CheckboxIcon } from "@radix-ui/react-icons";
import { getUserData } from "@/utils";

const CreateTokenModel = () => {
  const userId = getUserData();

  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [loading, setLoading] = useState(true);
  const [queueMembers, setQueueMembers] = useState<QueueMember[]>([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const fetchLots = async () => {
    try {
      const response = await axios.get(`/api/admin/lots?user=${userId}`);
      setLots(response.data.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log(selectedLot, selectedQueue);

    try {
      const res = await axios.post("/api/admin/queue-token", {
        user: userId,
        lot: selectedLot,
        queue: selectedQueue,
        member: value,
      });
      if (res) {
        toast.success(res.data.message);
        setSelectedLot("");
        setSelectedQueue("");
        setValue("");
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };
  const fetchQueues = async () => {
    try {
      const res = await axios.get(
        `/api/admin/queues?lotId=${selectedLot}&userId=${userId}`
      );
      setQueues(res.data.data);
    } catch (error: any) {
      console.error("Error fetching queues:", error);
      toast.error(error.response.data.error);
    }
  };

  async function getQueueMembers() {
    try {
      const response = await axios.get(`/api/admin/queue-member/all`);
      setQueueMembers(response.data.data);
    } catch (error: any) {
      console.error("Error fetching queue members:", error);
      toast.error(error.response.data.error);
    }
  }

  useEffect(() => {
    if (selectedLot) fetchQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLot]);
  useEffect(() => {
    getQueueMembers();
    fetchLots();
  }, []);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Token</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Token</DialogTitle>
          </DialogHeader>

          <Label htmlFor="lot">Select Lot:</Label>
          <div>
            <Select onValueChange={(e) => setSelectedLot(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select Lot" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot: Lot) => (
                  <SelectItem key={lot._id} value={lot._id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label htmlFor="lot">Select Queue</Label>
          <Select onValueChange={(e) => setSelectedQueue(e)}>
            <SelectTrigger className="">
              <SelectValue placeholder="Select Queue" />
            </SelectTrigger>
            <SelectContent>
              {queues.map((queue: queueInterface) => (
                <SelectItem
                  key={queue._id}
                  value={queue._id}
                  disabled={queue.isDisabled}
                >
                  {queue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="lot">Select Member</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className=" justify-between"
              >
                {value
                  ? queueMembers.find((member) => member.email === value)?.name
                  : "Select Member Name..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[460px] p-0">
              <Command>
                <CommandInput placeholder="Search Members..." className="h-9" />
                <CommandEmpty>No Member found.</CommandEmpty>
                <CommandList>
                  {queueMembers.map((member: QueueMember) => (
                    <CommandItem
                      key={member._id}
                      value={member.email}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === member.email ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {member.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button onClick={handleSubmit} className="mt-2">
            Generate Token
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateTokenModel;
