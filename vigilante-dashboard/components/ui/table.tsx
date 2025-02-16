import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      {children}
    </table>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="bg-gray-200">
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <tbody className="bg-white">
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <tr className="border-b hover:bg-gray-100">
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <td className={`p-2 ${className}`}>
      {children}
    </td>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <th className={`p-2 text-left ${className}`}>
      {children}
    </th>
  );
};