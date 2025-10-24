export interface TableColumn {
  name: string;
}

export interface TableRow {
  id: string;
  data: string[];
}

export interface ParsedCommand {
  type: 'create' | 'add' | 'unknown';
  columns?: TableColumn[];
  rowData?: string[];
}

export const parseVoiceCommand = (transcript: string): ParsedCommand => {
  const lowerTranscript = transcript.toLowerCase().trim();

  // Check for create table command
  const createPatterns = [
    /create\s+(?:a\s+)?table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
    /make\s+(?:a\s+)?table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
    /new\s+table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
  ];

  for (const pattern of createPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const columnCount = parseInt(match[1]);
      const columnNamesStr = match[2];
      const columnNames = columnNamesStr
        .split(/[,،\s]+and\s+|[,،]\s*/)
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (columnNames.length > 0) {
        return {
          type: 'create',
          columns: columnNames.slice(0, columnCount).map(name => ({ name }))
        };
      }
    }
  }

  // Check for add row command
  const addPatterns = [
    /add\s+(?:a\s+)?row[:\s]+(.+)/i,
    /insert\s+(?:a\s+)?row[:\s]+(.+)/i,
    /new\s+row[:\s]+(.+)/i,
  ];

  for (const pattern of addPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const rowDataStr = match[1];
      const rowData = rowDataStr
        .split(/[,،]\s*/)
        .map(value => value.trim())
        .filter(value => value.length > 0);

      if (rowData.length > 0) {
        return {
          type: 'add',
          rowData
        };
      }
    }
  }

  return { type: 'unknown' };
};

export const exportToCSV = (columns: TableColumn[], rows: TableRow[]): string => {
  const headers = columns.map(col => col.name).join(',');
  const rowsData = rows.map(row => row.data.join(',')).join('\n');
  return `${headers}\n${rowsData}`;
};

export const downloadCSV = (csvContent: string, filename: string = 'table.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
