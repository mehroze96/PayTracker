import { useQueryClient } from "@tanstack/react-query";
import {
  useListClients,
  useCreateClient,
  useDeleteClient,
  getListClientsQueryKey,
  getListPaymentsQueryKey,
  getGetPaymentSummaryQueryKey
} from "@workspace/api-client-react";

export function useClientsQuery() {
  return useListClients();
}

export function useAddClient() {
  const qc = useQueryClient();
  return useCreateClient({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListClientsQueryKey() });
      },
    },
  });
}

export function useRemoveClient() {
  const qc = useQueryClient();
  return useDeleteClient({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListClientsQueryKey() });
        // Might impact payments lists
        qc.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetPaymentSummaryQueryKey() });
      },
    },
  });
}
