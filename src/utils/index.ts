"use client";

import { toast } from "sonner";

export const handleResponse = (response: any) => {
  try {
    if (response?.status === 202) toast.error(response?.data?.error);
    else if (response?.status === 500) toast.error(response?.data?.message);
    else if (response?.status == 400) toast.error(response?.data?.error);
    else if (response?.status === 401) {
      toast.error("You are not authorized for the action.");
    } else if (response?.status === 200) {
      toast.success(response?.data?.message);
      return response?.data;
    } else toast.error("Something went wrong. Please contact server admin.");
    console.log(response);

    return false;
  } catch (error) {
    console.error("Error handling response:", error);
    return false;
  }
};

export const getUserData = () => {
  const user = localStorage.getItem("userData")|| null;
  if (user) {
    return JSON.parse(user);
  }
};
