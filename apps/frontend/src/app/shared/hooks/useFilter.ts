import { useState } from 'react';

const useFilter = <T>(
  data: T[],
  filterFn: (item: T, searchTerm: string) => boolean
) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = data.filter((item) => filterFn(item, searchTerm));

  return { filteredData, searchTerm, setSearchTerm };
};

export default useFilter;
