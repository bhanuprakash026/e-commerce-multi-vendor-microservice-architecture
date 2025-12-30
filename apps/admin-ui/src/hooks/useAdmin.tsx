import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useEffect } from "react";

// fetch admin data from API
const fetchAdminData = async () => {
  const response = await axiosInstance.get("/api/logged-in-admin");
  console.log("API Response:", response.data);
  console.log("Admin data:", response.data.admin);
  return response.data.admin;
};

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["admin"],
    queryFn: fetchAdminData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  console.log("useAdmin - isLoading:", isLoading, "admin:", admin, "isError:", isError);

  useEffect(() => {
    if (!isLoading && !admin) {
      console.log("Redirecting to login because admin is undefined");
      window.location.href = "/";
    }
  }, [isLoading, admin])

  return { admin, isLoading, isError, refetch };
}
export default useAdmin;