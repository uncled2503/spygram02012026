import React from 'react';

interface CustomSearchBarProps {
  query: string; 
  setQuery: (query: string) => void; 
  isLoading: boolean;
}

const CustomSearchBar: React.FC<CustomSearchBarProps> = ({ query, setQuery, isLoading }) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/@/g, '');
    setQuery(sanitizedValue); 
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md mx-auto flex justify-center items-center">
      <label className="relative block w-[350px] flex rounded-full border-2 border-[#373737] py-[15px] px-4">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? 'Searching...' : 'Ex: neymarjr (sem @)'}
          className="bg-transparent outline-none border-none text-[#c5c5c5] text-base w-full text-center focus:outline-none"
          disabled={isLoading}
        />
      </label>
    </form>
  );
};

export default CustomSearchBar;