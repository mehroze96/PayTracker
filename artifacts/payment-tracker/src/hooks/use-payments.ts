import { useQueryClient } from "@tanstack/react-query";
import {
  useListPayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useGetPaymentSummary,
  getListPaymentsQueryKey,
  getGetPaymentSummaryQueryKey,
  ListPaymentsParams,
  GetPaymentSummaryParams,
  CreatePaymentInput
} from "@workspace/api-client-react";

export function usePaymentsQuery(params?: ListPaymentsParams) {
  return useListPayments(params);
}

export function usePaymentSummaryQuery(params?: GetPaymentSummaryParams) {
  return useGetPaymentSummary(params);
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useCreatePayment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetPaymentSummaryQueryKey() });
      },
    },
  });
}

export function useEditPayment() {
  const qc = useQueryClient();
  return useUpdatePayment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetPaymentSummaryQueryKey() });
      },
    },
  });
}

export function useRemovePayment() {
  const qc = useQueryClient();
  return useDeletePayment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetPaymentSummaryQueryKey() });
      },
    },
  });
}
