import { useQuery } from '@tanstack/react-query';
import { getInstitutions } from '../api/getInstitutions';

export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'], // The unique cache key
    queryFn: getInstitutions,   // The function that fetches the data
  });
};